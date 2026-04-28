"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  { label: "Investment Plans", icon: "payments", href: "/plans" },
  { label: "Deposit", icon: "account_balance_wallet", href: "/deposit" },
  { label: "Withdraw", icon: "outbox", href: "/withdraw" },
  { label: "My Team", icon: "group", href: "/referral" },
  { label: "Active Plans", icon: "monitoring", href: "/active-plans" },
];

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-on-background/20 z-[60] animate-fade-in-overlay" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-[70] flex flex-col p-6 h-full w-64 rounded-r-3xl border-r border-slate-200 bg-neu-bg overflow-y-auto animate-slide-in-left"
        style={{ boxShadow: "10px 0px 30px #D1D9E6" }}>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-full neu-convex flex items-center justify-center bg-surface overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-slate-900 font-bold text-lg">
              {session?.user?.name?.charAt(0) || "E"}
            </div>
          </div>
          <div>
            <h1 className="text-headline-md text-slate-800 font-semibold">Easy Earning</h1>
            <p className="text-body-md text-on-surface-variant">{session?.user?.name || "User"}</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className={`flex items-center justify-between px-4 py-3 transition-all duration-200 hover:translate-x-1 text-sm font-medium rounded-full ${
                  isActive ? "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold shadow-inner" : "text-slate-600 hover:bg-slate-200"
                }`}>
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined ${isActive ? "" : "text-amber-500"}`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {!isActive && <span className="material-symbols-outlined text-outline">chevron_right</span>}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="h-px bg-slate-200 my-3" />
              <Link href="/admin" onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-full text-red-600 hover:bg-red-50 transition-all">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        <div className="mt-auto pt-6">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-full bg-surface neu-convex text-error text-body-md font-bold active:scale-95 transition-transform">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
