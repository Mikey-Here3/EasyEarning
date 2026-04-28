"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", referralCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    // Auto-login after registration
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created but login failed. Please try logging in.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const fields = [
    { key: "name", label: "FULL NAME", type: "text", placeholder: "Ali Hassan", required: true },
    { key: "email", label: "EMAIL", type: "email", placeholder: "you@example.com", required: true },
    { key: "phone", label: "PHONE NUMBER", type: "tel", placeholder: "03001234567", required: false },
    { key: "password", label: "PASSWORD", type: "password", placeholder: "••••••••", required: true },
    { key: "confirmPassword", label: "CONFIRM PASSWORD", type: "password", placeholder: "••••••••", required: true },
    { key: "referralCode", label: "REFERRAL CODE (OPTIONAL)", type: "text", placeholder: "EE-XXXXX", required: false },
  ];

  return (
    <div className="w-full max-w-[400px] mx-auto bg-neu-bg min-h-screen flex flex-col" style={{ boxShadow: "0 0 50px rgba(0,0,0,0.05)" }}>
      <header className="h-16 flex items-center justify-center" style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-wider">Easy Earning</h1>
      </header>

      <main className="flex-1 px-6 pt-8 pb-8 flex flex-col gap-6 animate-fade-in">
        <div className="text-center">
          <h2 className="text-display text-on-background">Create Account</h2>
          <p className="text-body-md text-on-surface-variant mt-2">Start your earning journey today</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-xl text-body-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-2">
              <label className="text-label-caps text-slate-600 px-2">{f.label}</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => update(f.key, e.target.value)}
                required={f.required}
                placeholder={f.placeholder}
                className="w-full bg-neu-bg rounded-xl px-4 py-4 text-body-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                style={{ boxShadow: "inset 5px 5px 10px #D1D9E6, inset -5px -5px 10px #FFFFFF" }}
              />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 font-bold uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 mt-2"
            style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </main>
    </div>
  );
}
