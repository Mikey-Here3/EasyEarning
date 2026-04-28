"use client";

import Header from "@/components/Header";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function PaymentMethodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get("amount");

  return (
    <>
      <Header showBack showMenu={false} />
      <main className="w-full px-6 pt-24 pb-10 flex-1 flex flex-col gap-6">
        {/* Header */}
        <section className="flex flex-col gap-2 mt-4">
          <h1 className="text-display text-on-background">Select Payment Method</h1>
          <p className="text-body-md text-on-surface-variant">Choose how you&apos;d like to fund your account securely.</p>
        </section>

        {amount && (
          <div className="bg-primary-container/20 p-3 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">info</span>
            <span className="text-body-md text-on-primary-container">
              Amount to Deposit: <strong>$ {parseInt(amount).toLocaleString()}</strong>
            </span>
          </div>
        )}

        {/* Payment Methods */}
        <section className="flex flex-col gap-4">
          {/* Crypto TRC20 - Primary */}
          <button
            onClick={() => router.push(`/deposit?amount=${amount || ""}`)}
            className="relative w-full rounded-2xl bg-surface p-6 flex flex-col items-center justify-center gap-4 transition-all border-2 border-primary-container"
            style={{ boxShadow: "inset 5px 5px 15px #D1D9E6, inset -5px -5px 15px #FFFFFF" }}
          >
            <div className="absolute top-4 right-4 text-primary-container">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <div className="w-24 h-24 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden mb-2 neu-convex">
              <div className="w-full h-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-black text-lg">USDT</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-headline-md text-on-surface">Crypto TRC20</span>
              <span className="text-body-md text-on-surface-variant">USDT / Crypto Wallet</span>
            </div>
          </button>

        </section>

        <div className="flex-1" />

        {/* Deposit Button */}
        <section className="mt-10">
          <button
            onClick={() => router.push(`/deposit?amount=${amount || ""}`)}
            className="w-full rounded-full bg-gradient-to-r from-primary-container to-secondary-container py-4 px-6 flex items-center justify-center gap-2 neu-convex active:scale-95 transition-transform"
          >
            <span className="text-headline-md text-on-primary-container">Deposit Now</span>
            <span className="material-symbols-outlined text-on-primary-container">arrow_forward</span>
          </button>
          <p className="text-center text-body-md text-on-surface-variant mt-4 opacity-75">
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">lock</span>
            Secure 256-bit encryption
          </p>
        </section>
      </main>
    </>
  );
}

export default function PaymentMethodPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentMethodContent />
    </Suspense>
  );
}
