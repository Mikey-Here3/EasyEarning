import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPlan = await prisma.plan.findFirst({
    where: { badge: "ADMIN" }
  });

  if (adminPlan) {
    console.log("Current Admin Plan:", adminPlan);
    const updated = await prisma.plan.update({
      where: { id: adminPlan.id },
      data: {
        dailyProfit: 50,
        totalProfit: 1500, // 50 * 30
      }
    });
    console.log("Updated Admin Plan:", updated);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
