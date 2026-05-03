import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, message, type } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get all active users
    const users = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true }
    });

    // Create messages in bulk
    const messageData = users.map(user => ({
      userId: user.id,
      title,
      message,
      type: type || "CUSTOM",
    }));

    await prisma.adminMessage.createMany({
      data: messageData,
    });

    return NextResponse.json({ success: true, count: users.length });
  } catch (error: any) {
    console.error("Universal Message POST Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
