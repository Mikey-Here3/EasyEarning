"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

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
  const [search, setSearch] = useState("");
  const [showMessageModal, setShowMessageModal] = useState<User | null>(null);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState("CUSTOM");
  const [sendingMessage, setSendingMessage] = useState(false);

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

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.refCode.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleSendMessage = async () => {
    if (!showMessageModal || !messageTitle || !messageText) return;
    setSendingMessage(true);
    await fetch("/api/admin-messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: showMessageModal.id,
        title: messageTitle,
        message: messageText,
        type: messageType,
      }),
    });
    setSendingMessage(false);
    setShowMessageModal(null);
    setMessageTitle("");
    setMessageText("");
    setMessageType("CUSTOM");
    toast.success("Message sent successfully!");
  };

  const quickMessagePresets = [
    { type: "INCOMPLETE_PAYMENT", title: "⚠️ Incomplete Payment", message: "Your recent payment was incomplete. Please send the full amount to avoid delays in processing your deposit." },
    { type: "BAD_ACTIVITY", title: "🚫 Account Warning", message: "We have detected suspicious activity on your account. Please contact support immediately to resolve this issue." },
    { type: "INACTIVE", title: "💤 Account Inactive", message: "Your account has been inactive for a while. Log in and explore our latest plans to start earning again!" },
    { type: "GOOD_PERFORMANCE", title: "🌟 Great Performance!", message: "Congratulations! Your account performance has been outstanding. Keep up the great work!" },
    { type: "WARNING", title: "⚠️ Important Notice", message: "This is an important notice regarding your account. Please review your account details and contact support if needed." },
  ];

  if (loading) return <div className="text-white"><div className="animate-pulse text-slate-400">Loading users...</div></div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
        <span className="text-sm text-slate-400 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 self-start sm:self-auto">{users.length} users</span>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input
          type="text"
          placeholder="Search by name, email or ref code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
        />
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filtered.map((u) => (
          <div key={u.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-slate-900 font-bold flex-shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{u.name}</p>
                  <p className="text-slate-400 text-xs truncate">{u.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${u.status === "ACTIVE" ? "bg-green-500/20 text-green-400" :
                u.status === "RESTRICTED" ? "bg-amber-500/20 text-amber-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                {u.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div><span className="text-slate-400 block">Balance</span><span className="text-amber-400 font-semibold">$ {u.balance.toLocaleString()}</span></div>
              <div><span className="text-slate-400 block">Ref Code</span><span className="text-slate-300">{u.refCode}</span></div>
              <div><span className="text-slate-400 block">Joined</span><span className="text-slate-300">{new Date(u.createdAt).toLocaleDateString()}</span></div>
            </div>
            {u.status === "RESTRICTED" && u.penaltyAmount > 0 && (
              <div className="text-xs text-amber-400 mb-2">Penalty: $ {u.penaltyAmount}</div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setManageUser(u)} className="flex-1 text-amber-500 hover:text-amber-400 text-xs font-medium border border-amber-500/50 rounded-lg px-3 py-2 transition-colors">
                Manage
              </button>
              <button onClick={() => setShowMessageModal(u)} className="flex-1 text-blue-400 hover:text-blue-300 text-xs font-medium border border-blue-500/50 rounded-lg px-3 py-2 transition-colors">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-700/50 text-slate-300 text-left">
              <th className="px-6 py-4 font-medium">User</th><th className="px-6 py-4 font-medium">Balance</th>
              <th className="px-6 py-4 font-medium">Ref Code</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-700">
              {filtered.map((u) => (
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
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setManageUser(u)} className="text-amber-500 hover:text-amber-400 text-xs font-medium border border-amber-500/50 rounded px-3 py-1">
                        Manage
                      </button>
                      <button onClick={() => setShowMessageModal(u)} className="text-blue-400 hover:text-blue-300 text-xs font-medium border border-blue-500/50 rounded px-3 py-1">
                        Message
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manage User Modal */}
      {manageUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Manage: {manageUser.name}</h2>
              <button onClick={handleDelete} className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                Delete
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-slate-400">Account Status</label>
                <select
                  value={manageStatus}
                  onChange={(e) => setManageStatus(e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-amber-500"
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
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-amber-500"
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
                    className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button onClick={() => setManageUser(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleSaveStatus} disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-900 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-5 sm:p-6 w-full max-w-lg border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Send Message</h2>
              <button onClick={() => setShowMessageModal(null)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-700/50 p-3 rounded-xl mb-4">
              <p className="text-white font-semibold text-sm">{showMessageModal.name}</p>
              <p className="text-slate-400 text-xs">{showMessageModal.email}</p>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 font-medium uppercase mb-2 block">Quick Presets</label>
              <div className="flex flex-wrap gap-2">
                {quickMessagePresets.map((p) => (
                  <button key={p.type} onClick={() => { setMessageTitle(p.title); setMessageText(p.message); setMessageType(p.type); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${messageType === p.type ? "bg-amber-500 text-slate-900" : "bg-slate-700 text-slate-400 hover:text-white"}`}>
                    {p.type.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium uppercase">Title</label>
                <input type="text" value={messageTitle} onChange={(e) => setMessageTitle(e.target.value)} placeholder="Message title..."
                  className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400 font-medium uppercase">Message</label>
                <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message..."
                  rows={4} className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white text-sm outline-none focus:border-amber-500 resize-none" />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowMessageModal(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleSendMessage} disabled={!messageTitle || !messageText || sendingMessage}
                  className="flex-1 bg-blue-500 hover:bg-blue-400 text-white py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  {sendingMessage ? "Sending..." : "Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
