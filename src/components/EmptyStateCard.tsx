"use client";

import Link from "next/link";

interface EmptyStateCardProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyStateCard({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateCardProps) {
  return (
    <section className="flex flex-col items-center justify-center flex-grow text-center mt-6">
      <div
        className="w-32 h-32 rounded-full bg-surface-container flex items-center justify-center neu-concave mb-6"
      >
        <span
          className="material-symbols-outlined text-[64px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <h2 className="text-headline-lg text-on-surface mb-2">{title}</h2>
      <p className="text-body-lg text-on-surface-variant max-w-[280px]">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 bg-primary-container text-on-primary-container text-headline-md px-8 py-4 rounded-full neu-convex active:neu-concave transition-all duration-200"
        >
          {actionLabel}
        </Link>
      )}
    </section>
  );
}
