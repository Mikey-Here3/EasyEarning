"use client";

import { useState, useEffect } from "react";

interface Plan {
  id: string; name: string; badge: string; price: number;
  dailyProfit: number; validity: number; totalProfit: number; refBonus: number; isActive: boolean;
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", badge: "", price: "", dailyProfit: "", validity: "", totalProfit: "", refBonus: "" });
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/plans").then(r => r.json()).then(setPlans).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name, badge: form.badge,
        price: parseFloat(form.price), dailyProfit: parseFloat(form.dailyProfit),
        validity: parseInt(form.validity), totalProfit: parseFloat(form.totalProfit), refBonus: parseFloat(form.refBonus),
      }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", badge: "", price: "", dailyProfit: "", validity: "", totalProfit: "", refBonus: "" });
    load();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Deactivate this plan?")) return;
    await fetch(`/api/plans/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Plan Management</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>{showForm ? "Cancel" : "Add Plan"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8 grid grid-cols-2 gap-4">
          {[
            { key: "name", label: "Plan Name", placeholder: "Pak-01", type: "text" },
            { key: "badge", label: "Badge", placeholder: "STARTER", type: "text" },
            { key: "price", label: "Price (Rs.)", placeholder: "275", type: "number" },
            { key: "dailyProfit", label: "Daily Profit (Rs.)", placeholder: "15", type: "number" },
            { key: "validity", label: "Validity (Days)", placeholder: "30", type: "number" },
            { key: "totalProfit", label: "Total Profit (Rs.)", placeholder: "450", type: "number" },
            { key: "refBonus", label: "Ref Bonus (%)", placeholder: "10", type: "number" },
          ].map((f) => (
            <div key={f.key} className="flex flex-col gap-1">
              <label className="text-xs text-slate-400 font-medium uppercase">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} required
                value={form[f.key as keyof typeof form]} onChange={(e) => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
          ))}
          <div className="col-span-2">
            <button type="submit" disabled={saving} className="bg-amber-500 text-slate-900 px-8 py-3 rounded-xl font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
              {saving ? "Creating..." : "Create Plan"}
            </button>
          </div>
        </form>
      )}

      {loading ? <div className="text-slate-400">Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((p) => (
            <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div><h3 className="text-xl font-bold text-white">{p.name}</h3><span className="text-xs text-amber-400 font-bold uppercase">{p.badge}</span></div>
                <button onClick={() => deletePlan(p.id)} className="text-red-400 hover:text-red-300 p-2"><span className="material-symbols-outlined text-[18px]">delete</span></button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400">Price</span><p className="text-white font-semibold">Rs. {p.price.toLocaleString()}</p></div>
                <div><span className="text-slate-400">Daily</span><p className="text-white font-semibold">Rs. {p.dailyProfit}</p></div>
                <div><span className="text-slate-400">Validity</span><p className="text-white font-semibold">{p.validity} days</p></div>
                <div><span className="text-slate-400">Total</span><p className="text-white font-semibold">Rs. {p.totalProfit.toLocaleString()}</p></div>
                <div><span className="text-slate-400">Ref Bonus</span><p className="text-white font-semibold">{p.refBonus}%</p></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
