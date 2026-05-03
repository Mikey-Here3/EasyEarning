"use client";

import { useState, useEffect } from "react";

interface AdminMessage {
  id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string;
  user: { name: string; email: string };
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUniversal, setShowUniversal] = useState(false);
  const [univForm, setUnivForm] = useState({ title: "", message: "", type: "CUSTOM" });
  const [sending, setSending] = useState(false);

  const load = () => fetch("/api/admin-messages").then(r => r.json()).then(data => {
    setMessages(Array.isArray(data) ? data : []);
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSendUniversal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/admin-messages/universal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(univForm),
      });
      const data = await res.json();
      if (data.error) alert(data.error);
      else {
        alert(`Successfully sent to ${data.count} users`);
        setShowUniversal(false);
        setUnivForm({ title: "", message: "", type: "CUSTOM" });
        load();
      }
    } catch (err) {
      alert("Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin-messages/${id}`, { method: "DELETE" });
    load();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "WARNING": return <span className="material-symbols-outlined text-amber-500">warning</span>;
      case "GOOD_PERFORMANCE": return <span className="material-symbols-outlined text-green-500">star</span>;
      case "INCOMPLETE_PAYMENT": return <span className="material-symbols-outlined text-red-500">payments</span>;
      case "BAD_ACTIVITY": return <span className="material-symbols-outlined text-red-500">gavel</span>;
      default: return <span className="material-symbols-outlined text-blue-500">notifications</span>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Sent Messages</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Popups sent to users</p>
        </div>
        <button 
          onClick={() => setShowUniversal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors"
        >
          <span className="material-symbols-outlined">campaign</span>
          Send Universal Message
        </button>
      </div>

      {showUniversal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-white mb-4">Broadcast Message</h2>
            <form onSubmit={handleSendUniversal} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={univForm.title} 
                  onChange={e => setUnivForm({...univForm, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Message Content</label>
                <textarea 
                  required
                  rows={4}
                  value={univForm.message} 
                  onChange={e => setUnivForm({...univForm, message: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Type</label>
                <select 
                  value={univForm.type} 
                  onChange={e => setUnivForm({...univForm, type: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="CUSTOM">General notification</option>
                  <option value="WARNING">Warning</option>
                  <option value="GOOD_PERFORMANCE">Achievement</option>
                  <option value="INCOMPLETE_PAYMENT">Payment Issue</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowUniversal(false)}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  disabled={sending}
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-500 text-slate-900 rounded-xl font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  {sending ? "Sending..." : "Send to All"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-slate-400">Loading...</div> : messages.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center"><p className="text-slate-400">No messages sent yet.</p></div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {getIcon(m.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{m.title}</p>
                    <p className="text-slate-400 text-xs truncate">To: {m.user.name} ({m.user.email})</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase flex-shrink-0 ml-2 ${m.isRead ? "bg-slate-500/20 text-slate-400" : "bg-blue-500/20 text-blue-400"}`}>
                  {m.isRead ? "Read" : "Unread"}
                </span>
              </div>
              <div className="bg-slate-700/30 p-3 rounded-xl mb-3">
                <p className="text-sm text-slate-300">{m.message}</p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleString()}</span>
                <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-500/10 rounded-lg text-xs font-bold transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
