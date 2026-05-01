import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  
  try {
    const bonuses = await prisma.bonusRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bonuses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bonuses" }, { status: 500 });
  }
}
