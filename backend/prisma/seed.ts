import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding initial users and sample data...');

  // 1. Create Default Admin & Cashiers
  const admin = await prisma.user.upsert({
    where: { phone: '998901234567' },
    update: { pinCode: '7777', role: 'ADMIN', fullName: 'Admin' },
    create: {
      fullName: 'Admin',
      phone: '998901234567',
      pinCode: '7777',
      role: 'ADMIN',
    },
  });

  const kassa1 = await prisma.user.upsert({
    where: { phone: '998901111111' },
    update: { pinCode: '1111', role: 'CASHIER', fullName: 'Kassir 1' },
    create: {
      fullName: 'Kassir 1',
      phone: '998901111111',
      pinCode: '1111',
      role: 'CASHIER',
    },
  });

  const kassa2 = await prisma.user.upsert({
    where: { phone: '998909876543' },
    update: { pinCode: '2222', role: 'CASHIER', fullName: 'Kassir 2' },
    create: {
      fullName: 'Kassir 2',
      phone: '998909876543',
      pinCode: '2222',
      role: 'CASHIER',
    },
  });

  // 2. Create Ingredients (Inventory)
  const bun = await prisma.ingredient.create({
    data: { name: 'Burger Bulochkasi', unit: 'PIECE', currentStock: 500, costPerUnit: 2000 }
  });
  
  const meat = await prisma.ingredient.create({
    data: { name: 'Mol Go\'shti Kotleti', unit: 'PIECE', currentStock: 300, costPerUnit: 7000 }
  });

  const cheese = await prisma.ingredient.create({
    data: { name: 'Cheddar Pishlog\'i', unit: 'PIECE', currentStock: 400, costPerUnit: 1500 }
  });

  // 3. Create Products with Recipes
  const cheeseburger = await prisma.product.create({
    data: {
      categoryName: 'Burger',
      name: 'Classic Cheeseburger',
      price: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
      recipes: {
        create: [
          { ingredientId: bun.id, quantityRequired: 1 },
          { ingredientId: meat.id, quantityRequired: 1 },
          { ingredientId: cheese.id, quantityRequired: 1 },
        ]
      }
    }
  });

  const doubleBurger = await prisma.product.create({
    data: {
      categoryName: 'Burger',
      name: 'Double Max Burger',
      price: 35000,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500',
      recipes: {
        create: [
          { ingredientId: bun.id, quantityRequired: 1 },
          { ingredientId: meat.id, quantityRequired: 2 },
          { ingredientId: cheese.id, quantityRequired: 2 },
        ]
      }
    }
  });

  // 4. Create Demo Shift for Kassir 1
  const shift = await prisma.shift.create({
    data: {
      cashierId: kassa1.id,
      openedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      initialCash: 100000,
    }
  });

  await prisma.order.create({
    data: {
      orderNumber: 101,
      shiftId: shift.id,
      cashierId: kassa1.id,
      totalAmount: 60000,
      paymentType: 'CASH',
      status: 'COMPLETED',
      items: {
        create: [
          { productId: cheeseburger.id, quantity: 1, unitPrice: 25000, totalPrice: 25000 },
          { productId: doubleBurger.id, quantity: 1, unitPrice: 35000, totalPrice: 35000 },
        ]
      }
    }
  });

  console.log('✅ Seeding completed! Database is ready for Demo.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
