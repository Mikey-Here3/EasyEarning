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
  const { status, penaltyAmount, balance } = await req.json();

  const user = await prisma.user.update({
    where: { id },
    data: {
      status,
      penaltyAmount: status === "RESTRICTED" ? parseFloat(penaltyAmount) : 0,
      balance: balance !== undefined ? parseFloat(balance) : undefined,
    },
  });

  return NextResponse.json(user);
}
