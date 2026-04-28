"use client";

import Link from "next/link";

interface HeaderProps {
  showBack?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export default function Header({ showBack = false, showMenu = true, onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-16 flex items-center justify-between px-6 z-50 max-w-[400px] bg-neu-bg"
      style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
      <div className="flex items-center gap-3">
        {showBack && (
          <Link href="/dashboard"
            className="text-amber-500 hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center w-8 h-8 rounded-full"
            style={{ boxShadow: "inset 2px 2px 5px #D1D9E6, inset -2px -2px 5px #FFFFFF" }}>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
        )}
        {showMenu && !showBack && (
          <button onClick={onMenuClick} aria-label="Open Menu"
            className="text-slate-500 hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-2 -ml-2 rounded-full">
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-wider">Easy Earning</h1>
      </div>
      <Link href="/dashboard"
        className="text-amber-500 hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 rounded-full neu-button">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
      </Link>
    </header>
  );
}
