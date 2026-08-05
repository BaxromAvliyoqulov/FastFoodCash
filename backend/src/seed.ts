import { prisma } from './db';

async function main() {
  console.log('🌱 Starting FastFoodCash database seeding for PRODUCTION...');

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

  // 1. Create Default Users (Production Ready)
  const admin = await prisma.user.create({
    data: {
      fullName: 'Asosiy Admin',
      phone: '+998900000000',
      pinCode: '7777', // Default admin pin
      role: 'ADMIN',
      isActive: true
    }
  });

  const cashier = await prisma.user.create({
    data: {
      fullName: 'Asosiy Kassir',
      phone: '+998901234567',
      pinCode: '1234', // Default cashier pin
      role: 'CASHIER',
      isActive: true
    }
  });

  console.log('✅ Users created:', { admin: admin.pinCode, cashier: cashier.pinCode });

  console.log('🚀 Database seeding complete (Production Empty State)!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
