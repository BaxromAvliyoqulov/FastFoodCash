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
        cashier: {
          select: { id: true, fullName: true, phone: true }
        },
        expenses: true,
        orders: {
          where: { status: 'COMPLETED' },
          select: { paymentType: true, totalAmount: true } // Only needed fields for summary
        }
      }
    });

    if (!shift) {
      return res.status(200).json({ success: true, data: { activeShift: null }, message: 'Aktiv smena topilmadi' });
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
      success: true,
      message: 'Aktiv smena topildi',
      data: {
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
      }
    });
  } catch (error: any) {
    console.error('Get Active Shift Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Smena ma\'lumotlarini olishda xatolik' });
  }
};

export const openShift = async (req: Request, res: Response) => {
  try {
    const { cashierId, initialCash } = req.body;

    // Ensure cashier user exists in DB to prevent foreign key errors
    let validCashierId = cashierId;
    if (validCashierId) {
      const userExists = await prisma.user.findUnique({ where: { id: validCashierId } });
      if (!userExists) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          validCashierId = firstUser.id;
        } else {
          const newUser = await prisma.user.create({
            data: { id: validCashierId, fullName: 'Kassir', phone: '998900000000', pinCode: '0000', role: 'CASHIER' }
          });
          validCashierId = newUser.id;
        }
      }
    } else {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        validCashierId = firstUser.id;
      }
    }

    const shift = await prisma.shift.create({
      data: {
        cashierId: validCashierId,
        initialCash: Number(initialCash) || 0,
        status: 'OPEN'
      }
    });

    return res.status(201).json({ success: true, message: 'Smena muvaffaqiyatli ochildi', data: { shift } });
  } catch (error: any) {
    console.error('Open Shift Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Smena ochishda xatolik' });
  }
};

export const closeShiftBlind = async (req: Request, res: Response) => {
  try {
    const { shiftId, declaredCash, declaredCard, declaredQr, notes, expenses } = req.body;

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { 
        cashier: {
          select: { id: true, fullName: true, phone: true }
        },
        expenses: true,
        orders: { 
          where: { status: 'COMPLETED' },
          select: { paymentType: true, totalAmount: true } 
        } 
      }
    });

    if (!shift || shift.status !== 'OPEN') {
      return res.status(400).json({ success: false, data: null, error: 'Ochiq smena topilmadi yoki allaqachon yopilgan' });
    }

    // Process expenses sent from frontend if any were not synced
    const totalFrontendExpenses = (expenses || []).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
    
    // 1. Calculate EXPECTED figures from backend data
    const totalCashOrders = shift.orders
      .filter(o => o.paymentType === 'CASH')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const expectedCash = shift.initialCash + totalCashOrders - totalFrontendExpenses;

    const decCash = Number(declaredCash) || 0;
    const decCard = Number(declaredCard) || 0;
    const decQr = Number(declaredQr) || 0;

    const difference = decCash - expectedCash; // Negative = shortage (kamchilik)

    let auditStatus: 'BALANCED' | 'SHORTAGE' | 'SURPLUS' = 'BALANCED';
    if (difference < -100) { // allowing small rounding
      auditStatus = 'SHORTAGE';
    } else if (difference > 100) {
      auditStatus = 'SURPLUS';
    }

    // 2. Perform Transaction to update shift and save audit record
    const result = await prisma.$transaction(async (tx) => {
      // Clear old expenses and save the full list from frontend
      if (expenses && expenses.length > 0) {
        await tx.expense.deleteMany({ where: { shiftId: shift.id } });
        await tx.expense.createMany({
          data: expenses.map((e: any) => ({
            shiftId: shift.id,
            amount: Number(e.amount),
            reason: e.reason
          }))
        });
      }

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
              expectedCash,
              declaredCash: decCash
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
      success: true,
      message: 'Smena ko\'r-usulda muvaffaqiyatli yopildi va audit qilindi',
      data: {
        audit: result.audit,
        shift: result.shift
      }
    });

  } catch (error: any) {
    console.error('Close Shift Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Smena yopishda xatolik yuz berdi' });
  }
};
