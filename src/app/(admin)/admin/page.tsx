import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") redirect("/dashboard");

  const [users, deposits, withdrawals, plans, pendingDeposits, pendingWithdrawals, activePlansCount, pendingBonuses, totalBonuses] = await Promise.all([
    prisma.user.count(),
    prisma.depositRequest.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
    prisma.withdrawalRequest.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
    prisma.plan.count({ where: { isActive: true } }),
    prisma.depositRequest.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.userPlan.count({ where: { status: "ACTIVE" } }),
    prisma.bonusRequest.count({ where: { status: "PENDING" } }),
    prisma.bonusRequest.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { name: true, email: true, createdAt: true, balance: true },
  });

  const stats = [
    { label: "Total Users", value: users.toString(), icon: "group", color: "text-blue-400", bg: "bg-blue-500/10", href: "/admin/users" },
    { label: "Active Plans", value: activePlansCount.toString(), icon: "bolt", color: "text-amber-400", bg: "bg-amber-500/10", href: "/admin/active-plans" },
    { label: "Plan Types", value: plans.toString(), icon: "payments", color: "text-cyan-400", bg: "bg-cyan-500/10", href: "/admin/plans" },
    { label: "Total Deposits", value: `$ ${(deposits._sum.amount || 0).toLocaleString()}`, icon: "savings", color: "text-green-400", bg: "bg-green-500/10", href: "/admin/deposits" },
    { label: "Total Withdrawals", value: `$ ${(withdrawals._sum.amount || 0).toLocaleString()}`, icon: "outbox", color: "text-red-400", bg: "bg-red-500/10", href: "/admin/withdrawals" },
    { label: "Total Bonuses", value: `$ ${(totalBonuses._sum.amount || 0).toLocaleString()}`, icon: "redeem", color: "text-pink-400", bg: "bg-pink-500/10", href: "/admin/bonus" },
    { label: "Pending Deposits", value: pendingDeposits.toString(), icon: "pending", color: "text-orange-400", bg: "bg-orange-500/10", href: "/admin/deposits" },
    { label: "Pending Withdrawals", value: pendingWithdrawals.toString(), icon: "schedule", color: "text-purple-400", bg: "bg-purple-500/10", href: "/admin/withdrawals" },
    { label: "Pending Bonuses", value: pendingBonuses.toString(), icon: "hourglass_top", color: "text-rose-400", bg: "bg-rose-500/10", href: "/admin/bonus" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of your platform</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/admin/messages" className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-500/30 transition-colors">
            <span className="material-symbols-outlined text-[16px]">send</span>Send Message
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:border-slate-600 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined text-[22px] sm:text-[28px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-slate-400 truncate">{s.label}</p>
              <p className="text-lg sm:text-2xl font-bold text-white mt-0.5 truncate">{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Plans", icon: "bolt", href: "/admin/active-plans", color: "text-amber-400" },
          { label: "Send Message", icon: "mail", href: "/admin/messages", color: "text-blue-400" },
          { label: "Send Bonus", icon: "redeem", href: "/admin/bonus", color: "text-green-400" },
          { label: "Manage Users", icon: "manage_accounts", href: "/admin/users", color: "text-purple-400" },
        ].map((action) => (
          <Link key={action.label} href={action.href} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-slate-600 transition-all hover:scale-[1.02]">
            <span className={`material-symbols-outlined text-[24px] ${action.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
            <span className="text-xs text-slate-300 font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Users</h2>
          <Link href="/admin/users" className="text-amber-400 text-xs font-bold hover:text-amber-300">View All →</Link>
        </div>
        <div className="space-y-3">
          {recentUsers.map((u) => (
            <div key={u.email} className="flex items-center justify-between bg-slate-700/30 rounded-xl p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-slate-900 font-bold text-sm flex-shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm text-amber-400 font-semibold">$ {u.balance.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
