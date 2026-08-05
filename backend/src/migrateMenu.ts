import { PrismaClient } from '@prisma/client';
import { initialProducts } from './data/menu';

const prisma = new PrismaClient();

async function migrateMenu() {
  console.log('Migrating', initialProducts.length, 'products to the database...');
  
  for (const product of initialProducts) {
    try {
      await prisma.product.create({
        data: {
          name: product.name,
          categoryName: product.categoryName,
          price: product.price,
          imageUrl: product.imageUrl,
          isAvailable: !product.isStopList,
        }
      });
      console.log('Created:', product.name);
    } catch (e) {
      console.error('Failed to create:', product.name, e);
    }
  }
  
  console.log('Migration complete!');
}

migrateMenu().catch(console.error).finally(() => prisma.$disconnect());
