import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { planId } = await req.json();

  if (!planId) return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });

  // Get user and plan within a transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      const plan = await tx.plan.findUnique({ where: { id: planId } });

      if (!user) throw new Error("User not found");
      if (!plan || !plan.isActive) throw new Error("Plan not available");

      if (user.balance < plan.price) {
        throw new Error("Insufficient balance");
      }

      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: plan.price } },
      });

      // Activate Plan
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + plan.validity);

      const userPlan = await tx.userPlan.create({
        data: {
          userId,
          planId,
          status: "ACTIVE",
          activatedAt: new Date(),
          expiresAt,
        },
      });

      // Transaction Record
      await tx.transaction.create({
        data: {
          userId,
          type: "PLAN_PURCHASE",
          amount: -plan.price,
          description: `Plan purchased from balance: ${plan.name}`,
        },
      });

      // Referral Commission
      const referral = await tx.referral.findFirst({
        where: { referredId: userId },
      });

      if (referral) {
        const commission = (plan.refBonus / 100) * plan.price;
        await tx.user.update({
          where: { id: referral.referrerId },
          data: { balance: { increment: commission } },
        });
        await tx.referral.update({
          where: { id: referral.id },
          data: { commission: { increment: commission } },
        });
        await tx.transaction.create({
          data: {
            userId: referral.referrerId,
            type: "COMMISSION",
            amount: commission,
            description: `Referral commission from ${user.name}`,
          },
        });
      }

      return userPlan;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to purchase plan" }, { status: 400 });
  }
}
