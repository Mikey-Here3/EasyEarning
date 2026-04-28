"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import EmptyStateCard from "@/components/EmptyStateCard";
import { useSidebar } from "../layout";

interface ActivePlan {
  id: string;
  status: string;
  activatedAt: string;
  expiresAt: string;
  plan: { name: string; badge: string; price: number; dailyProfit: number; totalProfit: number; validity: number };
}

export default function ActivePlansPage() {
  const { open } = useSidebar();
  const [plans, setPlans] = useState<ActivePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      setPlans(data.activePlans || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header onMenuClick={open} />
      <main className="w-full flex-grow pt-24 pb-32 px-6 flex flex-col gap-6">
        <section className="bg-surface rounded-2xl p-6 flex items-center justify-between neu-convex">
          <h1 className="text-headline-md text-on-surface">My Active Plans</h1>
          <div className="bg-error-container text-on-error-container px-3 py-1 rounded-full flex items-center gap-1 neu-convex">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse-dot" /><span className="text-label-caps">LIVE</span>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col gap-6"><div className="skeleton h-48 rounded-[2rem]" /><div className="skeleton h-48 rounded-[2rem]" /></div>
        ) : plans.length === 0 ? (
          <EmptyStateCard icon="monitoring" title="No Active Plans" description="You don't have any active plans. Explore investment plans to start earning." actionLabel="Explore Plans" actionHref="/plans" />
        ) : (
          <div className="flex flex-col gap-6 stagger-children">
            {plans.map((up) => {
              const activated = new Date(up.activatedAt);
              const expires = new Date(up.expiresAt);
              const now = new Date();
              const total = expires.getTime() - activated.getTime();
              const elapsed = now.getTime() - activated.getTime();
              const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
              const daysLeft = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / 86400000));
              return (
                <div key={up.id} className="bg-neu-bg rounded-[2rem] p-6 neu-convex-lg border border-amber-200/50">
                  <div className="flex justify-between items-start mb-4">
                    <div><h3 className="text-headline-lg text-slate-800">{up.plan.name}</h3><span className="text-label-caps text-amber-600">{up.plan.badge}</span></div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-label-caps flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />ACTIVE
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-body-md text-slate-600 mb-2"><span>Progress</span><span>{daysLeft} days left</span></div>
                    <div className="w-full h-3 rounded-full bg-neu-bg neu-concave-sm overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center p-2 rounded-xl bg-neu-bg neu-concave-sm"><span className="text-[10px] text-slate-500 font-bold uppercase">Daily</span><span className="text-body-lg font-semibold text-slate-800">Rs. {up.plan.dailyProfit}</span></div>
                    <div className="flex flex-col items-center p-2 rounded-xl bg-neu-bg neu-concave-sm"><span className="text-[10px] text-slate-500 font-bold uppercase">Total</span><span className="text-body-lg font-semibold text-slate-800">Rs. {up.plan.totalProfit}</span></div>
                    <div className="flex flex-col items-center p-2 rounded-xl bg-neu-bg neu-concave-sm"><span className="text-[10px] text-slate-500 font-bold uppercase">Invested</span><span className="text-body-lg font-semibold text-slate-800">Rs. {up.plan.price}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
