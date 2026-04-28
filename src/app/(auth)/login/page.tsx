"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto bg-neu-bg min-h-screen flex flex-col" style={{ boxShadow: "0 0 50px rgba(0,0,0,0.05)" }}>
      <header className="h-16 flex items-center justify-center" style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-wider">Easy Earning</h1>
      </header>

      <main className="flex-1 px-6 pt-12 pb-8 flex flex-col gap-8 animate-fade-in">
        <div className="text-center">
          <h2 className="text-display text-on-background">Welcome Back</h2>
          <p className="text-body-md text-on-surface-variant mt-2">Login to your account</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl text-body-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-slate-600 px-2">EMAIL</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="you@example.com"
              className="w-full bg-neu-bg rounded-xl px-4 py-4 text-body-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-slate-600 px-2">PASSWORD</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="••••••••"
              className="w-full bg-neu-bg rounded-xl px-4 py-4 text-body-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
              style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }}
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50"
            style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-body-md text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-semibold">Register</Link>
        </p>
      </main>
    </div>
  );
}
