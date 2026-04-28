"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useSidebar } from "../layout";
import { useRouter } from "next/navigation";

interface DepositAccount {
  id: string; name: string; number: string; method: string;
}

export default function DepositPage() {
  const { open } = useSidebar();
  const router = useRouter();
  const [account, setAccount] = useState<DepositAccount | null>(null);
  const [tid, setTid] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string; name: string; price: number } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("selectedPlan");
    if (stored) {
      const plan = JSON.parse(stored);
      setSelectedPlan(plan);
      setAmount(plan.price.toString());
    }
    fetch("/api/deposit-accounts").then(r => r.json()).then(data => {
      if (!data.error) {
        if (Array.isArray(data)) {
          setAccount(data[0] || null);
        } else {
          setAccount(data);
        }
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid || !proofUrl || !account) return;
    setLoading(true);
    await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(amount) || 0,
        tid,
        proofUrl,
        accountId: account.id,
        planId: selectedPlan?.id,
      }),
    });
    setLoading(false);
    setSuccess(true);
    sessionStorage.removeItem("selectedPlan");
    setTimeout(() => router.push("/dashboard"), 2500);
  };

  if (success) {
    return (
      <>
        <Header showBack showMenu={false} />
        <main className="mt-16 px-4 pt-6 pb-10 flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center neu-convex">
            <span className="material-symbols-outlined text-[48px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-headline-lg text-on-surface text-center">Deposit Submitted!</h2>
          <p className="text-body-md text-on-surface-variant text-center max-w-[280px]">
            Your deposit request has been submitted for admin review. You will be notified once approved.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header showBack showMenu={false} />
      <main className="mt-16 px-4 pt-6 pb-10 flex flex-col gap-6">
        <div className="px-2">
          <h2 className="text-headline-lg text-slate-900">Deposit Funds</h2>
          <p className="text-body-md text-slate-500 mt-1">Transfer to the address below and submit your TID & Proof.</p>
        </div>

        {selectedPlan && (
          <div className="bg-primary-container/20 p-3 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">info</span>
            <span className="text-body-md text-on-primary-container">
              Plan: <strong>{selectedPlan.name}</strong> — $ {selectedPlan.price.toLocaleString()}
            </span>
          </div>
        )}

        {account ? (
          <div className="bg-neu-bg rounded-2xl p-6 neu-convex flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <div className="w-10 h-10 rounded-full bg-neu-bg neu-concave-sm flex items-center justify-center text-amber-500">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <span className="text-headline-md text-slate-800">Transfer to {account.method}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-label-caps text-slate-500 mb-1">WALLET ADDRESS (TRC20)</span>
                <span className="text-headline-md tracking-wider text-slate-900 break-all">{account.number}</span>
              </div>
              <button onClick={() => navigator.clipboard.writeText(account.number)}
                className="w-10 h-10 rounded-full bg-neu-bg neu-button flex items-center justify-center text-amber-600 active:scale-95 shrink-0 ml-4">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 p-4 rounded-xl text-red-700 text-body-md">No deposit accounts available. Please contact admin.</div>
        )}

        <form className="flex flex-col gap-4 mt-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-slate-600 px-2">AMOUNT (USD)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50" required
              className="w-full bg-neu-bg rounded-xl px-4 py-4 text-body-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-slate-600 px-2">TRANSACTION ID (TID)</label>
            <input type="text" value={tid} onChange={(e) => setTid(e.target.value)} placeholder="e.g. 1234567890" required
              className="w-full bg-neu-bg rounded-xl px-4 py-4 text-body-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-slate-600 px-2">PROOF URL (SCREENSHOT LINK)</label>
            <input type="text" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://..." required
              className="w-full bg-neu-bg rounded-xl px-4 py-4 text-body-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }} />
          </div>
          <button type="submit" disabled={!amount || !tid || !proofUrl || loading || !account}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 mt-4"
            style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
            <span className="material-symbols-outlined text-[18px]">send</span>
            {loading ? "Submitting..." : "Submit Deposit"}
          </button>
        </form>
      </main>
    </>
  );
}
