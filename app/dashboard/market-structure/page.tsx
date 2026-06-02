export default function MarketStructurePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Market Structure Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Market Structure Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Defines the price framework of the market. The Market Structure
            Engine identifies trends, ranges, breakouts, reversals, support,
            resistance, and structural shifts to provide context for every
            BearishBully decision engine.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Trend Structure"
              desc="Higher highs, higher lows, lower highs, and lower lows."
            />

            <EngineCard
              title="Support & Resistance"
              desc="Identification of significant reaction levels."
            />

            <EngineCard
              title="Breakout Detection"
              desc="Detects structural continuation and expansion."
            />

            <EngineCard
              title="Reversal Detection"
              desc="Detects structural failure and directional change."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• Higher High Detection</li>
              <li>• Higher Low Detection</li>
              <li>• Lower High Detection</li>
              <li>• Lower Low Detection</li>
              <li>• Support Identification</li>
              <li>• Resistance Identification</li>
              <li>• Range Detection</li>
              <li>• Breakout Recognition</li>
              <li>• Breakdown Recognition</li>
              <li>• Trend State Classification</li>
              <li>• Structure Strength Scoring</li>
              <li>• Multi-Timeframe Structure Matrix</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Market Structure vs Liquidity
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              Market Structure answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                Where is price?
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-300">
              Liquidity answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                Where are orders likely resting?
              </div>
            </div>

            <p className="mt-6 text-slate-400">
              Market Structure provides the map. Liquidity identifies where
              participants are likely positioned within that map. These
              engines work together but solve different problems.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Classical Market Structure Concepts
            </h2>

            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Support</li>
              <li>• Resistance</li>
              <li>• Trading Range</li>
              <li>• Trend Continuation</li>
              <li>• Trend Reversal</li>
              <li>• Breakout</li>
              <li>• Breakdown</li>
              <li>• Accumulation</li>
              <li>• Distribution</li>
              <li>• Price Acceptance</li>
              <li>• Price Rejection</li>
              <li>• Range Expansion</li>
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