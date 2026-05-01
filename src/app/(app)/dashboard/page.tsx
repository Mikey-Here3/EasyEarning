"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import LiveTicker from "@/components/LiveTicker";
import { useSidebar } from "../layout";
import Link from "next/link";

interface DashboardData {
  user: { name: string; refCode: string; balance: number; role: string };
  totalDeposits: number;
  totalWithdrawals: number;
  hasDeposited: boolean;
  hasActivePlan: boolean;
  activePlans: any[];
  teamMembers: number;
  totalCommission: number;
}

export default function DashboardPage() {
  const { open } = useSidebar();
  const [data, setData] = useState<DashboardData | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIrs, setShowIrs] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData).finally(() => setLoading(false));
    fetch("/api/plans").then(r => r.json()).then(setPlans);
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
  if ('error' in data || !data.user) {
    // If the session is stale (user deleted), force a redirect or show nothing
    if (typeof window !== "undefined") window.location.href = "/api/auth/signin";
    return null;
  }
  
  const { user, totalDeposits, totalWithdrawals } = data;

  return (
    <>
      <Header onMenuClick={open} />
      <div className="pt-16"><LiveTicker /></div>
      <main className="pt-4 px-6 flex flex-col gap-6 pb-28 stagger-children">
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
            <span className="text-headline-md">$</span>
            {user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </section>

        {/* Active Plan Display */}
        {data.activePlans && data.activePlans.length > 0 && (
          <section className="bg-surface p-5 rounded-lg neu-convex flex flex-col gap-3 border border-amber-200/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-bl-full pointer-events-none" />
            <div className="flex justify-between items-start">
              <h3 className="text-headline-md text-on-surface text-[16px] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                Your Active Plan
              </h3>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" /> LIVE
              </div>
            </div>
            {data.activePlans.slice(0, 1).map((up: any) => (
              <div key={up.id} className="flex flex-col gap-2 z-10">
                <div className="flex justify-between items-end">
                  <span className="text-headline-lg text-slate-800">{up.plan.name}</span>
                  <span className="text-body-md text-on-surface-variant font-medium">
                    Daily: <span className="text-primary font-bold">${up.plan.dailyProfit}</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-neu-bg neu-concave-sm overflow-hidden mt-1">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" 
                    style={{ 
                      width: `${Math.min(100, Math.max(0, ((new Date().getTime() - new Date(up.activatedAt).getTime()) / (new Date(up.expiresAt).getTime() - new Date(up.activatedAt).getTime())) * 100))}%` 
                    }} 
                  />
                </div>
                <span className="text-[10px] text-on-surface-variant text-right">
                  {Math.max(0, Math.ceil((new Date(up.expiresAt).getTime() - new Date().getTime()) / 86400000))} days left
                </span>
              </div>
            ))}
          </section>
        )}

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
            { icon: "support_agent", label: "Admin Support", action: () => window.location.href = "mailto:admin@easyearning.com" },
            { icon: "campaign", label: "Official Channel", action: () => window.open("https://t.me/easy_earning_001", "_blank") },
            { icon: "verified_user", label: "Internal Revenue Service (IRS) Registered", action: () => setShowIrs(true) },
            { icon: "download", label: "App Download", action: () => alert("App coming soon!") },
          ].map((item) => (
            <button key={item.label} onClick={item.action} className="bg-surface p-4 rounded-lg neu-convex neu-pressed flex items-center gap-3 text-left">
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
            <span className="text-headline-md text-on-surface mt-1">$ {totalDeposits.toLocaleString()}</span>
          </div>
          <div className="bg-surface p-5 rounded-lg neu-convex flex flex-col">
            <span className="material-symbols-outlined text-secondary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            <span className="text-body-md text-on-surface-variant text-[12px]">Total Withdrawals</span>
          </div>
        </section>

        {/* Available Plans */}
        {plans.length > 0 && (
          <section className="flex flex-col gap-4 pb-4">
            <h3 className="text-headline-md text-on-surface text-[16px] px-1">Available Plans</h3>
            <div className="flex flex-col gap-4">
              {plans.map((plan: any) => (
                <div key={plan.id} className="bg-surface rounded-xl p-5 neu-convex border border-outline-variant/40 flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-label-caps text-primary tracking-widest">{plan.name} Plan</span>
                        {plan.badge && (
                          <span className="bg-primary-container text-on-primary-container text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-display text-on-background tracking-tighter">$ {plan.price}</span>
                      <span className="text-body-md text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span> Daily $ {plan.dailyProfit} for {plan.validity} Days
                      </span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface neu-concave-sm flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                    </div>
                  </div>
                  <button onClick={() => {
                      sessionStorage.setItem("selectedPlan", JSON.stringify(plan));
                      window.location.href = "/deposit";
                    }}
                    className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-center text-label-caps font-bold active:scale-95 transition-all">
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* IRS Modal */}
      {showIrs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowIrs(false)}>
          <div className="relative max-w-sm w-full flex justify-center bg-white p-2 rounded-2xl" onClick={e => e.stopPropagation()}>
            <img src="/irs.jpeg" alt="IRS Registered" className="w-full h-auto rounded-xl" />
            <button 
              onClick={() => setShowIrs(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
