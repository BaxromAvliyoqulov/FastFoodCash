import { Request, Response } from 'express';
import { prisma } from '../db';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: { 
        createdAt: { gte: today },
        status: 'COMPLETED'
      },
      include: { items: { include: { product: true } } }
    });

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let productCounts: Record<string, { name: string, count: number, revenue: number }> = {};

    orders.forEach(order => {
      totalRevenue += order.totalAmount;
      order.items.forEach(item => {
        const name = item.product.name;
        if (!productCounts[name]) {
          productCounts[name] = { name, count: 0, revenue: 0 };
        }
        productCounts[name].count += item.quantity;
        productCounts[name].revenue += item.totalPrice;
      });
    });

    const topItems = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.json({
      success: true,
      message: 'Dashboard stats yuklandi',
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        topItems
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ success: false, data: null, error: 'Failed to load stats' });
  }
};
