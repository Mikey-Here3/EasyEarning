"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", icon: "home", href: "/dashboard" },
  { label: "Wallet", icon: "account_balance_wallet", href: "/deposit" },
  { label: "Trade", icon: "currency_exchange", href: "/plans" },
  { label: "Profile", icon: "person", href: "/referral" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] h-20 z-50 flex justify-around items-center px-4 pb-2 bg-neu-bg/80 backdrop-blur-md rounded-t-[32px] border-t border-white/20"
      style={{ boxShadow: "-5px -5px 15px #FFFFFF, 5px 5px 15px #D1D9E6" }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href ||
          (item.href === "/dashboard" && pathname === "/dashboard") ||
          (item.href === "/plans" && (pathname === "/plans" || pathname === "/active-plans")) ||
          (item.href === "/deposit" && (pathname === "/deposit" || pathname === "/payment-method" || pathname === "/withdraw")) ||
          (item.href === "/referral" && pathname === "/referral");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center transition-all duration-150 active:scale-90 ${
              isActive
                ? "bg-amber-400 text-slate-900 rounded-2xl w-14 h-14 -translate-y-4 shadow-lg"
                : "text-slate-400 w-12 h-12 hover:text-amber-500"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
