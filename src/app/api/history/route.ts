import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  try {
    const [deposits, withdrawals, userPlans] = await Promise.all([
      prisma.depositRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.withdrawalRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" }
      }),
      prisma.userPlan.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return NextResponse.json({ deposits, withdrawals, userPlans });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
