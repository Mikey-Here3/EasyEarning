"use client";

import { useEffect, useState } from "react";

const FIRST_NAMES = [
  // US/UK
  "James", "Sarah", "Michael", "Emma", "David", "Olivia", "Daniel", "Sophia", "Chris", "Mia",
  "Alex", "Liam", "Noah", "Ethan", "Lucas", "Charlotte", "Amelia", "Harper", "Evelyn",
  // Pakistan
  "Ali", "Ayesha", "Usman", "Fatima", "Bilal", "Zainab", "Omar", "Hassan", "Khadija", "Hamza", "Maryam",
  // India
  "Rahul", "Priya", "Amit", "Neha", "Raj", "Anjali", "Vikram", "Sneha", "Karan", "Pooja"
];
const ACTIONS = [
  "just purchased Starter Plan",
  "just deposited $500 to join a Team",
  "created a new Team Admin Plan",
  "just withdraw $150 to their TRC20 wallet",
  "received a 5% Team referral bonus",
  "just deposited $1,000",
  "activated a Team Member Plan",
  "just withdraw $500",
  "got $200 instant bonus for creating Team"
];

function generateFakeActivity(seed: number) {
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const activities = [];
  for (let i = 0; i < 40; i++) {
    const isWallet = random() > 0.5;
    let userStr = "";
    if (isWallet) {
      const prefix = ["0x3F", "0xA1", "0x7B", "0xD4", "0xE9"][Math.floor(random() * 5)];
      const suffix = Math.floor(random() * 900) + 100;
      userStr = `${prefix}****${suffix}`;
    } else {
      const name = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
      userStr = `${name}****`;
    }
    const action = ACTIONS[Math.floor(random() * ACTIONS.length)];
    activities.push(`${userStr} ${action}`);
  }
  return activities;
}

export default function LiveTicker() {
  const [activities, setActivities] = useState<string[]>([]);

  useEffect(() => {
    const today = new Date();
    // Seed changes every 12 hours
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + (today.getHours() >= 12 ? 0.5 : 0);
    setActivities(generateFakeActivity(seed));
  }, []);

  if (activities.length === 0) return null;

  return (
    <div className="w-full bg-amber-500/10 border-y border-amber-500/20 overflow-hidden flex items-center py-2 relative">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-neu-bg to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-neu-bg to-transparent z-10"></div>
      <div className="flex whitespace-nowrap animate-ticker">
        {activities.map((act, i) => (
          <div key={i} className="flex items-center mx-4 text-xs font-medium text-slate-600">
            <span className="material-symbols-outlined text-[14px] text-amber-500 mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            {act}
          </div>
        ))}
        {activities.map((act, i) => (
          <div key={`dup-${i}`} className="flex items-center mx-4 text-xs font-medium text-slate-600">
            <span className="material-symbols-outlined text-[14px] text-amber-500 mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            {act}
          </div>
        ))}
      </div>
    </div>
  );
}
