import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding new Plans...');

  // Delete all existing plans to avoid confusion
  await prisma.plan.deleteMany({});

  const plans = [
    { name: 'Micro', badge: 'Entry', price: 10, dailyProfit: 2, validity: 7, totalProfit: 14, refBonus: 1, isActive: true },
    { name: 'Starter', badge: 'Standard', price: 25, dailyProfit: 4, validity: 10, totalProfit: 40, refBonus: 2, isActive: true },
    { name: 'Basic', badge: 'Popular', price: 50, dailyProfit: 8, validity: 10, totalProfit: 80, refBonus: 4, isActive: true },
    { name: 'Pro', badge: 'Hot', price: 100, dailyProfit: 18, validity: 10, totalProfit: 180, refBonus: 8, isActive: true },
    { name: 'Elite', badge: 'Premium', price: 250, dailyProfit: 40, validity: 10, totalProfit: 400, refBonus: 15, isActive: true },
    { name: 'Team', badge: 'Bonus', price: 500, dailyProfit: 80, validity: 10, totalProfit: 800, refBonus: 25, isActive: true },
  ];

  for (const plan of plans) {
    await prisma.plan.create({ data: plan });
  }

  console.log('Created Plans successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
