import prisma from './src/config/database.js';

async function listCategories() {
  try {
    const categories = await prisma.category.findMany();
    console.log('--- Categories in DB ---');
    console.log(JSON.stringify(categories, null, 2));
    console.log('------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

listCategories();
