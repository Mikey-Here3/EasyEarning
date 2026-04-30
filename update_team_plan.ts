import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.updateMany({
    where: { badge: "TEAM" },
    data: {
      price: 200,
      dailyProfit: 20,
      totalProfit: 600,
    },
  });
  console.log("Team Member plan updated successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
