import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role: string }).role === "ADMIN";

  const deposits = await prisma.depositRequest.findMany({
    where: isAdmin ? {} : { userId },
    include: { user: { select: { name: true, email: true, refCode: true } }, account: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(deposits);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { amount, tid, proofUrl, accountId, planId } = await req.json();

  const deposit = await prisma.depositRequest.create({
    data: { userId, accountId, amount: parseFloat(amount), tid, proofUrl: proofUrl || null },
  });

  // If a planId is provided, create a pending UserPlan
  if (planId) {
    await prisma.userPlan.create({
      data: { userId, planId, status: "PENDING" },
    });
  }

  return NextResponse.json(deposit);
}
