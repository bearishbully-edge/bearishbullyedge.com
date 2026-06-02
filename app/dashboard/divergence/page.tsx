export default function DivergencePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Divergence Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Divergence Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Detects disagreement between price, momentum, volume, participation,
            and market internals. Divergence often appears before trend
            exhaustion, reversals, and failed breakouts.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Momentum Divergence"
              desc="Identifies disagreement between price and momentum."
            />

            <EngineCard
              title="Volume Divergence"
              desc="Identifies disagreement between price and participation."
            />

            <EngineCard
              title="Confirmation Analysis"
              desc="Measures whether supporting indicators agree with price."
            />

            <EngineCard
              title="Divergence Scoring"
              desc="Engine-generated confidence score for divergence quality."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• Price vs MACD Divergence</li>
              <li>• Price vs Stochastic Divergence</li>
              <li>• Price vs RSI Divergence</li>
              <li>• Price vs Volume Divergence</li>
              <li>• Price vs Delta Divergence</li>
              <li>• Bullish Divergence Detection</li>
              <li>• Bearish Divergence Detection</li>
              <li>• Hidden Divergence Detection</li>
              <li>• Divergence Strength Scoring</li>
              <li>• Multi-Timeframe Divergence Matrix</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Divergence vs Momentum
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              Momentum answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                How strong is the move?
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-300">
              Divergence answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                Do the measurements agree with the move?
              </div>
            </div>

            <p className="mt-6 text-slate-400">
              Momentum measures force. Divergence measures agreement.
              These engines are related but solve different problems.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Classical Divergence Concepts
            </h2>

            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Bullish Divergence</li>
              <li>• Bearish Divergence</li>
              <li>• Hidden Bullish Divergence</li>
              <li>• Hidden Bearish Divergence</li>
              <li>• Momentum Failure</li>
              <li>• Participation Failure</li>
              <li>• Trend Exhaustion Warning</li>
              <li>• Reversal Potential</li>
              <li>• Confirmation Failure</li>
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