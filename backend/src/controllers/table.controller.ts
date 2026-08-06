import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllTables = async (req: Request, res: Response) => {
  try {
    const tables = await prisma.diningTable.findMany({
      orderBy: { number: 'asc' }
    });
    res.json(tables);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, number } = req.body;
    const existingTable = await prisma.diningTable.findUnique({ where: { number: parseInt(number) } });
    if (existingTable) {
      return res.status(400).json({ error: 'Stol raqami oldin kiritilgan!' });
    }
    const table = await prisma.diningTable.create({
      data: { name, number: parseInt(number) }
    });
    res.status(201).json(table);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create table' });
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
        return res.status(400).json({ error: 'Bu raqamli stol allaqachon mavjud!' });
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
    res.json(table);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update table' });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.diningTable.delete({ where: { id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete table' });
  }
};
