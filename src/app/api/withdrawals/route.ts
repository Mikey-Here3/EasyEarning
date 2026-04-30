import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role: string }).role === "ADMIN";

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: isAdmin ? {} : { userId },
    include: { user: { select: { name: true, email: true, balance: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(withdrawals);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { amount, method, accountName, accountNumber } = await req.json();

  // Check balance
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.balance < parseFloat(amount)) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // Check if user has purchased a plan within the last 60 days
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
  
  const recentPlan = await prisma.userPlan.findFirst({
    where: { 
      userId, 
      createdAt: { gte: sixtyDaysAgo }
    },
  });
  if (!recentPlan) {
    return NextResponse.json({ error: "You must have purchased a plan within the last 60 days to withdraw" }, { status: 400 });
  }

  // Check if user has deposited
  const approvedDeposit = await prisma.depositRequest.findFirst({
    where: { userId, status: "APPROVED" },
  });
  if (!approvedDeposit) {
    return NextResponse.json({ error: "You must make a deposit first" }, { status: 400 });
  }

  // Check if user has referred at least 2 people with active plans
  const activeReferralsCount = await prisma.referral.count({
    where: {
      referrerId: userId,
      referred: {
        userPlans: {
          some: { status: "ACTIVE" }
        }
      }
    }
  });

  if (activeReferralsCount < 2) {
    return NextResponse.json({ error: "You must refer at least 2 active members to withdraw" }, { status: 400 });
  }

  const withdrawal = await prisma.withdrawalRequest.create({
    data: { userId, amount: parseFloat(amount), method, accountName, accountNumber },
  });

  return NextResponse.json(withdrawal);
}
