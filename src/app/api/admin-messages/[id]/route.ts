import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// PUT: Mark message as read
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const message = await prisma.adminMessage.findUnique({ where: { id } });
  if (!message || message.userId !== userId) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await prisma.adminMessage.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}

// DELETE: Admin deletes a message
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.adminMessage.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
