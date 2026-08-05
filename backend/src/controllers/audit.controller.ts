import { Request, Response } from 'express';
import { prisma } from '../db';

export const getIngredients = async (req: Request, res: Response) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json(ingredients);
  } catch (error: any) {
    console.error('Get Ingredients Error:', error);
    return res.status(500).json({ error: 'Ingrediyentlarni olishda xatolik' });
  }
};

export const quickRevision = async (req: Request, res: Response) => {
  try {
    const { managerId, items } = req.body;
    // items: [{ ingredientId, actualStock }]

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Reviziya ma\'lumotlari kiritilmadi' });
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
      message: 'Ingrediyentlar reviziyasi yakunlandi',
      discrepanciesCount: discrepancies.length,
      discrepancies
    });
  } catch (error: any) {
    console.error('Quick Revision Error:', error);
    return res.status(500).json({ error: 'Reviziya o\'tkazishda xatolik' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: { user: true }
    });
    return res.json(logs);
  } catch (error: any) {
    console.error('Get Audit Logs Error:', error);
    return res.status(500).json({ error: 'Audit loglarini olishda xatolik' });
  }
};
