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

  // Dialog State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "confirm" | "error" | "success";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "success", title: "", message: "" });

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

  const handleBuyClick = (plan: Plan) => {
    if (balance >= plan.price) {
      setDialog({
        isOpen: true,
        type: "confirm",
        title: "Confirm Purchase",
        message: `You have $${balance} in your wallet. Buy the ${plan.name} plan for $${plan.price}?`,
        onConfirm: () => executePurchase(plan)
      });
    } else {
      sessionStorage.setItem("selectedPlan", JSON.stringify(plan));
      router.push("/payment-method");
    }
  };

  const executePurchase = async (plan: Plan) => {
    setDialog({ ...dialog, isOpen: false });
    setPurchasing(plan.id);
    
    try {
      const res = await fetch("/api/plans/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id })
      });
      const data = await res.json();
      
      if (data.error) {
        setDialog({
          isOpen: true,
          type: "error",
          title: "Purchase Failed",
          message: data.error
        });
      } else {
        setDialog({
          isOpen: true,
          type: "success",
          title: "Plan Activated!",
          message: "Your new plan has been activated successfully.",
          onConfirm: () => router.push("/active-plans")
        });
      }
    } catch (err) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "An unexpected error occurred."
      });
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <>
      <Header onMenuClick={open} />
      <main className="pt-24 pb-32 px-6 relative">
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
                <PlanCard plan={plan} onBuy={handleBuyClick} featured={index === 1} />
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

      {/* Custom Dialog */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface w-full max-w-sm rounded-2xl p-6 neu-convex shadow-2xl animate-slide-up relative">
            <div className="flex items-center gap-3 mb-4">
              {dialog.type === "confirm" && <span className="material-symbols-outlined text-amber-500 text-3xl">help</span>}
              {dialog.type === "success" && <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>}
              {dialog.type === "error" && <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>}
              <h3 className="text-headline-lg text-slate-800">{dialog.title}</h3>
            </div>
            <p className="text-body-md text-slate-600 mb-6">{dialog.message}</p>
            
            <div className="flex gap-3 justify-end">
              {dialog.type === "confirm" && (
                <button 
                  onClick={() => setDialog({ ...dialog, isOpen: false })}
                  className="px-4 py-2 rounded-full text-slate-500 font-bold active:scale-95 transition-transform"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={() => {
                  if (dialog.onConfirm) dialog.onConfirm();
                  else setDialog({ ...dialog, isOpen: false });
                }}
                className={`px-6 py-2 rounded-full font-bold active:scale-95 transition-transform shadow-md ${
                  dialog.type === "error" ? "bg-red-500 text-white" : 
                  dialog.type === "success" ? "bg-green-500 text-white" : 
                  "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900"
                }`}
              >
                {dialog.type === "confirm" ? "Confirm" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
