"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import EmptyStateCard from "@/components/EmptyStateCard";
import { useSidebar } from "../layout";

interface HistoryData {
  deposits: any[];
  withdrawals: any[];
  userPlans: any[];
}

export default function HistoryPage() {
  const { open } = useSidebar();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"plans" | "deposits" | "withdrawals">("plans");

  useEffect(() => {
    fetch("/api/history").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header onMenuClick={open} />
      <main className="w-full flex-grow pt-24 pb-32 px-6 flex flex-col gap-6">
        <section className="bg-surface rounded-2xl p-6 flex items-center justify-between neu-convex">
          <h1 className="text-headline-md text-on-surface">Account History</h1>
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
        </section>

        {/* Tabs */}
        <div className="flex bg-surface rounded-full p-1 neu-concave-sm w-full">
          {["plans", "deposits", "withdrawals"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-3 rounded-full text-label-caps text-center capitalize transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold neu-convex"
                  : "text-slate-500 font-medium hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4"><div className="skeleton h-24 rounded-2xl" /><div className="skeleton h-24 rounded-2xl" /></div>
        ) : (
          <div className="flex flex-col gap-4 stagger-children">
            
            {/* Plans Tab */}
            {activeTab === "plans" && (
              data?.userPlans.length === 0 ? (
                <EmptyStateCard icon="assignment" title="No Plans Found" description="You have not purchased any plans yet." actionLabel="Explore Plans" actionHref="/plans" />
              ) : (
                data?.userPlans.map(up => {
                  const activated = new Date(up.createdAt);
                  const isPending = up.status === "PENDING";
                  return (
                    <div key={up.id} className="bg-surface p-5 rounded-2xl neu-convex flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-headline-sm text-slate-800">{up.plan.name} Plan</span>
                          <div className="text-[10px] text-slate-500">{activated.toLocaleDateString()} {activated.toLocaleTimeString()}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          up.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          up.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {up.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-neu-bg p-2 rounded-xl neu-concave-sm flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Invested</span>
                          <span className="text-body-md font-semibold text-slate-800">${up.plan.price}</span>
                        </div>
                        <div className="bg-neu-bg p-2 rounded-xl neu-concave-sm flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 font-bold uppercase">To Receive</span>
                          <span className="text-body-md font-semibold text-amber-600">${up.plan.totalProfit}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {/* Deposits Tab */}
            {activeTab === "deposits" && (
              data?.deposits.length === 0 ? (
                <EmptyStateCard icon="account_balance_wallet" title="No Deposits Found" description="You have not made any deposits yet." actionLabel="Deposit Now" actionHref="/payment-method" />
              ) : (
                data?.deposits.map(dep => (
                  <div key={dep.id} className="bg-surface p-5 rounded-2xl neu-convex flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neu-bg neu-concave-sm flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-headline-sm text-slate-800">+ ${dep.amount}</span>
                          <span className="text-[10px] text-slate-500">{new Date(dep.createdAt).toLocaleDateString()} {new Date(dep.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        dep.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        dep.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {dep.status}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 bg-neu-bg p-2 rounded-lg neu-concave-sm">
                      <span className="font-bold">TID:</span> {dep.tid}
                    </div>
                    {dep.adminNote && (
                      <div className="text-xs text-red-500 mt-1 italic">Note: {dep.adminNote}</div>
                    )}
                  </div>
                ))
              )
            )}

            {/* Withdrawals Tab */}
            {activeTab === "withdrawals" && (
              data?.withdrawals.length === 0 ? (
                <EmptyStateCard icon="payments" title="No Withdrawals Found" description="You have not made any withdrawals yet." actionLabel="Withdraw Now" actionHref="/withdraw" />
              ) : (
                data?.withdrawals.map(w => (
                  <div key={w.id} className="bg-surface p-5 rounded-2xl neu-convex flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neu-bg neu-concave-sm flex items-center justify-center text-red-500">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>remove_circle</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-headline-sm text-slate-800">- ${w.amount}</span>
                          <span className="text-[10px] text-slate-500">{new Date(w.createdAt).toLocaleDateString()} {new Date(w.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        w.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {w.status}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 bg-neu-bg p-2 rounded-lg neu-concave-sm flex justify-between">
                      <span><span className="font-bold">Method:</span> {w.method}</span>
                      <span><span className="font-bold">Account:</span> {w.accountName}</span>
                    </div>
                    {w.adminNote && (
                      <div className="text-xs text-red-500 mt-1 italic">Note: {w.adminNote}</div>
                    )}
                  </div>
                ))
              )
            )}
            
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
