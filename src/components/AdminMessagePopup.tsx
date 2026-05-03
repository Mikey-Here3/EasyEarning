"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface AdminMessage {
  id: string; title: string; message: string; type: string; isRead: boolean;
}

export default function AdminMessagePopup({ inline = false }: { inline?: boolean }) {
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

  if (loading || messages.length === 0 || (session?.user as any)?.role === "ADMIN") return null;

  const currentMessage = messages[currentMessageIndex];

  const getIconAndColors = (type: string) => {
    switch (type) {
      case "WARNING": return { icon: "warning", gradient: "from-amber-400 to-amber-600" };
      case "GOOD_PERFORMANCE": return { icon: "star", gradient: "from-green-400 to-green-600" };
      case "INCOMPLETE_PAYMENT": return { icon: "payments", gradient: "from-red-400 to-red-600" };
      case "BAD_ACTIVITY": return { icon: "gavel", gradient: "from-red-400 to-red-600" };
      default: return { icon: "notifications", gradient: "from-blue-400 to-blue-600" };
    }
  };

  const style = getIconAndColors(currentMessage.type);

  const content = (
    <section className={`bg-gradient-to-br ${style.gradient} rounded-lg p-5 shadow-2xl relative overflow-hidden flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-bl-full pointer-events-none" />
      
      <h3 className="text-white font-bold text-lg flex items-center gap-2 relative z-10">
        <span className="material-symbols-outlined">{style.icon}</span>
        {currentMessage.title}
      </h3>
      
      <div className="bg-white/20 p-3 rounded-lg flex flex-col gap-2 relative z-10">
        <p className="text-white text-sm font-medium whitespace-pre-wrap">
          {currentMessage.message}
        </p>
        
        {messages.length > 1 && (
          <div className="text-xs text-white/70 font-medium">
            Message {currentMessageIndex + 1} of {messages.length}
          </div>
        )}

        <div className="flex justify-end mt-2">
          <button
            onClick={handleMarkAsRead}
            disabled={markingRead}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {markingRead ? (
              <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[16px]">check</span>
            )}
            {markingRead ? "Processing..." : "Dismiss"}
          </button>
        </div>
      </div>
    </section>
  );

  if (inline) return content;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] z-[90]">
      {content}
    </div>
  );
}
