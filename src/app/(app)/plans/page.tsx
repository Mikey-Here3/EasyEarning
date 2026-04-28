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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans").then(r => r.json()).then(setPlans).finally(() => setLoading(false));
  }, []);

  const handleBuy = (plan: Plan) => {
    sessionStorage.setItem("selectedPlan", JSON.stringify(plan));
    router.push("/payment-method");
  };

  return (
    <>
      <Header onMenuClick={open} />
      <main className="pt-24 pb-32 px-6">
        <div className="flex items-center justify-center mb-8">
          <div className="px-6 py-2 rounded-full bg-neu-bg" style={{ boxShadow: "inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF" }}>
            <h1 className="text-headline-md text-slate-800 tracking-tight">Investment Plans</h1>
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
              <PlanCard key={plan.id} plan={plan} onBuy={handleBuy} featured={index === 1} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
