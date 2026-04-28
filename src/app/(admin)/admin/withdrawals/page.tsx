"use client";

import { useState, useEffect } from "react";

interface Withdrawal {
  id: string; amount: number; method: string; accountName: string; accountNumber: string;
  status: string; createdAt: string; adminNote: string | null;
  user: { name: string; email: string; balance: number };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");

  const load = () => fetch("/api/withdrawals").then(r => r.json()).then(setWithdrawals).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: string) => {
    const adminNote = status === "REJECTED" ? prompt("Rejection reason:") || "Rejected" : "Processed by admin";
    await fetch(`/api/withdrawals/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    load();
  };

  const filtered = withdrawals.filter(w => filter === "ALL" || w.status === filter);
  const statusColors: Record<string, string> = { PENDING: "bg-yellow-500/20 text-yellow-400", APPROVED: "bg-green-500/20 text-green-400", REJECTED: "bg-red-500/20 text-red-400" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Withdrawal Requests</h1>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${filter === f ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-slate-400">Loading...</div> : filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center"><p className="text-slate-400">No {filter.toLowerCase()} withdrawals.</p></div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((w) => (
            <div key={w.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div><p className="text-white font-semibold">{w.user.name}</p><p className="text-slate-400 text-xs">{w.user.email} • Balance: $ {w.user.balance.toLocaleString()}</p></div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${statusColors[w.status] || ""}`}>{w.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div><span className="text-slate-400">Amount</span><p className="text-red-400 font-bold text-lg">$ {w.amount.toLocaleString()}</p></div>
                <div><span className="text-slate-400">Method</span><p className="text-white">{w.method}</p></div>
                <div><span className="text-slate-400">Account</span><p className="text-white">{w.accountName}<br /><span className="text-slate-400">{w.accountNumber}</span></p></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{new Date(w.createdAt).toLocaleString()}</span>
                {w.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(w.id, "APPROVED")}
                      className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-500/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check</span>Approve
                    </button>
                    <button onClick={() => handleAction(w.id, "REJECTED")}
                      className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">close</span>Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
