"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { useSidebar } from "../layout";

export default function ReferralPage() {
  const { open } = useSidebar();
  const [refCode, setRefCode] = useState("");
  const [totalCommission, setTotalCommission] = useState(0);
  const [teamMembers, setTeamMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(data => {
      setRefCode(data.user.refCode);
      setTotalCommission(data.totalCommission);
      setTeamMembers(data.teamMembers);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (<><Header onMenuClick={open} /><main className="pt-24 px-6 pb-28"><div className="skeleton h-32 rounded-xl mt-4" /><div className="skeleton h-48 rounded-lg mt-4" /></main><BottomNav /></>);

  return (
    <>
      <Header onMenuClick={open} />
      <main className="px-6 pt-24 flex flex-col gap-8 pb-32 stagger-children">
        <section className="flex flex-col gap-2 items-center">
          <h1 className="text-headline-lg text-on-background">My Team</h1>
          <div className="bg-surface rounded-xl w-full p-6 flex flex-col items-center gap-2 mt-4 neu-convex-lg">
            <span className="text-label-caps text-on-surface-variant">Total Commission</span>
            <span className="text-display text-primary">Rs. {totalCommission.toLocaleString()}</span>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-background">Invite &amp; Earn</h2>
          <div className="bg-surface rounded-lg p-4 flex flex-col gap-2 neu-convex">
            <label className="text-label-caps text-on-surface-variant">Your Referral Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-surface-variant/40 px-4 py-3 rounded-lg text-body-md text-on-background neu-concave-sm select-all">{refCode}</div>
              <button onClick={() => navigator.clipboard.writeText(refCode)}
                className="bg-primary text-on-primary w-12 h-12 rounded-lg neu-button active:scale-95 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>content_copy</span>
              </button>
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-headline-md text-on-background">Commission Levels</h2>
          {[
            { level: 1, name: "Direct Referrals", percent: "13%", bg: "bg-primary-container text-on-primary-container" },
            { level: 2, name: "Indirect Referrals", percent: "3%", bg: "bg-surface-variant text-on-surface-variant" },
            { level: 3, name: "Sub-Referrals", percent: "2%", bg: "bg-surface-variant text-on-surface-variant" },
          ].map((item) => (
            <div key={item.level} className="bg-surface p-4 rounded-lg neu-convex flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center text-headline-md neu-concave-sm`}>{item.level}</div>
                <div><span className="text-body-lg text-on-background font-semibold">{item.name}</span><br /><span className="text-label-caps text-on-surface-variant">Level {item.level}</span></div>
              </div>
              <span className="text-headline-lg text-primary">{item.percent}</span>
            </div>
          ))}
        </section>
        <section className="grid grid-cols-2 gap-4 pb-8">
          <div className="bg-surface p-4 rounded-lg neu-convex flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
            <span className="text-[24px] font-bold text-on-background">{teamMembers}</span>
            <span className="text-label-caps text-on-surface-variant">Total Members</span>
          </div>
          <div className="bg-surface p-4 rounded-lg neu-convex flex flex-col items-center text-center gap-2">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            <span className="text-[24px] font-bold text-on-background">Rs. {totalCommission.toLocaleString()}</span>
            <span className="text-label-caps text-on-surface-variant">Earned</span>
          </div>
        </section>
      </main>
      <BottomNav />
    </>
  );
}
