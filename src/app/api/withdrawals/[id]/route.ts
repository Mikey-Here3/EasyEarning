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

  const withdrawal = await prisma.withdrawalRequest.update({
    where: { id },
    data: { status, adminNote },
  });

  if (status === "REJECTED") {
    // Refund the balance if rejected, since it was already deducted on request
    await prisma.user.update({
      where: { id: withdrawal.userId },
      data: { balance: { increment: withdrawal.amount } },
    });
    await prisma.transaction.create({
      data: {
        userId: withdrawal.userId,
        type: "BONUS",
        amount: withdrawal.amount,
        description: `Withdrawal Rejected - Refunded $ ${withdrawal.amount}`,
      },
    });
  } else if (status === "APPROVED") {
    // Note: It's already deducted on request, we just optionally add an informational transaction or do nothing.
    // We already recorded "Withdrawal Requested" when it was created.
    // If you want to update the transaction, you'd need to find it, but leaving as is is fine.
  }

  return NextResponse.json(withdrawal);
}
