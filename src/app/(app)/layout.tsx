"use client";

import { useState, createContext, useContext } from "react";
import Sidebar from "@/components/Sidebar";

const SidebarContext = createContext<{ open: () => void }>({ open: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ open: () => setSidebarOpen(true) }}>
      <div className="w-full max-w-[400px] mx-auto bg-neu-bg min-h-screen relative overflow-x-hidden" style={{ boxShadow: "0 0 50px rgba(0,0,0,0.05)" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
