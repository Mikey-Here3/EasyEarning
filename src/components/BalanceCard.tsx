"use client";

interface BalanceCardProps {
  label: string;
  amount: number;
  showTrend?: boolean;
  trendText?: string;
}

export default function BalanceCard({ label, amount, showTrend = false, trendText }: BalanceCardProps) {
  return (
    <section
      className="bg-neu-bg rounded-[24px] p-6 flex flex-col items-center justify-center text-center"
      style={{ boxShadow: "8px 8px 16px #D1D9E6, -8px -8px 16px #FFFFFF" }}
    >
      <span className="text-label-caps text-on-surface-variant mb-2">{label}</span>
      <h2 className="text-display text-primary">
        Rs. {amount.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
      </h2>
      {showTrend && trendText && (
        <div
          className="mt-4 flex items-center gap-2 text-secondary bg-secondary-container/20 px-3 py-1 rounded-full neu-concave-sm"
        >
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span className="text-label-caps">{trendText}</span>
        </div>
      )}
    </section>
  );
}
