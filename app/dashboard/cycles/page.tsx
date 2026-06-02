export default function CyclesPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Cycles Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Cycles Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Measures market timing, expansion phases, contraction phases,
            transitions, and exhaustion. The Cycles Engine helps determine
            where the market is within its current move and what phase is
            most likely to occur next.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Cycle Phase"
              desc="Identifies contraction, expansion, transition, and exhaustion phases."
            />

            <EngineCard
              title="Market Timing"
              desc="Measures where price is within the current movement cycle."
            />

            <EngineCard
              title="Expansion Potential"
              desc="Estimates probability of continuation and range growth."
            />

            <EngineCard
              title="Cycle Scoring"
              desc="Engine-generated confidence score for cycle quality."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• Contraction Detection</li>
              <li>• Expansion Detection</li>
              <li>• Transition Detection</li>
              <li>• Exhaustion Detection</li>
              <li>• Bollinger Compression Analysis</li>
              <li>• Volatility Cycle Analysis</li>
              <li>• Expansion Probability Scoring</li>
              <li>• Cycle Persistence Analysis</li>
              <li>• Cycle Phase Classification</li>
              <li>• Multi-Timeframe Cycle Matrix</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Cycle vs Trend
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              Trend answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                What direction is the market moving?
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-300">
              Cycle answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                Where are we within the move?
              </div>
            </div>

            <p className="mt-6 text-slate-400">
              Trend measures direction. Cycle measures timing. A market can
              remain in the same trend while progressing through multiple
              cycle phases.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Classical Cycle Concepts
            </h2>

            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Accumulation</li>
              <li>• Markup</li>
              <li>• Distribution</li>
              <li>• Markdown</li>
              <li>• Contraction</li>
              <li>• Expansion</li>
              <li>• Transition</li>
              <li>• Exhaustion</li>
              <li>• Continuation</li>
              <li>• Reversal Potential</li>
            </ul>
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

function EngineCard({
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

      <p className="mt-3 text-sm leading-7 text-slate-400">
        {desc}
      </p>
    </div>
  );
}