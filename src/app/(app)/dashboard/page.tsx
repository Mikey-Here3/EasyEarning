"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useSidebar } from "../layout";
import Link from "next/link";

interface DashboardData {
  user: { name: string; refCode: string; balance: number; role: string };
  totalDeposits: number;
  totalWithdrawals: number;
  hasDeposited: boolean;
  hasActivePlan: boolean;
  teamMembers: number;
  totalCommission: number;
}

export default function DashboardPage() {
  const { open } = useSidebar();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <Header onMenuClick={open} />
        <main className="pt-20 px-6 flex flex-col gap-6 pb-28">
          <div className="skeleton h-24 rounded-lg" />
          <div className="skeleton h-32 rounded-lg" />
          <div className="grid grid-cols-4 gap-4"><div className="skeleton h-20 rounded-full" /><div className="skeleton h-20 rounded-full" /><div className="skeleton h-20 rounded-full" /><div className="skeleton h-20 rounded-full" /></div>
        </main>
        <BottomNav />
      </>
    );
  }

  if (!data) return null;
  const { user, totalDeposits, totalWithdrawals } = data;

  return (
    <>
      <Header onMenuClick={open} />
      <main className="pt-20 px-6 flex flex-col gap-6 pb-28 stagger-children">
        {/* User Header */}
        <section className="bg-gradient-to-br from-primary-container to-primary-fixed rounded-lg p-6 neu-convex flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-surface neu-convex flex items-center justify-center border-2 border-primary-fixed-dim overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-slate-900 font-bold text-xl">
              {user.name.charAt(0)}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-body-md text-on-primary-container opacity-80">Welcome back,</span>
            <h2 className="text-headline-md text-on-primary-container">{user.name}</h2>
            <span className="text-label-caps text-primary mt-1 bg-surface/50 px-2 py-0.5 rounded-full inline-block w-max">
              Ref: {user.refCode}
            </span>
          </div>
        </section>

        {/* Balance Card */}
        <section className="bg-surface rounded-lg p-6 neu-convex flex flex-col items-center justify-center text-center">
          <span className="text-body-md text-on-surface-variant mb-2">Total Account Balance</span>
          <div className="text-display text-primary flex items-baseline gap-1">
            <span className="text-headline-md">Rs.</span>
            {user.balance.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-4 gap-4 pt-2">
          {[
            { icon: "add_card", label: "Deposit", href: "/payment-method" },
            { icon: "account_balance", label: "Withdraw", href: "/withdraw" },
            { icon: "bar_chart", label: "My Plans", href: "/active-plans" },
            { icon: "groups", label: "My Team", href: "/referral" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-full bg-surface neu-convex neu-pressed flex items-center justify-center text-primary group-hover:text-secondary transition-colors">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
              </div>
              <span className="text-label-caps text-on-surface-variant text-center text-[10px]">{item.label}</span>
            </Link>
          ))}
        </section>

        {/* Secondary Actions */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { icon: "support_agent", label: "Admin Support" },
            { icon: "campaign", label: "Official Channel" },
            { icon: "verified_user", label: "FBR Registered" },
            { icon: "download", label: "App Download" },
          ].map((item) => (
            <button key={item.label} className="bg-surface p-4 rounded-lg neu-convex neu-pressed flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-primary neu-concave-sm">
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
              </div>
              <span className="text-body-md font-semibold text-on-surface">{item.label}</span>
            </button>
          ))}
        </section>

        {/* Referral Link */}
        <section className="bg-surface p-5 rounded-lg neu-convex flex flex-col gap-3">
          <h3 className="text-headline-md text-on-surface text-[16px]">Invite Friends &amp; Earn</h3>
          <div className="flex items-center bg-surface rounded-full p-1 neu-concave">
            <div className="flex-1 px-4 overflow-hidden">
              <span className="text-body-md text-on-surface-variant truncate block w-full select-all">easyearning.com/ref/{user.refCode}</span>
            </div>
            <button onClick={() => navigator.clipboard.writeText(`easyearning.com/ref/${user.refCode}`)}
              className="bg-primary text-on-primary px-4 py-2 rounded-full text-label-caps neu-convex active:scale-95 transition-transform flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 pb-4">
          <div className="bg-surface p-5 rounded-lg neu-convex flex flex-col">
            <span className="material-symbols-outlined text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
            <span className="text-body-md text-on-surface-variant text-[12px]">Total Deposits</span>
            <span className="text-headline-md text-on-surface mt-1">Rs. {totalDeposits.toLocaleString()}</span>
          </div>
          <div className="bg-surface p-5 rounded-lg neu-convex flex flex-col">
            <span className="material-symbols-outlined text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            <span className="text-body-md text-on-surface-variant text-[12px]">Total Withdrawals</span>
            <span className="text-headline-md text-on-surface mt-1">Rs. {totalWithdrawals.toLocaleString()}</span>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
