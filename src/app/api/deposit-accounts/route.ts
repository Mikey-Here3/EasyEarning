import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: User gets a random active account (weighted by priority), Admin gets all
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = (session.user as { role: string }).role === "ADMIN";

  if (isAdmin) {
    const accounts = await prisma.depositAccount.findMany({ orderBy: { priority: "desc" } });
    return NextResponse.json(accounts);
  }

  // For users: weighted random selection based on priority
  const activeAccounts = await prisma.depositAccount.findMany({ where: { isActive: true } });
  if (activeAccounts.length === 0) {
    return NextResponse.json({ error: "No deposit accounts available" }, { status: 404 });
  }

  // Weighted random: higher priority = more likely
  const totalWeight = activeAccounts.reduce((sum, a) => sum + a.priority, 0);
  let random = Math.random() * totalWeight;
  let selected = activeAccounts[0];
  for (const account of activeAccounts) {
    random -= account.priority;
    if (random <= 0) { selected = account; break; }
  }

  return NextResponse.json(selected);
}

// POST: Admin creates new deposit account
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const account = await prisma.depositAccount.create({ data });
  return NextResponse.json(account);
}
