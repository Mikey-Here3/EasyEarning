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

  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: withdrawal.userId },
      data: { balance: { decrement: withdrawal.amount } },
    });
    await prisma.transaction.create({
      data: {
        userId: withdrawal.userId,
        type: "WITHDRAWAL",
        amount: -withdrawal.amount,
        description: `Withdrawal approved - $ ${withdrawal.amount}`,
      },
    });
  }

  return NextResponse.json(withdrawal);
}
