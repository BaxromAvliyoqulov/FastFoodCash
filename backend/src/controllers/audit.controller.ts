import { Request, Response } from 'express';
import { prisma } from '../db';

export const getIngredients = async (req: Request, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: ingredients, message: "Ingrediyentlar yuklandi" });
  } catch (error: any) {
    console.error('Get Ingredients Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Ingrediyentlarni olishda xatolik' });
  }
};

export const quickRevision = async (req: Request, res: Response) => {
  try {
    const { managerId, items } = req.body;
    // items: [{ ingredientId, actualStock }]

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, data: null, error: 'Reviziya ma\'lumotlari kiritilmadi' });
    }

    const discrepancies: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const ingredient = await tx.ingredient.findUnique({
          where: { id: item.ingredientId }
        });

        if (ingredient) {
          const diff = Number(item.actualStock) - ingredient.currentStock;
          if (Math.abs(diff) > 0.001) {
            discrepancies.push({
              ingredientName: ingredient.name,
              systemStock: ingredient.currentStock,
              actualStock: Number(item.actualStock),
              unit: ingredient.unit,
              difference: diff
            });

            // Update database stock to match actual physical count
            await tx.ingredient.update({
              where: { id: ingredient.id },
              data: { currentStock: Number(item.actualStock) }
            });
          }
        }
      }

      if (discrepancies.length > 0) {
        await tx.auditLog.create({
          data: {
            userId: managerId || 'manager',
            action: 'INVENTORY_REVISION',
            detailsJson: JSON.stringify({ discrepancies })
          }
        });
      }
    });

    return res.json({
      success: true,
      message: 'Ingrediyentlar reviziyasi yakunlandi',
      data: {
        discrepanciesCount: discrepancies.length,
        discrepancies
      }
    });
  } catch (error: any) {
    console.error('Quick Revision Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Reviziya o\'tkazishda xatolik' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          action: true,
          detailsJson: true,
          timestamp: true,
          user: {
            select: { id: true, fullName: true, role: true }
          }
        }
      }),
      prisma.auditLog.count()
    ]);
    
    return res.json({ 
      success: true, 
      data: {
        items: logs,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }, 
      message: "Audit loglari yuklandi" 
    });
  } catch (error: any) {
    console.error('Get Audit Logs Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Audit loglarini olishda xatolik' });
  }
};
