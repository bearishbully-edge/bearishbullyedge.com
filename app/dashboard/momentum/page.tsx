export default function MomentumPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Momentum Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Momentum Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Measures the force, speed, and acceleration of price movement.
            Momentum helps determine whether buyers or sellers are gaining
            control and whether a move is strengthening or weakening.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard title="Momentum Direction" desc="Measures whether momentum favors buyers or sellers." />
            <EngineCard title="Momentum Strength" desc="Evaluates the intensity and persistence of directional movement." />
            <EngineCard title="Acceleration Analysis" desc="Detects increasing or decreasing momentum conditions." />
            <EngineCard title="Momentum Scoring" desc="Engine-generated confidence score for momentum quality." />
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

function EngineCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="text-xl font-black text-white">{title}</div>
      <p className="mt-3 text-sm leading-7 text-slate-400">{desc}</p>
    </div>
  );
}