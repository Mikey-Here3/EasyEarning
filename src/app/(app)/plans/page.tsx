"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PlanCard from "@/components/PlanCard";
import { useSidebar } from "../layout";
import { useRouter } from "next/navigation";

interface Plan {
  id: string; name: string; badge: string; price: number;
  dailyProfit: number; validity: number; totalProfit: number; refBonus: number;
}

export default function PlansPage() {
  const { open } = useSidebar();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/plans").then(r => r.json()),
      fetch("/api/dashboard").then(r => r.json())
    ]).then(([plansData, dashboardData]) => {
      setPlans(plansData);
      if (dashboardData && dashboardData.user) {
        setBalance(dashboardData.user.balance);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleBuy = async (plan: Plan) => {
    if (balance >= plan.price) {
      if (!confirm(`You have $ ${balance} in your wallet. Buy ${plan.name} for $ ${plan.price}?`)) return;
      
      setPurchasing(plan.id);
      const res = await fetch("/api/plans/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id })
      });
      const data = await res.json();
      setPurchasing(null);

      if (data.error) {
        alert(data.error);
      } else {
        alert("Plan activated successfully!");
        router.push("/active-plans");
      }
    } else {
      // Not enough balance, need to deposit
      sessionStorage.setItem("selectedPlan", JSON.stringify(plan));
      router.push("/payment-method");
    }
  };

  return (
    <>
      <Header onMenuClick={open} />
      <main className="pt-24 pb-32 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="px-6 py-2 rounded-full bg-neu-bg" style={{ boxShadow: "inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF" }}>
            <h1 className="text-headline-md text-slate-800 tracking-tight">Investment Plans</h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 font-bold block">WALLET</span>
            <span className="text-lg font-black text-amber-500">$ {balance.toLocaleString()}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-8">
            <div className="skeleton h-80 rounded-[2rem]" />
            <div className="skeleton h-80 rounded-[2rem]" />
          </div>
        ) : plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-slate-300 mb-4">payments</span>
            <p className="text-headline-md text-slate-500">No plans available yet</p>
            <p className="text-body-md text-slate-400 mt-2">Check back soon for new investment opportunities.</p>
          </div>
        ) : (
          <div className="stagger-children">
            {plans.map((plan, index) => (
              <div key={plan.id} className="relative">
                <PlanCard plan={plan} onBuy={handleBuy} featured={index === 1} />
                {purchasing === plan.id && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-[2rem] flex items-center justify-center z-10">
                    <span className="text-amber-600 font-bold animate-pulse">Activating...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
