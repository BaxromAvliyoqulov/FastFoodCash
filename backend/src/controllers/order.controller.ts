import { Request, Response } from 'express';
import { prisma } from '../db';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { cashierId, shiftId, paymentType, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, data: null, error: 'Buyurtma savatchasi bo\'sh bo\'lishi mumkin emas' });
    }

    // Ensure valid cashier exists
    let validCashierId = cashierId;
    if (validCashierId) {
      const userExists = await prisma.user.findUnique({ where: { id: validCashierId } });
      if (!userExists) {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) {
          validCashierId = firstUser.id;
        } else {
          const newUser = await prisma.user.create({
            data: { id: validCashierId, fullName: 'Kassir 1', phone: '998900000000', pinCode: '0000', role: 'CASHIER' }
          });
          validCashierId = newUser.id;
        }
      }
    } else {
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        validCashierId = firstUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: { fullName: 'Kassir 1', phone: '998900000000', pinCode: '0000', role: 'CASHIER' }
        });
        validCashierId = newUser.id;
      }
    }

    let activeShiftId = shiftId;
    if (activeShiftId) {
      const checkShift = await prisma.shift.findUnique({ where: { id: activeShiftId } });
      if (!checkShift || checkShift.status !== 'OPEN') {
        activeShiftId = undefined;
      }
    }

    if (!activeShiftId) {
      let activeShift = await prisma.shift.findFirst({
        where: { status: 'OPEN' }
      });
      if (!activeShift) {
        // Auto-create open shift so payment never fails
        activeShift = await prisma.shift.create({
          data: {
            cashierId: validCashierId,
            initialCash: 100000,
            status: 'OPEN'
          }
        });
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

    // Calculate total amount and verify items (auto-upsert missing products)
    const orderItemsData: any[] = [];
    for (const item of items) {
      let product = productMap.get(item.productId);
      if (!product) {
        const resolvedName = item.productName || item.name || item.product?.name || item.productId;
        const resolvedCategory = item.categoryName || item.product?.categoryName || (item.productId?.startsWith('prod-lav') ? 'Lavash' : 'Taomlar');
        product = await prisma.product.upsert({
          where: { id: item.productId },
          update: {
            name: resolvedName.startsWith('prod-') ? undefined : resolvedName,
            price: item.unitPrice || undefined,
            categoryName: resolvedCategory !== 'General' ? resolvedCategory : undefined
          },
          create: {
            id: item.productId,
            name: resolvedName,
            price: item.unitPrice || 0,
            categoryName: resolvedCategory,
          },
          include: {
            recipes: {
              include: { ingredient: true }
            }
          }
        });
        productMap.set(product.id, product);
      }

      const unitPrice = item.unitPrice ?? product.price;
      const itemTotal = item.totalPrice ?? (unitPrice * item.quantity);
      totalAmount += itemTotal;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
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

      // Ensure valid cashier exists
      let validCashierId = cashierId;
      if (validCashierId) {
        const userExists = await tx.user.findUnique({ where: { id: validCashierId } });
        if (!userExists) {
          const firstUser = await tx.user.findFirst();
          if (firstUser) {
            validCashierId = firstUser.id;
          } else {
            const newUser = await tx.user.create({
              data: { id: validCashierId, fullName: 'Kassir', phone: '998900000000', pinCode: '0000', role: 'CASHIER' }
            });
            validCashierId = newUser.id;
          }
        }
      } else {
        const firstUser = await tx.user.findFirst();
        if (firstUser) {
          validCashierId = firstUser.id;
        } else {
          const newUser = await tx.user.create({
            data: { fullName: 'Kassir', phone: '998900000000', pinCode: '0000', role: 'CASHIER' }
          });
          validCashierId = newUser.id;
        }
      }

      // 2. Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          shiftId: activeShiftId,
          cashierId: validCashierId,
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

        // 4. Deduct modifier ingredients if any (from frontend complex recipes logic)
        if (item.ingredientDeductions && Array.isArray(item.ingredientDeductions)) {
          for (const mod of item.ingredientDeductions) {
            if (mod.ingredientId && mod.quantity) {
              await tx.ingredient.update({
                where: { id: mod.ingredientId },
                data: {
                  currentStock: {
                    decrement: mod.quantity
                  }
                }
              });
            }
          }
        }
      }

      return newOrder;
    });

    return res.status(201).json({
      success: true,
      message: 'Buyurtma rasmiylashtirildi',
      data: result
    });

  } catch (error: any) {
    console.error('Create Order Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Buyurtma urishda xatolik yuz berdi' });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId, managerPin, managerId, reason } = req.body;

    if (!managerPin && !managerId) {
      return res.status(400).json({ success: false, data: null, error: 'Menejer PIN-kodi yoki ID kiritilishi shart' });
    }

    let manager;
    if (managerId) {
      manager = await prisma.user.findUnique({
        where: { id: managerId }
      });
    } else if (managerPin) {
      manager = await prisma.user.findFirst({
        where: { pinCode: managerPin, role: { in: ['MANAGER', 'ADMIN'] } }
      });
    }

    if (!manager || !['MANAGER', 'ADMIN'].includes(manager.role)) {
      return res.status(403).json({ success: false, data: null, error: 'Ruxsat etilmagan foydalanuvchi!' });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { recipes: true }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, data: null, error: 'Buyurtma topilmadi' });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({ success: false, data: null, error: 'Bu buyurtma allaqachon bekor qilingan' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' }
      });

      // Return ingredients back to stock
      for (const item of order.items) {
        if (item.product && item.product.recipes) {
          for (const recipe of item.product.recipes) {
            const qtyToReturn = recipe.quantityRequired * item.quantity;
            await tx.ingredient.update({
              where: { id: recipe.ingredientId },
              data: {
                currentStock: {
                  increment: qtyToReturn
                }
              }
            });
          }
        }
      }

      // Write to Anti-Fraud Audit Log
      await tx.auditLog.create({
        data: {
          userId: manager.id,
          action: 'CANCEL_ORDER',
          detailsJson: JSON.stringify({ orderId, orderNumber: updatedOrder.orderNumber, reason: reason || 'Menejer bekori' })
        }
      });

      return updatedOrder;
    });

    return res.json({ success: true, message: 'Buyurtma bekor qilindi', data: result });
  } catch (error: any) {
    console.error('Cancel Order Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Buyurtmani bekor qilishda xatolik' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paymentType: true,
          status: true,
          createdAt: true,
          cashier: {
            select: { fullName: true }
          },
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  categoryName: true,
                  imageUrl: true
                }
              }
            }
          }
        }
      }),
      prisma.order.count()
    ]);

    // Format for frontend
    const formattedOrders = orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      cashierName: o.cashier?.fullName || 'Kassir',
      totalAmount: o.totalAmount,
      paymentType: o.paymentType,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map(i => ({
        product: {
          id: i.product?.id || '',
          name: i.product?.name || 'Nomsiz',
          price: i.product?.price || 0,
          categoryName: (i.product as any)?.categoryName || '',
          imageUrl: (i.product as any)?.imageUrl || ''
        },
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice
      }))
    }));

    return res.json({ 
      success: true, 
      message: 'Buyurtmalar tarixi yuklandi', 
      data: {
        items: formattedOrders,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      } 
    });
  } catch (error: any) {
    console.error('Get Orders Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Buyurtmalar tarixini yuklashda xatolik' });
  }
};
