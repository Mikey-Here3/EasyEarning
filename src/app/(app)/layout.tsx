"use client";

import { useState, createContext, useContext, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

const SidebarContext = createContext<{ open: () => void }>({ open: () => {} });
export const useSidebar = () => useContext(SidebarContext);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || !session?.user) return;

    const userStatus = (session.user as any).status;

    if (userStatus === "BANNED") {
      signOut({ callbackUrl: "/login" });
    } else if (userStatus === "RESTRICTED" && pathname !== "/penalty") {
      router.push("/penalty");
    }
  }, [session, status, pathname, router]);

  return (
    <SidebarContext.Provider value={{ open: () => setSidebarOpen(true) }}>
      <div className="w-full max-w-[400px] mx-auto bg-neu-bg min-h-screen relative overflow-x-hidden" style={{ boxShadow: "0 0 50px rgba(0,0,0,0.05)" }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
