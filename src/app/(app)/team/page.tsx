"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useSidebar } from "../layout";
import Link from "next/link";

export default function TeamPage() {
  const { open } = useSidebar();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "confirm" | "error" | "success";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setBalance(data.user.balance);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCreateAdminPlanClick = () => {
    if (balance < 1000) return;
    
    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Create Team Admin",
      message: "This will deduct $800 from your balance to create a Team Admin Plan. You will get $200 instantly back and $50 daily for 30 days. Proceed?",
      onConfirm: executeCreateAdminPlan
    });
  };

  const executeCreateAdminPlan = async () => {
    setDialog({ ...dialog, isOpen: false });
    setActionLoading(true);

    try {
      const res = await fetch("/api/team/admin-plan", { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setDialog({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "Team Admin Plan created successfully! $200 bonus added."
        });
        setBalance(data.newBalance);
      } else {
        setDialog({
          isOpen: true,
          type: "error",
          title: "Failed",
          message: data.error || "Failed to create plan"
        });
      }
    } catch (err: any) {
      setDialog({
        isOpen: true,
        type: "error",
        title: "Error",
        message: err.message || "An error occurred"
      });
    } finally {
      setActionLoading(false);
    }
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
            Become a Team Admin. Pay <span className="font-bold">$800</span> (requires $1000+ balance). 
            Get <span className="font-bold text-green-600">$200 instant bonus</span> and 
            <span className="font-bold"> $50 daily for 30 days</span>.
          </p>

          <div className="flex justify-between text-body-sm text-slate-500 mb-4 p-3 bg-neu-bg rounded-lg neu-concave-sm">
            <span>Your Balance:</span>
            <span className={balance >= 1000 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button 
            onClick={handleCreateAdminPlanClick}
            disabled={balance < 1000 || actionLoading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold active:scale-95 transition-all disabled:opacity-50"
          >
            {actionLoading ? "Processing..." : balance < 1000 ? "Insufficient Balance ($1000 min)" : "Create Admin Plan"}
          </button>
        </section>

        <section className="bg-surface rounded-xl p-6 neu-convex mt-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-headline-lg text-slate-800">Join a Team</h3>
              <span className="text-label-caps text-secondary">Member Plan</span>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-label-caps">
              $500
            </div>
          </div>
          
          <p className="text-body-md text-slate-600 mb-4">
            To join a team, you must send a <span className="font-bold">$500 fee</span> to the Site Admin's TRC20 address.
            After approval, you will get <span className="font-bold"> $50 daily for 30 days</span>.
          </p>

          <ol className="text-body-sm text-slate-600 space-y-2 mb-6 pl-4 list-decimal marker:text-primary font-medium">
            <li>Go to the <Link href="/deposit" className="text-primary underline">Deposit Page</Link>.</li>
            <li>Send exactly $500 to the Admin TRC20 Address.</li>
            <li>Upload proof and wait for Admin approval.</li>
            <li>Once approved, your balance will be $500.</li>
            <li>Go to <Link href="/plans" className="text-primary underline">Plans</Link> and buy the "Team Member" plan.</li>
          </ol>

          <Link href="/deposit" className="block w-full py-3 rounded-full bg-neu-bg neu-convex text-center text-primary font-bold active:scale-95 transition-all border border-primary/20">
            Go to Deposit
          </Link>
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
