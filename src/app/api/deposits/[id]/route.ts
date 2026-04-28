import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status, adminNote } = await req.json();

  const deposit = await prisma.depositRequest.update({
    where: { id },
    data: { status, adminNote },
  });

  if (status === "APPROVED") {
    // Add balance to user
    await prisma.user.update({
      where: { id: deposit.userId },
      data: { balance: { increment: deposit.amount } },
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: deposit.userId,
        type: "DEPOSIT",
        amount: deposit.amount,
        description: `Deposit approved - TID: ${deposit.tid}`,
      },
    });

    // Activate any pending plans for this user
    const pendingPlans = await prisma.userPlan.findMany({
      where: { userId: deposit.userId, status: "PENDING" },
      include: { plan: true },
    });

    for (const up of pendingPlans) {
      if (deposit.amount >= up.plan.price) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + up.plan.validity);
        await prisma.userPlan.update({
          where: { id: up.id },
          data: { status: "ACTIVE", activatedAt: new Date(), expiresAt },
        });

        // Deduct plan price from balance
        await prisma.user.update({
          where: { id: deposit.userId },
          data: { balance: { decrement: up.plan.price } },
        });

        await prisma.transaction.create({
          data: {
            userId: deposit.userId,
            type: "PLAN_PURCHASE",
            amount: -up.plan.price,
            description: `Plan activated: ${up.plan.name}`,
          },
        });

        // Handle referral commission
        const referral = await prisma.referral.findFirst({
          where: { referredId: deposit.userId },
        });
        if (referral) {
          const commission = (up.plan.refBonus / 100) * up.plan.price;
          await prisma.user.update({
            where: { id: referral.referrerId },
            data: { balance: { increment: commission } },
          });
          await prisma.referral.update({
            where: { id: referral.id },
            data: { commission: { increment: commission } },
          });
          await prisma.transaction.create({
            data: {
              userId: referral.referrerId,
              type: "COMMISSION",
              amount: commission,
              description: `Referral commission from ${deposit.userId}`,
            },
          });
        }
        break; // Only activate one plan per deposit
      }
    }
  }

  return NextResponse.json(deposit);
}
