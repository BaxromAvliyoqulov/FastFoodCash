import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTables = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.diningTable.findMany({
      orderBy: { number: 'asc' }
    });
    return res.json({ success: true, data: tables, message: "Stollar yuklandi" });
  } catch (error: any) {
    return res.status(500).json({ success: false, data: null, error: 'Failed to fetch tables' });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, number } = req.body;
    const existingTable = await prisma.diningTable.findUnique({ where: { number: parseInt(number) } });
    if (existingTable) {
      return res.status(400).json({ success: false, data: null, error: 'Stol raqami oldin kiritilgan!' });
    }
    const table = await prisma.diningTable.create({
      data: { name, number: parseInt(number) }
    });
    return res.status(201).json({ success: true, data: table, message: "Stol yaratildi" });
  } catch (error: any) {
    return res.status(500).json({ success: false, data: null, error: 'Failed to create table' });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, number, isActive } = req.body;
    
    if (number) {
      const existingTable = await prisma.diningTable.findFirst({
        where: { number: parseInt(number), id: { not: id } }
      });
      if (existingTable) {
        return res.status(400).json({ success: false, data: null, error: 'Bu raqamli stol allaqachon mavjud!' });
      }
    }

    const table = await prisma.diningTable.update({
      where: { id },
      data: { 
        name: name !== undefined ? name : undefined, 
        number: number !== undefined ? parseInt(number) : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    return res.json({ success: true, data: table, message: "Stol yangilandi" });
  } catch (error: any) {
    return res.status(500).json({ success: false, data: null, error: 'Failed to update table' });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.diningTable.delete({ where: { id } });
    return res.json({ success: true, data: null, message: "Stol o'chirildi" });
  } catch (error: any) {
    return res.status(500).json({ success: false, data: null, error: 'Failed to delete table' });
  }
};
