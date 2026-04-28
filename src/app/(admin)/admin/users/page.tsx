"use client";

import { useState, useEffect } from "react";

interface User {
  id: string; name: string; email: string; phone: string | null;
  balance: number; refCode: string; role: string; createdAt: string;
  _count: { deposits: number; withdrawals: number; userPlans: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers).finally(() => setLoading(false));
  }, []);

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
              <th className="px-6 py-4 font-medium">Plans</th><th className="px-6 py-4 font-medium">Joined</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4"><div className="font-medium text-white">{u.name}</div><div className="text-slate-400 text-xs">{u.email}</div></td>
                  <td className="px-6 py-4 text-amber-400 font-semibold">Rs. {u.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-300">{u.refCode}</td>
                  <td className="px-6 py-4 text-slate-300">{u._count.deposits}</td>
                  <td className="px-6 py-4 text-slate-300">{u._count.userPlans}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
