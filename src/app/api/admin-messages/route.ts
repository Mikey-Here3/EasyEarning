import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Fetch messages (admin gets all, user gets their own unread)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const isAdmin = (session.user as { role: string }).role === "ADMIN";

  if (isAdmin) {
    const messages = await prisma.adminMessage.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(messages);
  }

  // For regular users, get unread messages
  const messages = await prisma.adminMessage.findMany({
    where: { userId, isRead: false },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(messages);
}

// POST: Admin sends a message to a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, title, message, type } = await req.json();

  if (!userId || !title || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const adminMessage = await prisma.adminMessage.create({
    data: { userId, title, message, type: type || "CUSTOM" },
  });

  return NextResponse.json(adminMessage);
}
