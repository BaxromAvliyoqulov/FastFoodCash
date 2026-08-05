import { Request, Response } from 'express';
import { prisma } from '../db';

export const loginByPin = async (req: Request, res: Response) => {
  try {
    const { pinCode } = req.body;
    if (!pinCode) {
      return res.status(400).json({ error: 'PIN kod kiritilishi shart' });
    }

    const user = await prisma.user.findFirst({
      where: { pinCode, isActive: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Noto\'g\'ri PIN-kod!' });
    }

    // Check active shift for this cashier
    let activeShift = null;
    if (user.role === 'CASHIER' || user.role === 'MANAGER') {
      activeShift = await prisma.shift.findFirst({
        where: { cashierId: user.id, status: 'OPEN' }
      });
    }

    return res.json({
      message: 'Muvaffaqiyatli kirildi',
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role
      },
      activeShift
    });
  } catch (error: any) {
    console.error('Auth Login Error:', error);
    return res.status(500).json({ error: 'Server xatoligi' });
  }
};
