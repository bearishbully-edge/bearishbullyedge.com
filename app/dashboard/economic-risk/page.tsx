export default function EconomicRiskPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Economic Risk Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Economic Risk Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Classical event-risk filter for high-impact reports, volatility
            windows, news-driven range expansion, and trade timing protection.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <RiskCard title="High-Impact Events" desc="Flags reports that can create sudden range expansion." />
            <RiskCard title="Volatility Windows" desc="Identifies periods where spreads and slippage may widen." />
            <RiskCard title="Trade Lockout Zones" desc="Protects the trader from entering near major news releases." />
            <RiskCard title="Session Risk" desc="Separates normal market movement from event-driven movement." />
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

function RiskCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="text-xl font-black text-white">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{desc}</p>
    </div>
  );
}