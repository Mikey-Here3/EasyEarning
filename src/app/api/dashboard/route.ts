import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { processUserPlans, calculatePlanMetrics } from "@/lib/plan-utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  console.log(`Dashboard hit for user: ${userId}`);

  // Process plans before returning dashboard data
  try {
    console.log(`Processing plans for ${userId}...`);
    await processUserPlans(userId);
    console.log(`Plans processed for ${userId}`);
  } catch (error) {
    console.error("Error processing plans in dashboard route:", error);
  }

  console.log(`Fetching user data for ${userId}...`);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    console.warn(`User ${userId} not found in database`);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  console.log(`User data fetched for ${userId}`);

  const totalDeposits = await prisma.depositRequest.aggregate({
    where: { userId, status: "APPROVED" },
    _sum: { amount: true },
  });

  const totalWithdrawals = await prisma.withdrawalRequest.aggregate({
    where: { userId, status: "APPROVED" },
    _sum: { amount: true },
  });

  const userPlans = await prisma.userPlan.findMany({
    where: { userId, status: "ACTIVE" },
    include: { plan: true },
  });

  const activePlans = userPlans.map(up => ({
    ...up,
    ...calculatePlanMetrics(up)
  }));

  const hasDeposited = (await prisma.depositRequest.count({ where: { userId, status: "APPROVED" } })) > 0;
  const hasActivePlan = activePlans.length > 0;

  const teamMembers = await prisma.referral.count({ where: { referrerId: userId } });
  const totalCommission = await prisma.referral.aggregate({
    where: { referrerId: userId },
    _sum: { commission: true },
  });

  const pendingBonuses = await prisma.bonusRequest.findMany({
    where: { userId, status: "PENDING" },
    select: { id: true, amount: true, description: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, refCode: user.refCode, balance: user.balance, role: user.role },
    totalDeposits: totalDeposits._sum.amount || 0,
    totalWithdrawals: totalWithdrawals._sum.amount || 0,
    activePlans,
    hasDeposited,
    hasActivePlan,
    teamMembers,
    totalCommission: totalCommission._sum.commission || 0,
    pendingBonuses,
  });
}
