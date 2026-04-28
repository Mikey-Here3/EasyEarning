"use client";

interface StatCardProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: string;
}

export default function StatCard({ icon, iconColor = "text-primary", label, value }: StatCardProps) {
  return (
    <div className="bg-surface p-5 rounded-lg neu-convex flex flex-col">
      <span
        className={`material-symbols-outlined ${iconColor} mb-2`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className="text-body-md text-on-surface-variant text-[12px]">{label}</span>
      <span className="text-headline-md text-on-surface mt-1">{value}</span>
    </div>
  );
}
