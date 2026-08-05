import { Request, Response } from 'express';
import { prisma } from '../db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        recipes: {
          include: {
            ingredient: true
          }
        }
      }
    });

    return res.json(products);
  } catch (error: any) {
    console.error('Get Products Error:', error);
    return res.status(500).json({ error: 'Mahsulotlarni yuklashda xatolik' });
  }
};
