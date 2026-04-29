import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Team Plan...');

  await prisma.plan.create({
    data: {
      name: 'Team',
      badge: 'Bonus',
      price: 500,
      dailyProfit: 20,
      validity: 30, // Assuming 30 days or indefinitely, but let's put 30
      totalProfit: 600,
      refBonus: 5,
      isActive: true,
    }
  });

  console.log('Created Team Plan');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
