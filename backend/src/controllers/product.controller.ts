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

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, categoryName, price, imageUrl, isAvailable, categoryId } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name,
        categoryName: categoryName || 'Yangi',
        price: Number(price),
        imageUrl,
        isAvailable: isAvailable ?? true
      },
      include: { recipes: { include: { ingredient: true } } }
    });
    return res.json(newProduct);
  } catch (error: any) {
    console.error('Create Product Error:', error);
    return res.status(500).json({ error: 'Taom yaratishda xatolik' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryName, price, imageUrl, isAvailable, isStopList } = req.body;
    
    // Convert isStopList to isAvailable (they are opposites)
    const availability = isStopList !== undefined ? !isStopList : (isAvailable ?? true);

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        categoryName,
        price: price ? Number(price) : undefined,
        imageUrl,
        isAvailable: availability
      },
      include: { recipes: { include: { ingredient: true } } }
    });
    return res.json(updated);
  } catch (error: any) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ error: 'Taom tahrirlashda xatolik' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ error: "Taom o'chirishda xatolik" });
  }
};
