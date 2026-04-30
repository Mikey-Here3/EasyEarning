import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create Team Member Plan
  const memberPlan = await prisma.plan.create({
    data: {
      name: "Team Member",
      badge: "TEAM",
      price: 200,
      dailyProfit: 20,
      validity: 30,
      totalProfit: 600,
      refBonus: 5,
      isActive: true,
    },
  });

  console.log("Created Team Member Plan:", memberPlan.id);

  // We don't necessarily need a Team Admin plan in DB if we hardcode the Admin logic,
  // but let's create it for consistency.
  const adminPlan = await prisma.plan.create({
    data: {
      name: "Team Admin",
      badge: "ADMIN",
      price: 800,
      dailyProfit: 50,
      validity: 30,
      totalProfit: 1500, // plus $200 instant bonus handled in code
      refBonus: 0,
      isActive: false, // hidden from normal plans page
    },
  });

  console.log("Created Team Admin Plan:", adminPlan.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
