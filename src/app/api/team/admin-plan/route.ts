import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");

      if (user.balance < 1000) {
        throw new Error("Insufficient balance. Must have at least $1000.");
      }

      // Find the Team Admin plan
      const adminPlan = await tx.plan.findFirst({
        where: { badge: "ADMIN", price: 800 },
      });

      if (!adminPlan) {
        throw new Error("Team Admin plan not configured in system.");
      }

      // Deduct 800
      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: 800 } },
      });

      // Add instant 200 bonus
      const finalUser = await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: 200 } },
      });

      // Transaction Record: -800
      await tx.transaction.create({
        data: {
          userId,
          type: "PLAN_PURCHASE",
          amount: -800,
          description: `Team Admin Plan creation fee`,
        },
      });

      // Transaction Record: +200
      await tx.transaction.create({
        data: {
          userId,
          type: "BONUS",
          amount: 200,
          description: `Instant Team Admin creation bonus`,
        },
      });

      // Activate Plan
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + adminPlan.validity);

      await tx.userPlan.create({
        data: {
          userId,
          planId: adminPlan.id,
          status: "ACTIVE",
          activatedAt: new Date(),
          expiresAt,
        },
      });

      return { success: true, newBalance: finalUser.balance };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create Team Admin plan" }, { status: 400 });
  }
}
