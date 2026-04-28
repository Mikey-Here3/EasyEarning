import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="w-full max-w-[400px] bg-neu-bg min-h-screen relative overflow-x-hidden flex flex-col" style={{ boxShadow: "0 0 50px rgba(0,0,0,0.05)" }}>
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-16 flex items-center justify-between px-6 z-50 max-w-[400px] bg-neu-bg" style={{ boxShadow: "5px 5px 15px #D1D9E6, -5px -5px 15px #FFFFFF" }}>
        <div className="w-8" />
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-wider">Easy Earning</h1>
        <div className="w-8" />
      </header>

      <main className="flex-1 pt-[88px] pb-[100px] px-4 flex flex-col gap-10 animate-fade-in">
        <section className="flex flex-col items-center text-center gap-6">
          <div className="flex flex-col gap-2 items-center">
            <h2 className="text-display text-on-background max-w-[300px]">Welcome To Easy Earning</h2>
            <p className="text-body-md text-on-surface-variant max-w-[280px]">
              Experience seamless wealth generation with our premium platform. Secure, intuitive, and built for your financial future.
            </p>
          </div>

          <div className="w-full aspect-[4/3] rounded-xl bg-surface neu-convex p-3">
            <div className="w-full h-full rounded-lg bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 overflow-hidden relative neu-concave flex items-center justify-center">
              <div className="text-center">
                <span className="material-symbols-outlined text-[80px] text-amber-800/40" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                <p className="text-amber-900/60 font-bold text-sm mt-2">Premium Trading</p>
              </div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/50 shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                <span className="text-label-caps text-on-background uppercase">Consistent Gains</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full mt-2">
            <Link href="/login" className="flex-1 py-4 rounded-full bg-inverse-surface text-inverse-on-surface text-label-caps uppercase tracking-wider neu-convex text-center active:scale-95 transition-all duration-200">
              Login
            </Link>
            <Link href="/register" className="flex-1 py-4 rounded-full bg-primary-container text-on-primary-container text-label-caps uppercase tracking-wider neu-convex text-center active:scale-95 transition-all duration-200">
              Register
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-headline-md text-on-background">Investment Plans</h3>
            <Link href="/register" className="w-10 h-10 rounded-full bg-surface neu-convex flex items-center justify-center text-primary active:scale-95">
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <div className="bg-surface rounded-xl p-6 neu-convex border border-outline-variant/40 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="text-label-caps text-tertiary tracking-widest">Starter Plan</span>
                <span className="text-display text-on-background tracking-tighter">Rs. 275</span>
                <span className="text-body-md text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">schedule</span> Daily Rs. 15 for 30 Days
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-surface neu-concave-sm flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
              </div>
            </div>
            <Link href="/register" className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-center text-label-caps font-bold active:scale-95 transition-all">Buy Now</Link>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-primary-container flex flex-col gap-4 relative overflow-hidden" style={{ boxShadow: "8px 8px 20px #D1D9E6, -8px -8px 20px #FFFFFF" }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-container via-primary to-primary-container" />
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-label-caps text-primary tracking-widest">Premium Plan</span>
                  <span className="bg-primary-container text-on-primary-container text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Popular</span>
                </div>
                <span className="text-[40px] leading-tight font-black text-on-background tracking-tighter">Rs. 2,500</span>
                <span className="text-body-md text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">schedule</span> Daily Rs. 150 for 60 Days
                </span>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container" style={{ boxShadow: "inset 2px 2px 4px rgba(255,255,255,0.5), inset -2px -2px 4px rgba(0,0,0,0.1)" }}>
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>diamond</span>
              </div>
            </div>
            <Link href="/register" className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-slate-900 text-center text-label-caps font-bold active:scale-95 transition-all">Buy Now</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
