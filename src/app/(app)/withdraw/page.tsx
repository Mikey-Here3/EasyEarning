"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useSidebar } from "../layout";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function WithdrawPage() {
  const { open } = useSidebar();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [hasDeposited, setHasDeposited] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CRYPTO_TRC20");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Dialog State
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: "confirm" | "error" | "success";
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      setBalance(data.user.balance);
      setHasDeposited(data.hasDeposited);
      setHasActivePlan(data.hasActivePlan);
    }).finally(() => setPageLoading(false));
  }, []);

  const canWithdraw = hasDeposited && hasActivePlan;

  const handleWithdrawClick = () => {
    const num = parseFloat(amount);
    if (!num || num < 50 || num > balance || !accountNumber) return;
    
    setDialog({
      isOpen: true,
      type: "confirm",
      title: "Confirm Withdrawal",
      message: `Are you sure you want to withdraw $${num} to your TRC20 wallet?`,
      onConfirm: executeWithdrawal
    });
  };

  const executeWithdrawal = async () => {
    setDialog({ ...dialog, isOpen: false });
    const num = parseFloat(amount);
    setLoading(true);
    
    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num, method, accountName: "TRC20 Wallet", accountNumber }),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Withdrawal requested successfully!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Withdrawal Failed");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (<><Header onMenuClick={open} /><main className="pt-20 px-6 pb-28"><div className="skeleton h-32 rounded-lg mt-4" /><div className="skeleton h-48 rounded-lg mt-4" /></main><BottomNav /></>);
  }

  return (
    <>
      <Header onMenuClick={open} />
      <main className="flex-1 p-4 flex flex-col gap-6 pt-20 pb-28 relative">
        <h1 className="text-headline-lg text-on-surface px-2">Withdraw Funds</h1>

        <section className="bg-surface rounded-lg p-6 neu-convex flex flex-col items-center text-center">
          <span className="text-label-caps text-on-surface-variant mb-2">Available Balance</span>
          <h2 className="text-display text-primary">$ {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h2>
        </section>

        {!hasDeposited && (
          <div className="bg-error-container p-4 rounded-2xl flex items-center gap-3 neu-convex">
            <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <div><span className="text-body-lg font-semibold text-on-error-container">Deposit Required</span><br />
            <span className="text-body-md text-on-error-container/80">Please deposit first.</span></div>
          </div>
        )}
        {hasDeposited && !hasActivePlan && (
          <div className="bg-secondary-fixed p-4 rounded-2xl flex items-center gap-3 neu-convex">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
            <div><span className="text-body-lg font-semibold text-on-secondary-fixed">Activate a Plan</span><br />
            <span className="text-body-md text-on-secondary-fixed-variant">You need an active plan to withdraw.</span></div>
          </div>
        )}

        {canWithdraw && (
          <div className="space-y-4 w-full">
            <div className="space-y-2"><label className="text-label-caps text-on-surface ml-2">Method</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-neu-bg rounded-xl py-4 px-4 text-body-lg appearance-none neu-convex focus:ring-2 focus:ring-primary-container outline-none">
                <option value="CRYPTO_TRC20">Crypto USDT (TRC20)</option>
              </select>
            </div>
            <div className="space-y-2"><label className="text-label-caps text-on-surface ml-2">TRC20 Wallet Address</label>
              <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="T... (TRC20 Address)"
                className="w-full bg-neu-bg rounded-xl py-4 px-4 text-body-lg neu-concave focus:ring-2 focus:ring-primary-container outline-none" />
            </div>
            <div className="space-y-2"><label className="text-label-caps text-on-surface ml-2">Amount (USDT)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Min $ 50"
                className="w-full bg-neu-bg rounded-xl py-4 px-4 text-body-lg neu-concave focus:ring-2 focus:ring-primary-container outline-none" />
            </div>
            <button onClick={handleWithdrawClick} disabled={!amount || parseFloat(amount) < 50 || !accountNumber || loading}
              className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 mt-4"
              style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
              {loading ? "Processing..." : "Request Withdrawal"}
            </button>
          </div>
        )}

        <div className="bg-neu-bg p-5 rounded-xl neu-convex border border-white/40">
          <h3 className="text-headline-md text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>Important Notes
          </h3>
          <ul className="text-body-md text-on-surface-variant space-y-2 pl-2">
            <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Minimum withdrawal: $ 50</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Processing within 24 hours</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Must have bought a plan at least once (within 60 days)</li>
            <li className="flex items-start gap-2"><span className="text-primary mt-1">•</span>Must refer at least 2 active members</li>
            <li className="flex items-start gap-2 text-red-500 font-bold uppercase"><span className="text-red-500 mt-1">•</span>Uploads must be a clear showcase of time and sent amount</li>
          </ul>
        </div>
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
