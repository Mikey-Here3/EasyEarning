"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useSidebar } from "../layout";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const { open } = useSidebar();
  const router = useRouter();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "confirm" | "error" | "success";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  useEffect(() => {
    fetch("/api/team/plans")
      .then((r) => r.json())
      .then(setPlans)
      .finally(() => setLoading(false));
  }, []);

  const adminPlan = plans.find((p) => p.badge === "ADMIN");
  const memberPlan = plans.find((p) => p.badge === "TEAM");

  const handleCreateAdminPlanClick = () => {
    if (!adminPlan) return;
    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Direct Deposit Required",
      message: "To create a Team Admin Plan, you must directly deposit $800 to the Admin TRC20 address. You will receive a $200 instant bonus. Proceed to deposit?",
      onConfirm: () => {
        sessionStorage.setItem("selectedPlan", JSON.stringify(adminPlan));
        router.push("/payment-method");
      }
    });
  };

  const handleJoinTeamClick = () => {
    if (!memberPlan) return;
    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Direct Deposit Required",
      message: "To join a team, you must directly deposit $200 to the Admin TRC20 address. Proceed to deposit?",
      onConfirm: () => {
        sessionStorage.setItem("selectedPlan", JSON.stringify(memberPlan));
        router.push("/payment-method");
      }
    });
  };

  if (loading) {
    return (
      <>
        <Header onMenuClick={open} />
        <main className="pt-20 px-6 pb-28"><div className="skeleton h-48 rounded-lg mt-4" /></main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header onMenuClick={open} />
      <main className="flex-1 p-4 flex flex-col gap-6 pt-20 pb-28 relative">
        <h1 className="text-headline-lg text-on-surface px-2">Team Plans</h1>

        <section className="bg-surface rounded-xl p-6 neu-convex border border-amber-200/50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-headline-lg text-slate-800">Create Team</h3>
              <span className="text-label-caps text-amber-600">Admin Plan</span>
            </div>
            <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-label-caps">
              $800
            </div>
          </div>
          
          <p className="text-body-md text-slate-600 mb-4">
            Become a Team Admin. Pay <span className="font-bold">$800</span> (Direct Deposit). 
            Get <span className="font-bold text-green-600">$200 instant bonus</span> and 
            <span className="font-bold"> $50 daily for 30 days</span>.
          </p>

          <button 
            onClick={handleCreateAdminPlanClick}
            disabled={!adminPlan}
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold active:scale-95 transition-all disabled:opacity-50"
          >
            Direct Buy Admin Plan
          </button>
        </section>

        <section className="bg-surface rounded-xl p-6 neu-convex mt-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-headline-lg text-slate-800">Join a Team</h3>
              <span className="text-label-caps text-secondary">Member Plan</span>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-label-caps">
              $200
            </div>
          </div>
          
          <p className="text-body-md text-slate-600 mb-4">
            To join a team, you must send a <span className="font-bold">$200 fee</span> to the Site Admin's TRC20 address.
            After approval, you will get <span className="font-bold"> $20 daily for 30 days</span>.
          </p>

          <button 
            onClick={handleJoinTeamClick}
            disabled={!memberPlan}
            className="w-full py-3 rounded-full bg-neu-bg neu-convex text-primary font-bold active:scale-95 transition-all border border-primary/20"
          >
            Direct Buy Member Plan
          </button>
        </section>
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
