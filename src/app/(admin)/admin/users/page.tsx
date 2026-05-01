"use client";

import { useState, useEffect } from "react";

interface User {
  id: string; name: string; email: string; phone: string | null;
  balance: number; refCode: string; role: string; createdAt: string;
  status: string; penaltyAmount: number;
  _count: { deposits: number; withdrawals: number; userPlans: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [manageUser, setManageUser] = useState<User | null>(null);
  const [manageStatus, setManageStatus] = useState<string>("ACTIVE");
  const [penaltyAmount, setPenaltyAmount] = useState<string>("0");
  const [manageBalance, setManageBalance] = useState<string>("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (manageUser) {
      setManageStatus(manageUser.status);
      setPenaltyAmount(manageUser.penaltyAmount?.toString() || "0");
      setManageBalance(manageUser.balance?.toString() || "0");
    }
  }, [manageUser]);

  const load = () => {
    fetch("/api/users").then(r => r.json()).then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveStatus = async () => {
    if (!manageUser) return;
    setSaving(true);
    await fetch(`/api/users/${manageUser.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: manageStatus,
        penaltyAmount: manageStatus === "RESTRICTED" ? parseFloat(penaltyAmount) : 0,
        balance: parseFloat(manageBalance),
      }),
    });
    setSaving(false);
    setManageUser(null);
    load();
  };

  const handleDelete = async () => {
    if (!manageUser) return;
    if (!confirm(`Are you sure you want to permanently delete ${manageUser.name}? This action cannot be undone.`)) return;
    
    setSaving(true);
    await fetch(`/api/users/${manageUser.id}`, { method: "DELETE" });
    setSaving(false);
    setManageUser(null);
    load();
  };

  if (loading) return <div className="text-white"><div className="animate-pulse text-slate-400">Loading users...</div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <span className="text-sm text-slate-400 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">{users.length} users</span>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-700/50 text-slate-300 text-left">
              <th className="px-6 py-4 font-medium">User</th><th className="px-6 py-4 font-medium">Balance</th>
              <th className="px-6 py-4 font-medium">Ref Code</th><th className="px-6 py-4 font-medium">Deposits</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4"><div className="font-medium text-white">{u.name}</div><div className="text-slate-400 text-xs">{u.email}</div></td>
                  <td className="px-6 py-4 text-amber-400 font-semibold">$ {u.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-300">{u.refCode}</td>
                  <td className="px-6 py-4 text-slate-300">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
                        u.status === "RESTRICTED" ? "bg-amber-500/20 text-amber-400" :
                          "bg-red-500/20 text-red-400"
                      }`}>
                      {u.status}
                    </span>
                    {u.status === "RESTRICTED" && u.penaltyAmount > 0 && (
                      <div className="text-xs text-slate-400 mt-1">Penalty: $ {u.penaltyAmount}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setManageUser(u)} className="text-amber-500 hover:text-amber-400 text-xs font-medium border border-amber-500/50 rounded px-3 py-1">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {manageUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Manage User: {manageUser.name}</h2>
              <button onClick={handleDelete} className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                Delete Account
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-400">Account Status</label>
                <select
                  value={manageStatus}
                  onChange={(e) => setManageStatus(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="RESTRICTED">Restricted (Penalty Required)</option>
                  <option value="BANNED">Banned (Login Blocked)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-400">Wallet Balance (USD)</label>
                <input
                  type="number"
                  value={manageBalance}
                  onChange={(e) => setManageBalance(e.target.value)}
                  placeholder="e.g. 100"
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              {manageStatus === "RESTRICTED" && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-slate-400">Penalty Amount (USD)</label>
                  <input
                    type="number"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setManageUser(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleSaveStatus} disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
