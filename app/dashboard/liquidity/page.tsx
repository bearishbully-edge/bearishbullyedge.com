export default function LiquidityPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-6xl mb-6">💧</div>

          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Liquidity Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Liquidity Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Institutional liquidity mapping, sweep detection, resting liquidity
            zones, stop clusters, breakout liquidity, and smart money targeting.
          </p>

          <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-yellow-300">
            Phase 2 Liquidity Infrastructure Placeholder
          </div>

          <a
            href="/dashboard"
            className="mt-10 inline-block rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Back to Terminal
          </a>
        </div>
      </div>
    </main>
  );
}