import { prisma } from './db';

async function main() {
  console.log('🌱 Starting FastFoodCash database seeding...');

  // Clear existing data in correct order
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shiftCashAudit.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.product.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const cashier = await prisma.user.create({
    data: {
      fullName: 'Aziz Kassir',
      phone: '+998901234567',
      pinCode: '1111',
      role: 'CASHIER',
      isActive: true
    }
  });

  const manager = await prisma.user.create({
    data: {
      fullName: 'Sardor Menejer',
      phone: '+998909876543',
      pinCode: '9999',
      role: 'MANAGER',
      isActive: true
    }
  });

  const admin = await prisma.user.create({
    data: {
      fullName: 'Baxrom Admin',
      phone: '+998900000000',
      pinCode: '0000',
      role: 'ADMIN',
      isActive: true
    }
  });

  console.log('✅ Users created:', { cashier: cashier.phone, manager: manager.phone, admin: admin.phone });

  // 2. Create Ingredients
  const ingBeef = await prisma.ingredient.create({
    data: {
      name: "Mol go'shti kotleti",
      unit: 'GRAM',
      currentStock: 15000,
      minStockAlert: 2000,
      costPerUnit: 80
    }
  });

  const ingBun = await prisma.ingredient.create({
    data: {
      name: 'Burger bulochkasi',
      unit: 'PIECE',
      currentStock: 200,
      minStockAlert: 30,
      costPerUnit: 2000
    }
  });

  const ingCheese = await prisma.ingredient.create({
    data: {
      name: 'Pishloq slice',
      unit: 'GRAM',
      currentStock: 5000,
      minStockAlert: 500,
      costPerUnit: 120
    }
  });

  const ingLavashBread = await prisma.ingredient.create({
    data: {
      name: 'Lavash xamiri',
      unit: 'PIECE',
      currentStock: 150,
      minStockAlert: 25,
      costPerUnit: 3000
    }
  });

  const ingChicken = await prisma.ingredient.create({
    data: {
      name: "Tovuq go'shti (file)",
      unit: 'GRAM',
      currentStock: 12000,
      minStockAlert: 1500,
      costPerUnit: 60
    }
  });

  const ingFries = await prisma.ingredient.create({
    data: {
      name: 'Kartoshka fri (xom)',
      unit: 'GRAM',
      currentStock: 20000,
      minStockAlert: 3000,
      costPerUnit: 30
    }
  });

  const ingCola = await prisma.ingredient.create({
    data: {
      name: 'Coca-Cola 0.5L',
      unit: 'PIECE',
      currentStock: 300,
      minStockAlert: 50,
      costPerUnit: 5000
    }
  });

  console.log('✅ Ingredients seeded');

  // 3. Create Products & Recipes
  const pCheeseburger = await prisma.product.create({
    data: {
      categoryName: 'Burgers',
      name: 'Classic Cheeseburger',
      price: 28000,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      isAvailable: true,
      recipes: {
        create: [
          { ingredientId: ingBun.id, quantityRequired: 1 },
          { ingredientId: ingBeef.id, quantityRequired: 110 },
          { ingredientId: ingCheese.id, quantityRequired: 20 }
        ]
      }
    }
  });

  const pDoubleBurger = await prisma.product.create({
    data: {
      categoryName: 'Burgers',
      name: 'Double Cheese Monster',
      price: 42000,
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400',
      isAvailable: true,
      recipes: {
        create: [
          { ingredientId: ingBun.id, quantityRequired: 1 },
          { ingredientId: ingBeef.id, quantityRequired: 220 },
          { ingredientId: ingCheese.id, quantityRequired: 40 }
        ]
      }
    }
  });

  const pLavash = await prisma.product.create({
    data: {
      categoryName: 'Lavash',
      name: 'Tovuqli Cheese Lavash',
      price: 32000,
      imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400',
      isAvailable: true,
      recipes: {
        create: [
          { ingredientId: ingLavashBread.id, quantityRequired: 1 },
          { ingredientId: ingChicken.id, quantityRequired: 150 },
          { ingredientId: ingCheese.id, quantityRequired: 15 }
        ]
      }
    }
  });

  const pFries = await prisma.product.create({
    data: {
      categoryName: 'Snacks',
      name: 'Kartoshka Fri (L)',
      price: 16000,
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400',
      isAvailable: true,
      recipes: {
        create: [
          { ingredientId: ingFries.id, quantityRequired: 150 }
        ]
      }
    }
  });

  const pCola = await prisma.product.create({
    data: {
      categoryName: 'Drinks',
      name: 'Coca-Cola 0.5L',
      price: 10000,
      imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400',
      isAvailable: true,
      recipes: {
        create: [
          { ingredientId: ingCola.id, quantityRequired: 1 }
        ]
      }
    }
  });

  console.log('✅ Products & BOM Recipes seeded');

  // 4. Create an open shift for Kassir
  const openShift = await prisma.shift.create({
    data: {
      cashierId: cashier.id,
      initialCash: 100000,
      status: 'OPEN'
    }
  });

  console.log('✅ Initial open shift created ID:', openShift.id);
  console.log('🚀 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
