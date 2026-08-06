import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTables() {
  console.log('Seeding 15 Tables and 6 Rooms...');
  
  // Clear existing tables first to avoid duplicates
  await prisma.diningTable.deleteMany();
  
  let currentNumber = 1;
  
  // Create 15 Tables (Stol)
  for (let i = 1; i <= 15; i++) {
    await prisma.diningTable.create({
      data: {
        number: currentNumber++,
        name: `Stol ${i}`
      }
    });
    console.log(`Created: Stol ${i}`);
  }
  
  // Create 6 Rooms (Xona)
  for (let i = 1; i <= 6; i++) {
    await prisma.diningTable.create({
      data: {
        number: currentNumber++,
        name: `Xona ${i}`
      }
    });
    console.log(`Created: Xona ${i}`);
  }
  
  console.log('Successfully added 15 Tables and 6 Rooms!');
}

seedTables()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
