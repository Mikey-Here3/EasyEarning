import prisma from "./prisma";

export async function processUserPlans(userId: string) {
  const now = new Date();

  // Find all ACTIVE plans for this user
  const activePlans = await prisma.userPlan.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
  });

  for (const userPlan of activePlans) {
    const { plan, activatedAt, lastPayoutAt, expiresAt, id } = userPlan;
    
    // 1. Check for Expiration
    if (expiresAt && now >= expiresAt) {
      // Mark as completed
      await prisma.userPlan.update({
        where: { id },
        data: { status: "COMPLETED" },
      });
      continue; // Skip profit check if just expired (payout should have happened at 24h mark)
    }

    // 2. Check for Daily Profit
    const referenceDate = lastPayoutAt || activatedAt || userPlan.createdAt;
    
    if (!referenceDate || isNaN(referenceDate.getTime())) {
      console.warn(`Invalid reference date for plan ${id}, user ${userId}`);
      continue;
    }

    const diffMs = now.getTime() - referenceDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours >= 24) {
      const daysToPay = Math.floor(diffHours / 24);
      const totalProfitToPay = daysToPay * plan.dailyProfit;

      console.log(`Processing payout for user ${userId}, plan ${id}: ${daysToPay} days, total profit: ${totalProfitToPay}`);

      if (totalProfitToPay > 0) {
        await prisma.$transaction(async (tx) => {
          // Increment User Balance
          await tx.user.update({
            where: { id: userId },
            data: { balance: { increment: totalProfitToPay } },
          });

          // Update Plan lastPayoutAt
          const newPayoutDate = new Date(referenceDate);
          newPayoutDate.setHours(newPayoutDate.getHours() + (daysToPay * 24));
          
          await tx.userPlan.update({
            where: { id },
            data: { lastPayoutAt: newPayoutDate },
          });

          // Create Transaction Record
          await tx.transaction.create({
            data: {
              userId,
              type: "BONUS", // Using BONUS for profit as per schema types
              amount: totalProfitToPay,
              description: `Daily profit from plan: ${plan.name} (${daysToPay} day(s))`,
            },
          });
        });
      }
    }
  }
}

export function calculatePlanMetrics(userPlan: any) {
  const { plan, activatedAt, lastPayoutAt, createdAt } = userPlan;
  const now = new Date();
  const startDate = activatedAt || createdAt;
  
  // Days completed since activation
  const diffMs = now.getTime() - startDate.getTime();
  const daysCompleted = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  
  // Dollars received so far
  // Logic: Each payout happens at 24h intervals from activation.
  // We can calculate earned profit based on lastPayoutAt vs activatedAt
  let earnedProfit = 0;
  if (lastPayoutAt) {
    const payoutDiffMs = lastPayoutAt.getTime() - startDate.getTime();
    const payoutDays = Math.floor(payoutDiffMs / (1000 * 60 * 60 * 24));
    earnedProfit = payoutDays * plan.dailyProfit;
  }
  
  const remainingProfit = Math.max(0, plan.totalProfit - earnedProfit);
  const daysRemaining = Math.max(0, plan.validity - daysCompleted);

  return {
    daysCompleted,
    earnedProfit: Number(earnedProfit.toFixed(2)),
    remainingProfit: Number(remainingProfit.toFixed(2)),
    daysRemaining,
    dailyProfit: plan.dailyProfit,
    totalProfit: plan.totalProfit,
  };
}
