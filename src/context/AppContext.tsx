"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// ── Types ──
export interface Plan {
  id: string;
  name: string;
  badge: string;
  price: number;
  dailyProfit: number;
  validity: number; // days
  totalProfit: number;
  refBonus: number; // percentage
  isActive?: boolean;
  activatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  level: number;
  joinedAt: string;
  isActive: boolean;
}

export interface AppState {
  userName: string;
  refCode: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  hasDeposited: boolean;
  hasActivePlan: boolean;
  activePlans: Plan[];
  selectedPlan: Plan | null;
  depositAmount: number;
  teamMembers: TeamMember[];
  totalCommission: number;
  todayCommission: number;
  totalTeamMembers: number;
  activeToday: number;
  teamDeposits: number;
  newJoins: number;
}

interface AppContextType extends AppState {
  selectPlan: (plan: Plan) => void;
  submitDeposit: (amount: number, tid: string) => void;
  activatePlan: (plan: Plan) => void;
  requestWithdrawal: (amount: number) => void;
  setSidebarOpen: (open: boolean) => void;
  sidebarOpen: boolean;
}

const defaultPlans: Plan[] = [
  {
    id: "pak-01",
    name: "Pak-01",
    badge: "STARTER",
    price: 275,
    dailyProfit: 15,
    validity: 30,
    totalProfit: 450,
    refBonus: 10,
  },
  {
    id: "pak-02",
    name: "Pak-02",
    badge: "POPULAR",
    price: 850,
    dailyProfit: 50,
    validity: 45,
    totalProfit: 2250,
    refBonus: 12,
  },
  {
    id: "pak-03",
    name: "Pak-03",
    badge: "PREMIUM",
    price: 2500,
    dailyProfit: 150,
    validity: 60,
    totalProfit: 9000,
    refBonus: 15,
  },
  {
    id: "pak-04",
    name: "Pak-04",
    badge: "VIP",
    price: 5000,
    dailyProfit: 350,
    validity: 90,
    totalProfit: 31500,
    refBonus: 18,
  },
];

const defaultTeamMembers: TeamMember[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    userName: "Ali Hassan",
    refCode: "PT-8472",
    balance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    hasDeposited: false,
    hasActivePlan: false,
    activePlans: [],
    selectedPlan: null,
    depositAmount: 0,
    teamMembers: defaultTeamMembers,
    totalCommission: 0,
    todayCommission: 0,
    totalTeamMembers: 0,
    activeToday: 0,
    teamDeposits: 0,
    newJoins: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectPlan = (plan: Plan) => {
    setState((prev) => ({
      ...prev,
      selectedPlan: plan,
      depositAmount: plan.price,
    }));
  };

  const submitDeposit = (amount: number, _tid: string) => {
    setState((prev) => ({
      ...prev,
      hasDeposited: true,
      balance: prev.balance + amount,
      totalDeposits: prev.totalDeposits + amount,
      depositAmount: 0,
    }));
  };

  const activatePlan = (plan: Plan) => {
    const activePlan: Plan = {
      ...plan,
      isActive: true,
      activatedAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      hasActivePlan: true,
      activePlans: [...prev.activePlans, activePlan],
      balance: prev.balance - plan.price,
      selectedPlan: null,
    }));
  };

  const requestWithdrawal = (amount: number) => {
    setState((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      totalWithdrawals: prev.totalWithdrawals + amount,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        selectPlan,
        submitDeposit,
        activatePlan,
        requestWithdrawal,
        setSidebarOpen,
        sidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

export { defaultPlans };
