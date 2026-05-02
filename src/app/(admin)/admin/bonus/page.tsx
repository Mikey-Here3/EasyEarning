"use client";

import { useState, useEffect } from "react";

interface User { id: string; name: string; email: string; balance: number; refCode: string; }

export default function AdminBonusPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusDescription, setBonusDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"send" | "history">("send");
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [bonusFilter, setBonusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers).finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.refCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleBonus = async () => {
    if (!selectedUser || !bonusAmount) return;
    setSaving(true);
    await fetch(`/api/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bonusAmount, bonusDescription: bonusDescription || "Admin bonus" }),
    });
    setSaving(false);
    setSuccess(`Bonus of $${parseFloat(bonusAmount).toLocaleString()} sent to ${selectedUser.name}`);
    setBonusAmount(""); setBonusDescription(""); setSelectedUser(null);
    fetch("/api/users").then(r => r.json()).then(setUsers);
    setTimeout(() => setSuccess(""), 5000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this bonus? If approved, the amount will be deducted.")) return;
    const res = await fetch(`/api/admin/bonus/${id}/revoke`, { method: "PUT" });
    if (res.ok) {
      setSuccess("Bonus revoked successfully");
      // refresh bonus list by re-fetching
      if (activeTab === "history") loadBonusHistory();
      setTimeout(() => setSuccess(""), 5000);
    }
  };

  const loadBonusHistory = async () => {
    const usersData = await fetch("/api/users").then(r => r.json());
    const allBonuses: any[] = [];
    for (const u of usersData.slice(0, 50)) {
      try {
        const data = await fetch(`/api/users/${u.id}`).then(r => r.json());
        if (data?.bonusRequests) {
          data.bonusRequests.forEach((b: any) => allBonuses.push({ ...b, userName: data.name, userEmail: data.email }));
        }
      } catch {}
    }
    allBonuses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setBonuses(allBonuses);
  };

  useEffect(() => { if (activeTab === "history") loadBonusHistory(); }, [activeTab]);

  const filteredBonuses = bonuses.filter(b => bonusFilter === "ALL" || b.status === bonusFilter);
  const sc: Record<string, string> = { PENDING: "bg-yellow-500/20 text-yellow-400", APPROVED: "bg-green-500/20 text-green-400", REJECTED: "bg-red-500/20 text-red-400" };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Bonus &amp; Rewards</h1>
        <div className="flex gap-2">
          {(["send", "history"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-colors ${activeTab === t ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>
              {t === "send" ? "Send Bonus" : "History"}
            </button>
          ))}
        </div>
      </div>

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-3 rounded-xl flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{success}
        </div>
      )}

      {activeTab === "send" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Select User</h2>
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none mb-4" />
            <div className="max-h-64 sm:max-h-80 overflow-y-auto space-y-2">
              {loading ? <p className="text-slate-400">Loading...</p> : filtered.map(u => (
                <button key={u.id} onClick={() => setSelectedUser(u)}
                  className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between ${selectedUser?.id === u.id ? "bg-amber-500/20 border border-amber-500/30" : "bg-slate-700/50 hover:bg-slate-700 border border-transparent"}`}>
                  <div className="min-w-0"><p className="text-white font-medium text-sm truncate">{u.name}</p><p className="text-slate-400 text-xs truncate">{u.email}</p></div>
                  <div className="text-right flex-shrink-0 ml-2"><p className="text-amber-400 font-semibold text-sm">$ {u.balance.toLocaleString()}</p></div>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Send Bonus Request</h2>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="bg-slate-700/50 p-3 rounded-xl">
                  <p className="text-white font-semibold">{selectedUser.name}</p>
                  <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                  <p className="text-amber-400 font-bold mt-2">Balance: $ {selectedUser.balance.toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Amount ($)</label>
                  <input type="number" value={bonusAmount} onChange={e => setBonusAmount(e.target.value)} placeholder="100"
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-amber-500" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Description</label>
                  <input type="text" value={bonusDescription} onChange={e => setBonusDescription(e.target.value)} placeholder="Performance bonus"
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm outline-none focus:ring-2 focus:ring-amber-500" /></div>
                <button onClick={handleBonus} disabled={!bonusAmount || saving}
                  className="w-full bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">redeem</span>{saving ? "Sending..." : "Send Bonus"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <span className="material-symbols-outlined text-[48px] mb-4">person_search</span>
                <p className="text-sm">Select a user first</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-1.5 flex-wrap">
            {["ALL","PENDING","APPROVED","REJECTED"].map(f => (
              <button key={f} onClick={() => setBonusFilter(f)}
                className={`px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-colors ${bonusFilter === f ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>{f}</button>
            ))}
          </div>
          {filteredBonuses.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center"><p className="text-slate-400">No bonuses found.</p></div>
          ) : (
            <div className="grid gap-3">
              {filteredBonuses.map(b => (
                <div key={b.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0"><p className="text-white font-semibold text-sm truncate">{b.userName}</p><p className="text-slate-400 text-xs truncate">{b.userEmail}</p></div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex-shrink-0 ml-2 ${sc[b.status] || ""}`}>{b.status}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-2">
                    <div><p className="text-amber-400 font-bold">$ {b.amount.toLocaleString()}</p><p className="text-slate-400 text-xs">{b.description}</p><p className="text-slate-500 text-[10px] mt-1">{new Date(b.createdAt).toLocaleString()}</p></div>
                    {b.status !== "REJECTED" && (
                      <button onClick={() => handleRevoke(b.id)}
                        className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/30 flex items-center gap-1 flex-shrink-0">
                        <span className="material-symbols-outlined text-[14px]">undo</span>Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
