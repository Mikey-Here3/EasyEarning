"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function PenaltyPage() {
  const router = useRouter();
  const [data, setData] = useState<{ status: string; penaltyAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [tid, setTid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(res => {
      if (!res.user) {
        window.location.href = "/api/auth/signin";
        return;
      }
      setData({ status: res.user.status, penaltyAmount: res.user.penaltyAmount || 0 });
      if (res.user.status === "ACTIVE") {
        router.push("/dashboard");
      }
    });

    fetch("/api/deposit-accounts").then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setAccounts(data);
        setSelectedAccount(data[0]);
      } else if (!data.error) {
        setAccounts([data]);
        setSelectedAccount(data);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid || !selectedAccount || !data) return;
    setSubmitting(true);
    await fetch("/api/deposits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: data.penaltyAmount,
        tid,
        accountId: selectedAccount.id,
      }),
    });
    setSubmitting(false);
    setSuccess(true);
  };

  if (!data) return <div className="min-h-screen bg-slate-100 animate-pulse" />;

  if (data.status === "BANNED") {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <span className="material-symbols-outlined text-[80px] text-red-500 mb-4">block</span>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-wider mb-2">Account Banned</h1>
        <p className="text-slate-600 mb-8 max-w-md">Your account has been permanently banned due to policy violations. If you believe this is a mistake, please contact support.</p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center neu-convex mb-6">
          <span className="material-symbols-outlined text-[48px] text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 uppercase mb-2">Penalty Paid</h1>
        <p className="text-slate-600 mb-8 max-w-md">Your penalty payment has been submitted. The admin will review your receipt and restore your account shortly.</p>
        <button onClick={() => window.location.reload()} className="text-amber-600 font-bold underline">Check Status</button>
      </main>
    );
  }

  return (
    <>
      <Header showMenu={false} showBack={false} />
      <main className="min-h-screen pt-24 pb-10 px-6 flex flex-col gap-6">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-red-500 text-[48px] mb-2">warning</span>
          <h1 className="text-xl font-bold text-red-700 uppercase tracking-wide">Account Restricted</h1>
          <p className="text-sm text-red-600 mt-2">
            Your account has been restricted. You must pay a penalty fee to restore your account access.
          </p>
        </div>

        <div className="bg-neu-bg rounded-2xl p-6 neu-convex flex flex-col gap-4">
          <div className="text-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Penalty Amount</span>
            <div className="text-3xl font-black text-slate-900 mt-1">$ {data.penaltyAmount.toLocaleString()}</div>
          </div>

          {selectedAccount ? (
            <>
              <div className="bg-white rounded-xl p-4 border border-slate-200">
                <span className="text-xs text-slate-500 uppercase block mb-1">Transfer To:</span>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800">Crypto USDT (TRC20)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{selectedAccount.name}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-lg font-mono font-bold tracking-widest text-slate-900">{selectedAccount.number}</span>
                  <button onClick={() => navigator.clipboard.writeText(selectedAccount.number)} className="text-amber-600">
                    <span className="material-symbols-outlined">content_copy</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-600 uppercase ml-1">Transaction ID / Hash</label>
                  <input type="text" required value={tid} onChange={(e) => setTid(e.target.value)} placeholder="Enter TID"
                    className="bg-neu-bg neu-concave-sm rounded-xl px-4 py-3 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <button type="submit" disabled={submitting || !tid}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold uppercase py-4 rounded-xl shadow-lg disabled:opacity-50 mt-2">
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center text-slate-500 text-sm">No payment methods available. Contact admin.</div>
          )}
        </div>
      </main>
    </>
  );
}
