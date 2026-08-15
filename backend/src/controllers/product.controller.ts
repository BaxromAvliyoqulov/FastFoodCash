import { Request, Response } from 'express';
import { prisma } from '../db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        recipes: {
          include: {
            ingredient: true
          }
        }
      }
    });

    return res.json({ success: true, data: products, message: "Mahsulotlar yuklandi" });
  } catch (error: any) {
    console.error('Get Products Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Mahsulotlarni yuklashda xatolik' });
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
    return res.json({ success: true, data: newProduct, message: "Yangi taom qo'shildi" });
  } catch (error: any) {
    console.error('Create Product Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Taom yaratishda xatolik' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryName, price, imageUrl, isAvailable, isStopList } = req.body;
    
    // Convert isStopList to isAvailable (they are opposites)
    const availability = isStopList !== undefined ? !isStopList : (isAvailable ?? true);

    const updated = await prisma.product.upsert({
      where: { id },
      update: {
        name,
        categoryName,
        price: price !== undefined ? Number(price) : undefined,
        imageUrl,
        isAvailable: availability
      },
      create: {
        id,
        name: name || id,
        categoryName: categoryName || 'Yangi',
        price: price !== undefined ? Number(price) : 0,
        imageUrl: imageUrl || '',
        isAvailable: availability
      },
      include: { recipes: { include: { ingredient: true } } }
    });
    return res.json({ success: true, data: updated, message: "Taom tahrirlandi" });
  } catch (error: any) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Taom tahrirlashda xatolik: ' + error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.product.update({ 
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });
    return res.json({ success: true, data: null, message: "Taom o'chirildi (Soft Delete)" });
  } catch (error: any) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ success: false, data: null, error: "Taom o'chirishda xatolik" });
  }
};
