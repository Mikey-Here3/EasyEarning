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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdrawal Requests</h1>
          <p className="text-xs text-slate-400 mt-1">Minimum withdrawal: $20</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-colors ${filter === f ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-slate-400">Loading...</div> : filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center"><p className="text-slate-400">No {filter.toLowerCase()} withdrawals.</p></div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((w) => (
            <div key={w.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{w.user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{w.user.email} • Balance: $ {w.user.balance.toLocaleString()}</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase flex-shrink-0 ml-2 ${statusColors[w.status] || ""}`}>{w.status}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm mb-3 sm:mb-4">
                <div><span className="text-slate-400 text-xs block">Amount</span><p className="text-red-400 font-bold text-base sm:text-lg">$ {w.amount.toLocaleString()}</p></div>
                <div><span className="text-slate-400 text-xs block">Method</span><p className="text-white text-sm">{w.method}</p></div>
                <div><span className="text-slate-400 text-xs block">Account</span><p className="text-white text-sm">{w.accountName}<br /><span className="text-slate-400 text-xs break-all">{w.accountNumber}</span></p></div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{new Date(w.createdAt).toLocaleString()}</span>
                {w.status === "PENDING" && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleAction(w.id, "APPROVED")}
                      className="flex-1 sm:flex-none bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-500/30 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check</span>Approve
                    </button>
                    <button onClick={() => handleAction(w.id, "REJECTED")}
                      className="flex-1 sm:flex-none bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/30 flex items-center justify-center gap-1">
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
