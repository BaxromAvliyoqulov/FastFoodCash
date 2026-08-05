import { Request, Response } from 'express';
import { prisma } from '../db';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { cashierId, shiftId, paymentType, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Buyurtma savatchasi bo\'sh bo\'lishi mumkin emas' });
    }

    let activeShiftId = shiftId;
    if (!activeShiftId) {
      const activeShift = await prisma.shift.findFirst({
        where: { cashierId, status: 'OPEN' }
      });
      if (!activeShift) {
        return res.status(400).json({ error: 'Aktiv smena topilmadi! Avval smena oching.' });
      }
      activeShiftId = activeShift.id;
    }

    // Get product details
    const productIds = items.map((i: any) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        recipes: {
          include: { ingredient: true }
        }
      }
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    let totalAmount = 0;

    // Calculate total amount and verify items
    const orderItemsData: any[] = [];
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Mahsulot topilmadi: ${item.productId}` });
      }
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }

    // Execute atomic transaction for Order creation + BOM Auto-Deduction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get next order number for this shift
      const lastOrder = await tx.order.findFirst({
        where: { shiftId: activeShiftId },
        orderBy: { orderNumber: 'desc' }
      });
      const orderNumber = (lastOrder?.orderNumber || 0) + 1;

      // 2. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          shiftId: activeShiftId,
          cashierId: cashierId || 'default-cashier',
          totalAmount,
          paymentType: paymentType || 'CASH',
          status: 'COMPLETED',
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: { product: true }
          }
        }
      });

      // 3. Deduct ingredients per BOM recipe
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (product && product.recipes) {
          for (const recipe of product.recipes) {
            const qtyNeeded = recipe.quantityRequired * item.quantity;
            await tx.ingredient.update({
              where: { id: recipe.ingredientId },
              data: {
                currentStock: {
                  decrement: qtyNeeded
                }
              }
            });
          }
        }
      }

      return newOrder;
    });

    return res.status(201).json({
      message: 'Buyurtma rasmiylashtirildi',
      order: result
    });

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ error: 'Buyurtma urishda xatolik yuz berdi' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, managerPin, reason } = req.body;

    if (!managerPin) {
      return res.status(400).json({ error: 'Menejer PIN-kodi kiritilishi shart' });
    }

    const manager = await prisma.user.findFirst({
      where: { pinCode: managerPin, role: { in: ['MANAGER', 'ADMIN'] } }
    });

    if (!manager) {
      return res.status(403).json({ error: 'Noto\'g\'ri Menejer PIN-kodi!' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' }
    });

    // Write to Anti-Fraud Audit Log
    await prisma.auditLog.create({
      data: {
        userId: manager.id,
        action: 'CANCEL_ORDER',
        detailsJson: JSON.stringify({ orderId, orderNumber: updatedOrder.orderNumber, reason: reason || 'Menejer bekori' })
      }
    });

    return res.json({ message: 'Buyurtma bekor qilindi', order: updatedOrder });
  } catch (error: any) {
    console.error('Cancel Order Error:', error);
    return res.status(500).json({ error: 'Buyurtmani bekor qilishda xatolik' });
  }
};
