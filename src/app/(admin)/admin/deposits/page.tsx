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
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Deposit Requests</h1>
        <div className="flex gap-2">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors ${filter === f ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="text-slate-400">Loading...</div> : filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center"><p className="text-slate-400">No {filter.toLowerCase()} deposits.</p></div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((d) => (
            <div key={d.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white font-semibold">{d.user.name}</p>
                  <p className="text-slate-400 text-xs">{d.user.email} • {d.user.refCode}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${statusColors[d.status] || ""}`}>{d.status}</span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                <div><span className="text-slate-400">Amount</span><p className="text-amber-400 font-bold text-lg">$ {d.amount.toLocaleString()}</p></div>
                <div><span className="text-slate-400">TID</span><p className="text-white font-mono">{d.tid}</p></div>
                <div><span className="text-slate-400">To Account</span><p className="text-white">{d.account?.name || "Deleted Account"} ({d.account?.method || "N/A"})</p></div>
                <div>
                  <span className="text-slate-400">Proof</span>
                  {d.proofUrl ? (
                    <button 
                      onClick={() => setSelectedImage(d.proofUrl)} 
                      className="text-blue-400 hover:text-blue-300 hover:underline block text-left"
                    >
                      View Proof
                    </button>
                  ) : (
                    <p className="text-slate-500">N/A</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleString()}</span>
                {d.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(d.id, "APPROVED")}
                      className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-500/30 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check</span>Approve
                    </button>
                    <button onClick={() => handleAction(d.id, "REJECTED")}
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
