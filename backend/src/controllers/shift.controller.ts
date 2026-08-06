import { Request, Response } from 'express';
import { prisma } from '../db';
import { sendTelegramMessage } from '../utils/telegram';

export const getActiveShift = async (req: Request, res: Response) => {
  try {
    const { cashierId } = req.query;

    const shift = await prisma.shift.findFirst({
      where: {
        ...(cashierId ? { cashierId: String(cashierId) } : {}),
        status: 'OPEN'
      },
      include: {
        cashier: true,
        orders: {
          where: { status: 'COMPLETED' }
        }
      }
    });

    if (!shift) {
      return res.status(200).json({ activeShift: null });
    }

    // Calculate total orders revenue for preview
    const totalCash = shift.orders
      .filter(o => o.paymentType === 'CASH')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalCard = shift.orders
      .filter(o => o.paymentType === 'CARD')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalQr = shift.orders
      .filter(o => o.paymentType === 'CLICK_PAYME')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return res.json({
      activeShift: {
        ...shift,
        ordersCount: shift.orders.length,
        summary: {
          totalCash,
          totalCard,
          totalQr,
          totalRevenue: totalCash + totalCard + totalQr
        }
      }
    });
  } catch (error: any) {
    console.error('Get Active Shift Error:', error);
    return res.status(500).json({ error: 'Smena ma\'lumotlarini olishda xatolik' });
  }
};

export const openShift = async (req: Request, res: Response) => {
  try {
    const { cashierId, initialCash } = req.body;

    // Check if there is already an open shift
    const existing = await prisma.shift.findFirst({
      where: { cashierId, status: 'OPEN' }
    });

    if (existing) {
      return res.status(400).json({ error: 'Sizda allaqachon ochiq smena mavjud!' });
    }

    const shift = await prisma.shift.create({
      data: {
        cashierId,
        initialCash: Number(initialCash) || 0,
        status: 'OPEN'
      }
    });

    return res.status(201).json({ message: 'Smena muvaffaqiyatli ochildi', shift });
  } catch (error: any) {
    console.error('Open Shift Error:', error);
    return res.status(500).json({ error: 'Smena ochishda xatolik' });
  }
};

export const closeShiftBlind = async (req: Request, res: Response) => {
  try {
    const { shiftId, declaredCash, declaredCard, declaredQr, notes } = req.body;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { 
        cashier: true,
        orders: { where: { status: 'COMPLETED' } } 
      }
    });

    if (!shift || shift.status !== 'OPEN') {
      return res.status(400).json({ error: 'Ochiq smena topilmadi yoki allaqachon yopilgan' });
    }

    // 1. Calculate EXPECTED figures from backend data (Hidden from Cashier during input)
    const totalCashOrders = shift.orders
      .filter(o => o.paymentType === 'CASH')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const expectedCash = shift.initialCash + totalCashOrders;

    const decCash = Number(declaredCash) || 0;
    const decCard = Number(declaredCard) || 0;
    const decQr = Number(declaredQr) || 0;

    const difference = decCash - expectedCash; // Negative = shortage (kamchilik)

    let auditStatus: 'BALANCED' | 'SHORTAGE' | 'SURPLUS' = 'BALANCED';
    if (difference < 0) {
      auditStatus = 'SHORTAGE';
    } else if (difference > 0) {
      auditStatus = 'SURPLUS';
    }

    // 2. Perform Transaction to update shift and save audit record
    const result = await prisma.$transaction(async (tx) => {
      const audit = await tx.shiftCashAudit.create({
        data: {
          shiftId: shift.id,
          expectedCash,
          declaredCash: decCash,
          difference,
          declaredCard: decCard,
          declaredQr: decQr,
          status: auditStatus,
          notes: notes || null
        }
      });

      const updatedShift = await tx.shift.update({
        where: { id: shift.id },
        data: {
          status: 'CLOSED',
          closedAt: new Date()
        }
      });

      // Log anti-fraud event if there is a shortage or surplus
      if (auditStatus !== 'BALANCED') {
        await tx.auditLog.create({
          data: {
            userId: shift.cashierId,
            action: 'SHIFT_DISCREPANCY',
            detailsJson: JSON.stringify({
              shiftId: shift.id,
              status: auditStatus,
              difference,
              declaredCash: decCash,
              expectedCash
            })
          }
        });
      }

      return { audit, shift: updatedShift };
    });

    // Fire and forget Telegram Z-Report Notification
    const message = `
🧾 <b>Z-REPORT (SMENA YOPILDI)</b>

👤 <b>Kassir:</b> ${shift.cashier.fullName} (${shift.cashier.phone})
📅 <b>Ochilgan:</b> ${new Date(shift.openedAt).toLocaleString('uz-UZ')}
📅 <b>Yopilgan:</b> ${new Date().toLocaleString('uz-UZ')}

💰 <b>Kassadagi Boshlang'ich Pul:</b> ${shift.initialCash.toLocaleString('uz-UZ')} so'm

<b>--- KASSA HISOB-KITOBI ---</b>
💵 Kutilayotgan Naqd: ${expectedCash.toLocaleString('uz-UZ')} so'm
💵 Kassir Topshirgan Naqd: ${decCash.toLocaleString('uz-UZ')} so'm

<b>--- TERMINAL VA PAYME ---</b>
💳 Karta (Terminal): ${decCard.toLocaleString('uz-UZ')} so'm
📲 QR (Click/Payme): ${decQr.toLocaleString('uz-UZ')} so'm

<b>--- Natija ---</b>
${difference === 0 ? '✅ <b>BALANS TO\'G\'RI</b>' : (difference > 0 ? `🔥 <b>ORTIQCHA (SURPLUS):</b> +${difference.toLocaleString('uz-UZ')} so'm` : `🚨 <b>KAMOMAD (SHORTAGE):</b> ${difference.toLocaleString('uz-UZ')} so'm`)}

${notes ? `📝 <i>Izoh:</i> ${notes}` : ''}
    `;
    sendTelegramMessage(message);

    return res.json({
      message: 'Smena ko\'r-usulda muvaffaqiyatli yopildi va audit qilindi',
      audit: result.audit,
      shift: result.shift
    });

  } catch (error: any) {
    console.error('Close Shift Error:', error);
    return res.status(500).json({ error: 'Smena yopishda xatolik yuz berdi' });
  }
};
