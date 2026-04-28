"use client";

import { Plan } from "@/context/AppContext";

interface PlanCardProps {
  plan: Plan;
  onBuy: (plan: Plan) => void;
  featured?: boolean;
}

export default function PlanCard({ plan, onBuy, featured = false }: PlanCardProps) {
  const borderColor = featured ? "border-amber-300/50" : "border-amber-200/50";
  const accentColor = featured ? "text-amber-600" : "text-amber-500";
  const gradientFrom = featured ? "from-amber-400" : "from-amber-300";
  const gradientTo = featured ? "to-amber-600" : "to-amber-500";
  const borderRing = featured ? "border-amber-500" : "border-amber-400";

  return (
    <div
      className={`bg-neu-bg rounded-[2rem] p-6 mb-10 relative border ${borderColor}`}
      style={{ boxShadow: "8px 8px 20px #D1D9E6, -8px -8px 20px #FFFFFF" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-headline-lg text-slate-800">{plan.name}</h2>
        <div className="px-3 py-1 bg-amber-100 rounded-full text-amber-600 text-label-caps shadow-sm border border-amber-200">
          {plan.badge}
        </div>
      </div>

      {/* Circular Center Price */}
      <div
        className={`w-32 h-32 rounded-full mx-auto mb-8 bg-neu-bg flex items-center justify-center relative border-[3px] ${borderRing}`}
        style={{ boxShadow: "10px 10px 20px #D1D9E6, -10px -10px 20px #FFFFFF" }}
      >
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${gradientFrom} ${gradientTo} flex flex-col items-center justify-center text-slate-900`}
          style={{ boxShadow: "inset 3px 3px 6px rgba(255,255,255,0.4), inset -3px -3px 6px rgba(0,0,0,0.1)" }}
        >
          <span className="text-xs font-bold uppercase opacity-80 mb-0.5">Price</span>
          <span className="text-display text-xl leading-none font-black">
            {plan.price}<span className="text-sm ml-1">Rs</span>
          </span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="flex flex-col items-center p-3 rounded-2xl bg-neu-bg"
          style={{ boxShadow: "inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF" }}
        >
          <span className={`material-symbols-outlined ${accentColor} mb-1 text-xl`}>trending_up</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Daily Profit</span>
          <span className="text-headline-md text-sm text-slate-800 mt-1">{plan.dailyProfit} Rs</span>
        </div>
        <div
          className="flex flex-col items-center p-3 rounded-2xl bg-neu-bg"
          style={{ boxShadow: "inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF" }}
        >
          <span className={`material-symbols-outlined ${accentColor} mb-1 text-xl`}>event_available</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Validity</span>
          <span className="text-headline-md text-sm text-slate-800 mt-1">{plan.validity} Days</span>
        </div>
        <div
          className="flex flex-col items-center p-3 rounded-2xl bg-neu-bg"
          style={{ boxShadow: "inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF" }}
        >
          <span className={`material-symbols-outlined ${accentColor} mb-1 text-xl`}>account_balance</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Profit</span>
          <span className="text-headline-md text-sm text-slate-800 mt-1">{plan.totalProfit} Rs</span>
        </div>
        <div
          className="flex flex-col items-center p-3 rounded-2xl bg-neu-bg"
          style={{ boxShadow: "inset 4px 4px 8px #D1D9E6, inset -4px -4px 8px #FFFFFF" }}
        >
          <span className={`material-symbols-outlined ${accentColor} mb-1 text-xl`}>group_add</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ref. Bonus</span>
          <span className="text-headline-md text-sm text-slate-800 mt-1">{plan.refBonus}%</span>
        </div>
      </div>

      {/* Buy Button */}
      <button
        onClick={() => onBuy(plan)}
        className="w-full py-4 rounded-full bg-neu-bg text-amber-600 font-bold uppercase tracking-wider flex items-center justify-center gap-2 neu-pressed transition-all duration-200 border border-amber-100"
        style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          shopping_cart
        </span>
        Buy Now
      </button>
    </div>
  );
}
