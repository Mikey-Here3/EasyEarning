import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") redirect("/dashboard");

  const [users, deposits, withdrawals, plans, pendingDeposits, pendingWithdrawals] = await Promise.all([
    prisma.user.count(),
    prisma.depositRequest.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
    prisma.withdrawalRequest.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.depositRequest.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Total Users", value: users.toString(), icon: "group", color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Plans", value: plans.toString(), icon: "payments", color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Total Deposits", value: `Rs. ${(deposits._sum.amount || 0).toLocaleString()}`, icon: "savings", color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Total Withdrawals", value: `Rs. ${(withdrawals._sum.amount || 0).toLocaleString()}`, icon: "outbox", color: "text-red-400", bg: "bg-red-500/10" },
    { label: "Pending Deposits", value: pendingDeposits.toString(), icon: "pending", color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Pending Withdrawals", value: pendingWithdrawals.toString(), icon: "schedule", color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center gap-4 hover:border-slate-600 transition-colors">
            <div className={`w-14 h-14 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[28px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div><p className="text-sm text-slate-400">{s.label}</p><p className="text-2xl font-bold text-white mt-1">{s.value}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
