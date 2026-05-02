"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface AdminMessage {
  id: string; title: string; message: string; type: string; isRead: boolean;
}

export default function AdminMessagePopup() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/admin-messages")
        .then(async (res) => {
          if (!res.ok) return [];
          try {
            return await res.json();
          } catch (e) {
            return [];
          }
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setMessages(data.filter((m) => !m.isRead));
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleMarkAsRead = async () => {
    const currentMessage = messages[currentMessageIndex];
    if (!currentMessage) return;

    setMarkingRead(true);
    try {
      await fetch(`/api/admin-messages/${currentMessage.id}`, { method: "PUT" });
      
      if (currentMessageIndex < messages.length - 1) {
        setCurrentMessageIndex(prev => prev + 1);
      } else {
        setMessages([]); // Clears modal
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingRead(false);
    }
  };

  if (loading || messages.length === 0) return null;

  const currentMessage = messages[currentMessageIndex];

  const getIconAndColors = (type: string) => {
    switch (type) {
      case "WARNING": return { icon: "warning", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" };
      case "GOOD_PERFORMANCE": return { icon: "star", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" };
      case "INCOMPLETE_PAYMENT": return { icon: "payments", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" };
      case "BAD_ACTIVITY": return { icon: "gavel", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" };
      default: return { icon: "notifications", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" };
    }
  };

  const style = getIconAndColors(currentMessage.type);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`bg-slate-800 rounded-2xl w-full max-w-md border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 ${style.border}`}>
        {/* Header Strip */}
        <div className={`h-2 w-full ${style.bg.replace('/10', '')}`} />
        
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.bg}`}>
              <span className={`material-symbols-outlined text-[28px] ${style.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {style.icon}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentMessage.title}</h2>
              <p className="text-xs text-slate-400 font-medium">Important Message from Admin</p>
            </div>
          </div>
          
          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-700 mb-6">
            <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-wrap">{currentMessage.message}</p>
          </div>

          {messages.length > 1 && (
            <div className="text-xs text-slate-400 text-center mb-4 font-medium">
              Message {currentMessageIndex + 1} of {messages.length}
            </div>
          )}
          
          <button
            onClick={handleMarkAsRead}
            disabled={markingRead}
            className="w-full bg-amber-500 text-slate-900 font-bold py-3.5 rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {markingRead ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">check</span>
            )}
            {markingRead ? "Processing..." : "I Understand"}
          </button>
        </div>
      </div>
    </div>
  );
}
