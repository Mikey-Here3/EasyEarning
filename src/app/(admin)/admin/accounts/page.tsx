"use client";

import { useState, useEffect } from "react";

interface Account {
  id: string; name: string; number: string; method: string; priority: number; isActive: boolean;
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", number: "", method: "EASYPAISA", priority: "5" });
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/deposit-accounts").then(r => r.json()).then(data => {
    setAccounts(Array.isArray(data) ? data : []);
  }).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/deposit-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, priority: parseInt(form.priority) }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", number: "", method: "EASYPAISA", priority: "5" });
    load();
  };

  const toggleActive = async (acc: Account) => {
    await fetch(`/api/deposit-accounts/${acc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !acc.isActive }),
    });
    load();
  };

  const updatePriority = async (acc: Account, priority: number) => {
    await fetch(`/api/deposit-accounts/${acc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priority }),
    });
    load();
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Delete this account?")) return;
    await fetch(`/api/deposit-accounts/${id}`, { method: "DELETE" });
    load();
  };

  const methodColors: Record<string, string> = { EASYPAISA: "bg-green-500/20 text-green-400", JAZZCASH: "bg-red-500/20 text-red-400", BANK: "bg-blue-500/20 text-blue-400" };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Deposit Accounts</h1><p className="text-sm text-slate-400 mt-1">Manage Easypaisa, JazzCash &amp; Bank accounts. Higher priority = shown more to users.</p></div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>{showForm ? "Cancel" : "Add Account"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Account Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Muhammad Ali"
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Account Number</label>
            <input type="text" required value={form.number} onChange={(e) => setForm(p => ({ ...p, number: e.target.value }))} placeholder="03001234567"
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
          <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Method</label>
            <select value={form.method} onChange={(e) => setForm(p => ({ ...p, method: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              <option value="EASYPAISA">Easypaisa</option><option value="JAZZCASH">JazzCash</option><option value="BANK">Bank Transfer</option>
            </select></div>
          <div className="flex flex-col gap-1"><label className="text-xs text-slate-400 font-medium uppercase">Priority (1-10)</label>
            <input type="number" min="1" max="10" required value={form.priority} onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" /></div>
          <div className="col-span-2"><button type="submit" disabled={saving} className="bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 disabled:opacity-50">{saving ? "Adding..." : "Add Account"}</button></div>
        </form>
      )}

      {loading ? <div className="text-slate-400">Loading...</div> : accounts.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center"><p className="text-slate-400">No accounts yet. Add your first deposit account.</p></div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className={`bg-slate-800 border rounded-2xl p-6 flex items-center justify-between transition-colors ${acc.isActive ? "border-slate-700" : "border-red-500/30 opacity-60"}`}>
              <div className="flex items-center gap-4">
                <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${methodColors[acc.method] || ""}`}>{acc.method}</div>
                <div><p className="text-white font-semibold">{acc.name}</p><p className="text-slate-400 text-sm">{acc.number}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Priority:</span>
                  <select value={acc.priority} onChange={(e) => updatePriority(acc, parseInt(e.target.value))}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white text-sm outline-none">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <button onClick={() => toggleActive(acc)} className={`px-4 py-2 rounded-lg text-xs font-bold ${acc.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {acc.isActive ? "Active" : "Inactive"}
                </button>
                <button onClick={() => deleteAccount(acc.id)} className="text-red-400 hover:text-red-300 p-2">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
