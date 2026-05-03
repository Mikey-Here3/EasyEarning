import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const userPlan = await prisma.userPlan.findUnique({
      where: { id },
      include: { user: true, plan: true }
    });

    if (!userPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Update status to CANCELLED
    await prisma.userPlan.update({
      where: { id },
      data: { status: "CANCELLED" }
    });

    // Create a transaction record for history
    await prisma.transaction.create({
      data: {
        userId: userPlan.userId,
        type: "PENALTY", // Using PENALTY or something to indicate plan was cancelled
        amount: 0,
        description: `Plan revoked by Admin: ${userPlan.plan.name}`,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Revoke Plan PATCH Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
