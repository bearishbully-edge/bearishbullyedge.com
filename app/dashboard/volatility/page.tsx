export default function VolatilityPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Volatility Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Volatility Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Measures expansion, contraction, range behavior, and market
            activity. The Volatility Engine helps determine when markets
            are quiet, when they are active, and when conditions are
            favorable for directional movement.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Volatility State"
              desc="Determines whether volatility is expanding, contracting, or neutral."
            />

            <EngineCard
              title="ATR Analysis"
              desc="Measures average range and expected market movement."
            />

            <EngineCard
              title="Compression Detection"
              desc="Identifies low-volatility environments before expansion."
            />

            <EngineCard
              title="Expansion Detection"
              desc="Identifies increasing volatility and breakout conditions."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• ATR Analysis</li>
              <li>• Bollinger Band Width</li>
              <li>• Volatility Contraction Detection</li>
              <li>• Volatility Expansion Detection</li>
              <li>• Range Analysis</li>
              <li>• Breakout Probability Scoring</li>
              <li>• Expansion Persistence Scoring</li>
              <li>• Multi-Timeframe Volatility Matrix</li>
              <li>• Event-Driven Volatility Tracking</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Volatility vs Momentum
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              Volatility answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                How much is the market moving?
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-300">
              Momentum answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                How strongly is the market moving?
              </div>
            </div>

            <p className="mt-6 text-slate-400">
              A market can have high volatility and weak momentum, or
              strong momentum and moderate volatility. These are separate
              measurements that work together.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Classical Volatility Concepts
            </h2>

            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Average True Range (ATR)</li>
              <li>• Compression</li>
              <li>• Expansion</li>
              <li>• Range Contraction</li>
              <li>• Range Expansion</li>
              <li>• Bollinger Band Squeeze</li>
              <li>• Breakout Environment</li>
              <li>• Quiet Market Conditions</li>
              <li>• Active Market Conditions</li>
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