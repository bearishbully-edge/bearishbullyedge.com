export default function OrderflowPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Institutional Orderflow
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Orderflow Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Institutional execution intelligence layer for footprint analysis,
            absorption detection, delta imbalance, liquidity sweeps, iceberg
            tracking and smart money flow interpretation.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <FeatureCard
              title="Footprint Charts"
              desc="Bid/ask aggression and volume imbalance tracking."
            />

            <FeatureCard
              title="Delta Engine"
              desc="Real-time cumulative delta and directional pressure."
            />

            <FeatureCard
              title="Liquidity Sweeps"
              desc="Detect stop runs and engineered liquidity grabs."
            />

            <FeatureCard
              title="Absorption Detection"
              desc="Identify hidden passive institutional participation."
            />

            <FeatureCard
              title="Iceberg Tracking"
              desc="Monitor repeated hidden order absorption zones."
            />

            <FeatureCard
              title="Smart Money Flow"
              desc="Institutional positioning and execution pressure."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-yellow-300">
            Phase 2 Infrastructure Placeholder
          </div>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="text-xl font-black text-white">
        {title}
      </div>

      <div className="mt-3 text-sm leading-7 text-slate-400">
        {desc}
      </div>
    </div>
  );
}