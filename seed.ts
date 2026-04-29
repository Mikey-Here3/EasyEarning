import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding plans...');

  const plans = [
    {
      name: 'Starter',
      badge: 'New',
      price: 10,
      dailyProfit: 2,
      validity: 7,
      totalProfit: 14,
      refBonus: 5,
      isActive: true,
    },
    {
      name: 'Basic',
      badge: 'Popular',
      price: 50,
      dailyProfit: 10,
      validity: 10,
      totalProfit: 100,
      refBonus: 5,
      isActive: true,
    },
    {
      name: 'Pro',
      badge: 'Hot',
      price: 100,
      dailyProfit: 15,
      validity: 10,
      totalProfit: 150,
      refBonus: 5,
      isActive: true,
    }
  ];

  for (const plan of plans) {
    await prisma.plan.create({ data: plan });
    console.log(`Created plan: ${plan.name}`);
  }

  console.log('Seeding TRC20 account...');
  await prisma.depositAccount.create({
    data: {
      name: 'Main Wallet',
      number: 'TYourAddressHere1234567890abcdefg',
      method: 'CRYPTO_TRC20',
      priority: 1,
      isActive: true,
    }
  });

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
