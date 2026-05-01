import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = await params;
  const { status } = await req.json();

  if (status !== "APPROVED" && status !== "REJECTED") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const bonus = await prisma.bonusRequest.findUnique({ where: { id } });
    if (!bonus || bonus.userId !== userId) {
      return NextResponse.json({ error: "Bonus not found" }, { status: 404 });
    }
    if (bonus.status !== "PENDING") {
      return NextResponse.json({ error: "Bonus already processed" }, { status: 400 });
    }

    if (status === "APPROVED") {
      await prisma.$transaction([
        prisma.bonusRequest.update({
          where: { id },
          data: { status: "APPROVED" },
        }),
        prisma.user.update({
          where: { id: userId },
          data: { balance: { increment: bonus.amount } },
        }),
        prisma.transaction.create({
          data: {
            userId,
            type: "BONUS",
            amount: bonus.amount,
            description: bonus.description,
          },
        }),
      ]);
    } else {
      await prisma.bonusRequest.update({
        where: { id },
        data: { status: "REJECTED" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process bonus" }, { status: 500 });
  }
}
