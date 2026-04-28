import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, phone: true, balance: true,
      refCode: true, referredBy: true, role: true, createdAt: true,
      status: true, penaltyAmount: true,
      _count: { select: { deposits: true, withdrawals: true, userPlans: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}
