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

  useEffect(() => { fetch("/api/users").then(r => r.json()).then(setUsers).finally(() => setLoading(false)); }, []);

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.refCode.toLowerCase().includes(search.toLowerCase()));

  const handleBonus = async () => {
    if (!selectedUser || !bonusAmount) return;
    setSaving(true);
    await fetch(`/api/users/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bonusAmount, bonusDescription: bonusDescription || "Admin bonus" }),
    });
    setSaving(false);
    setSuccess(`Bonus request of $ ${parseFloat(bonusAmount).toLocaleString()} sent to ${selectedUser.name}`);
    setBonusAmount("");
    setBonusDescription("");
    setSelectedUser(null);
    fetch("/api/users").then(r => r.json()).then(setUsers);
    setTimeout(() => setSuccess(""), 5000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Bonus &amp; Rewards</h1>

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Selection */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Select User</h2>
          <input type="text" placeholder="Search by name, email or ref code..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none mb-4" />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {loading ? <p className="text-slate-400">Loading...</p> : filtered.map(u => (
              <button key={u.id} onClick={() => setSelectedUser(u)}
                className={`w-full text-left p-3 rounded-xl transition-colors flex items-center justify-between ${selectedUser?.id === u.id ? "bg-amber-500/20 border border-amber-500/30" : "bg-slate-700/50 hover:bg-slate-700 border border-transparent"}`}>
                <div><p className="text-white font-medium text-sm">{u.name}</p><p className="text-slate-400 text-xs">{u.email}</p></div>
                <div className="text-right"><p className="text-amber-400 font-semibold text-sm">$ {u.balance.toLocaleString()}</p><p className="text-slate-500 text-xs">{u.refCode}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* Bonus Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Send Bonus Request</h2>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <p className="text-white font-semibold">{selectedUser.name}</p>
                <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                <p className="text-amber-400 font-bold mt-2">Current Balance: $ {selectedUser.balance.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Bonus Amount ($)</label>
                <input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} placeholder="1000"
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Description</label>
                <input type="text" value={bonusDescription} onChange={(e) => setBonusDescription(e.target.value)} placeholder="Performance bonus"
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
              <button onClick={handleBonus} disabled={!bonusAmount || saving}
                className="w-full bg-amber-500 text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">redeem</span>{saving ? "Sending..." : "Send Bonus Request"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <span className="material-symbols-outlined text-[48px] mb-4">person_search</span>
              <p>Select a user to send a bonus request</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
