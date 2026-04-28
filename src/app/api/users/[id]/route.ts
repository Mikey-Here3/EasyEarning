import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, name: true, email: true, phone: true, balance: true,
      refCode: true, referredBy: true, role: true, createdAt: true,
      deposits: { orderBy: { createdAt: "desc" }, take: 10 },
      withdrawals: { orderBy: { createdAt: "desc" }, take: 10 },
      userPlans: { include: { plan: true }, orderBy: { createdAt: "desc" } },
      transactions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { balance, bonusAmount, bonusDescription } = await req.json();

  if (bonusAmount) {
    await prisma.user.update({
      where: { id },
      data: { balance: { increment: parseFloat(bonusAmount) } },
    });
    await prisma.transaction.create({
      data: {
        userId: id,
        type: "BONUS",
        amount: parseFloat(bonusAmount),
        description: bonusDescription || "Admin bonus",
      },
    });
    const updatedUser = await prisma.user.findUnique({ where: { id } });
    return NextResponse.json(updatedUser);
  }

  if (balance !== undefined) {
    const user = await prisma.user.update({
      where: { id },
      data: { balance: parseFloat(balance) },
    });
    return NextResponse.json(user);
  }

  return NextResponse.json({ error: "No update data provided" }, { status: 400 });
}
