"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const adminNav = [
  { label: "Dashboard", icon: "dashboard", href: "/admin" },
  { label: "Users", icon: "group", href: "/admin/users" },
  { label: "Plans", icon: "payments", href: "/admin/plans" },
  { label: "Deposit Accounts", icon: "account_balance", href: "/admin/accounts" },
  { label: "Deposits", icon: "savings", href: "/admin/deposits" },
  { label: "Withdrawals", icon: "outbox", href: "/admin/withdrawals" },
  { label: "Bonus", icon: "redeem", href: "/admin/bonus" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col fixed h-full z-50">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-black text-amber-400 uppercase tracking-wider">Easy Earning</h1>
          <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                }`}>
                <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all mb-2">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>User Panel
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
            <span className="material-symbols-outlined text-[20px]">logout</span>Logout
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 ml-64 p-8 min-h-screen">{children}</main>
    </div>
  );
}
