import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PUT: Admin revokes a bonus request
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const bonus = await prisma.bonusRequest.findUnique({ where: { id } });
    if (!bonus) {
      return NextResponse.json({ error: "Bonus not found" }, { status: 404 });
    }

    if (bonus.status === "APPROVED") {
      // Reverse the balance and reject the bonus
      await prisma.$transaction([
        prisma.bonusRequest.update({
          where: { id },
          data: { status: "REJECTED" },
        }),
        prisma.user.update({
          where: { id: bonus.userId },
          data: { balance: { decrement: bonus.amount } },
        }),
        prisma.transaction.create({
          data: {
            userId: bonus.userId,
            type: "PENALTY",
            amount: -bonus.amount,
            description: `Bonus revoked: ${bonus.description}`,
          },
        }),
      ]);
    } else {
      // Just reject the pending bonus
      await prisma.bonusRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to revoke bonus" }, { status: 500 });
  }
}
