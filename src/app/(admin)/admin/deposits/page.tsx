"use client";

import { useState, useEffect } from "react";

interface Deposit {
  id: string; amount: number; tid: string; status: string; createdAt: string; adminNote: string | null; proofUrl: string | null;
  user: { name: string; email: string; refCode: string };
  account: { name: string; number: string; method: string };
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const load = () => fetch("/api/deposits").then(r => r.json()).then(setDeposits).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, status: string) => {
    const adminNote = status === "REJECTED" ? prompt("Rejection reason:") || "Rejected" : "Approved by admin";
    await fetch(`/api/deposits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    load();
  };

  const filtered = deposits.filter(d => filter === "ALL" || d.status === filter);
  const statusColors: Record<string, string> = { PENDING: "bg-yellow-500/20 text-yellow-400", APPROVED: "bg-green-500/20 text-green-400", REJECTED: "bg-red-500/20 text-red-400" };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Deposit Requests</h1>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-colors ${filter === f ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-slate-400">Loading...</div> : filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center"><p className="text-slate-400">No {filter.toLowerCase()} deposits.</p></div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{d.user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{d.user.email} • {d.user.refCode}</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase flex-shrink-0 ml-2 ${statusColors[d.status] || ""}`}>{d.status}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm mb-3 sm:mb-4">
                <div><span className="text-slate-400 text-xs block">Amount</span><p className="text-amber-400 font-bold text-base sm:text-lg">$ {d.amount.toLocaleString()}</p></div>
                <div><span className="text-slate-400 text-xs block">TID</span><p className="text-white font-mono text-xs sm:text-sm break-all">{d.tid}</p></div>
                <div><span className="text-slate-400 text-xs block">To Account</span><p className="text-white text-xs sm:text-sm">{d.account?.name || "Deleted"} ({d.account?.method || "N/A"})</p></div>
                <div>
                  <span className="text-slate-400 text-xs block">Proof</span>
                  {d.proofUrl ? (
                    <button
                      onClick={() => setSelectedImage(d.proofUrl)}
                      className="text-blue-400 hover:text-blue-300 hover:underline text-xs sm:text-sm"
                    >
                      View Proof
                    </button>
                  ) : (
                    <p className="text-slate-500 text-xs">N/A</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleString()}</span>
                {d.status === "PENDING" && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => handleAction(d.id, "APPROVED")}
                      className="flex-1 sm:flex-none bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-500/30 flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check</span>Approve
                    </button>
                    <button onClick={() => handleAction(d.id, "REJECTED")}
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

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center">
            <img
              src={selectedImage}
              alt="Deposit Proof"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-slate-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
