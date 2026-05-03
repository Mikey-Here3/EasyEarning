"use client";

import { useState, useEffect } from "react";

interface UserPlan {
  id: string; status: string; createdAt: string; 
  dailyProfit: number; totalProfit: number; 
  earnedProfit: number; remainingProfit: number; 
  daysCompleted: number; daysRemaining: number;
  expiresAt: string;
  user: { name: string; email: string; balance: number; refCode: string };
  plan: { name: string; badge: string; price: number };
}

export default function AdminActivePlansPage() {
  const [activePlans, setActivePlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = () => fetch("/api/admin/active-plans").then(r => r.json()).then(data => {
    setActivePlans(Array.isArray(data) ? data : []);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this plan? The user will stop receiving profit.")) return;
    try {
      const res = await fetch(`/api/admin/active-plans/${id}/revoke`, { method: "PATCH" });
      const data = await res.json();
      if (data.error) alert(data.error);
      else load();
    } catch (err) {
      alert("Failed to revoke");
    }
  };

  const filtered = activePlans.filter(p => {
    const matchesFilter = filter === "ALL" || p.status === filter;
    const matchesSearch = p.user.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.user.email.toLowerCase().includes(search.toLowerCase()) ||
                          p.plan.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColors: Record<string, string> = { ACTIVE: "bg-green-500/20 text-green-400", EXPIRED: "bg-slate-500/20 text-slate-400" };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Active Plans</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Monitor all user plans across the platform</p>
        </div>
        <div className="flex gap-1.5 sm:gap-2 flex-wrap">
          {["ALL", "ACTIVE", "EXPIRED"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase transition-colors ${filter === f ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>{f}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input
          type="text"
          placeholder="Search by user name, email, or plan name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
        />
      </div>

      {loading ? <div className="text-slate-400">Loading...</div> : filtered.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center"><p className="text-slate-400">No plans found.</p></div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {filtered.map((up) => (
            <div key={up.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate">{up.user.name}</p>
                  <p className="text-slate-400 text-xs truncate">{up.user.email} • Balance: $ {up.user.balance.toLocaleString()}</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase flex-shrink-0 ml-2 ${statusColors[up.status] || "bg-slate-500/20 text-slate-400"}`}>{up.status}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4 text-sm mb-3 sm:mb-4">
                <div><span className="text-slate-400 text-xs block">Plan</span><p className="text-amber-400 font-bold text-base">{up.plan.name}</p></div>
                <div><span className="text-slate-400 text-xs block">Daily Return</span><p className="text-white text-sm">$ {up.dailyProfit}</p></div>
                <div><span className="text-slate-400 text-xs block">Earned</span><p className="text-green-400 font-bold text-sm">$ {up.earnedProfit}</p></div>
                <div><span className="text-slate-400 text-xs block">Remaining</span><p className="text-blue-400 font-bold text-sm">$ {up.remainingProfit}</p></div>
                <div><span className="text-slate-400 text-xs block">Max Total</span><p className="text-white text-sm">$ {up.totalProfit}</p></div>
                <div><span className="text-slate-400 text-xs block">Days Comp.</span><p className="text-white text-sm">{up.daysCompleted} days</p></div>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-slate-700 pt-3 mt-3">
                <div className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="text-xs text-slate-500">Started: {new Date(up.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs text-slate-500">Expires: {new Date(up.expiresAt).toLocaleDateString()}</span>
                </div>
                {up.status === "ACTIVE" && (
                  <button 
                    onClick={() => handleRevoke(up.id)}
                    className="px-3 py-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-all"
                  >
                    Revoke Plan
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
