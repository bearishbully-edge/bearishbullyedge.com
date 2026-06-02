export default function TrendPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Trend Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Trend Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Measures market direction, trend strength, and directional
            persistence across multiple timeframes. The Trend Engine
            determines whether buyers or sellers currently control the
            market and evaluates the quality of the move.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Market Direction"
              desc="Bullish, bearish, or neutral trend state."
            />

            <EngineCard
              title="Trend Strength"
              desc="Measures conviction and persistence of directional movement."
            />

            <EngineCard
              title="Multi-Timeframe Alignment"
              desc="Compares trend conditions across higher and lower timeframes."
            />

            <EngineCard
              title="Trend Scoring"
              desc="Engine-generated confidence score for directional quality."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• 10 SMA Direction Analysis</li>
              <li>• 20 EMA Direction Analysis</li>
              <li>• Trend Persistence Scoring</li>
              <li>• Trend Strength Analysis</li>
              <li>• Multi-Timeframe Trend Matrix</li>
              <li>• Trend Continuation Detection</li>
              <li>• Trend Reversal Detection</li>
              <li>• Trend Exhaustion Detection</li>
              <li>• Directional Confidence Score</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Trend vs Cycle
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
              Trend measures direction and persistence. Cycle measures
              timing, phase, and position within the market's current
              movement. These are separate but complementary engines.
            </p>
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