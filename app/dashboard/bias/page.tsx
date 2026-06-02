export default function BiasPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Bias Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Bias Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Determines directional preference using market context,
            institutional positioning, intermarket relationships,
            and higher timeframe conditions. The Bias Engine provides
            directional context for Scanner, Signals, Executions,
            Position Risk, and Coach.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Directional Bias"
              desc="Bullish, bearish, or neutral market preference."
            />

            <EngineCard
              title="Higher Timeframe Context"
              desc="Daily and weekly directional alignment."
            />

            <EngineCard
              title="Institutional Positioning"
              desc="Commercials, funds, and COT-based directional analysis."
            />

            <EngineCard
              title="Bias Scoring"
              desc="Engine-generated directional confidence score."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• Daily Bias Engine</li>
              <li>• Weekly Bias Engine</li>
              <li>• Monthly Bias Engine</li>
              <li>• COT Analysis</li>
              <li>• Intermarket Confirmation</li>
              <li>• Correlation Analysis</li>
              <li>• Institutional Positioning Score</li>
              <li>• Bias Confidence Score</li>
              <li>• Multi-Timeframe Alignment Matrix</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Bias vs Trend
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              Bias answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                Which side of the market do I prefer to trade?
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-300">
              Trend answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                How healthy and persistent is the current move?
              </div>
            </div>

            <p className="mt-6 text-slate-400">
              These engines work together but solve different problems.
              Bias provides directional preference while Trend measures
              directional quality and persistence.
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