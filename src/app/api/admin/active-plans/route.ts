import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userPlans = await prisma.userPlan.findMany({
    include: {
      user: { select: { name: true, email: true, balance: true, refCode: true } },
      plan: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(userPlans);
}
