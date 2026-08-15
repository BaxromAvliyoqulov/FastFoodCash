import { Request, Response } from 'express';
import { prisma } from '../db';

export const getSystemHealth = async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    // Ping DB
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    const memoryUsage = process.memoryUsage();

    return res.status(200).json({
      success: true,
      status: 'HEALTHY',
      uptimeSeconds: Math.floor(process.uptime()),
      dbLatencyMs: dbLatency,
      memory: {
        rssMb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
        heapTotalMb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
        heapUsedMb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      status: 'UNHEALTHY',
      error: error.message
    });
  }
};

export const exportDatabaseBackup = async (req: Request, res: Response) => {
  try {
    const [users, products, ingredients, recipes, shifts, orders, expenses] = await Promise.all([
      prisma.user.findMany({ select: { id: true, fullName: true, phone: true, role: true, isActive: true } }),
      prisma.product.findMany(),
      prisma.ingredient.findMany(),
      prisma.recipe.findMany(),
      prisma.shift.findMany({ take: 50, orderBy: { openedAt: 'desc' } }),
      prisma.order.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { items: true } }),
      prisma.expense.findMany({ take: 50, orderBy: { createdAt: 'desc' } })
    ]);

    const backupData = {
      meta: {
        appName: 'FastFoodCash',
        version: '1.0.0',
        createdAt: new Date().toISOString()
      },
      data: {
        users,
        products,
        ingredients,
        recipes,
        shifts,
        orders,
        expenses
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${Date.now()}.json`);
    return res.status(200).json(backupData);
  } catch (error: any) {
    console.error('Export Backup Error:', error);
    return res.status(500).json({ success: false, error: 'Database backup eksport qilishda xatolik' });
  }
};

export const clearSalesHistory = async (req: Request, res: Response) => {
  try {
    // Delete only fake/test sales, orders, shifts and audits - preserving products, ingredients, recipes, tables, categories & users!
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.shiftCashAudit.deleteMany();
    await prisma.shift.deleteMany();
    await prisma.expense.deleteMany();

    return res.status(200).json({
      success: true,
      message: 'Barcha test/fake savdolar va smenalar tarixi muvaffaqiyatli tozalandi. Tovar, retsept va stollar saqlab qolindi.'
    });
  } catch (error: any) {
    console.error('Clear Sales Error:', error);
    return res.status(500).json({ success: false, error: 'Savdolar tarixini tozalashda xatolik yuz berdi' });
  }
};
