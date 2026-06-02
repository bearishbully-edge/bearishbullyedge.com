export default function PositionRiskPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Position Risk Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Position Risk Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Protects capital by controlling position sizing, account exposure,
            drawdown limits, portfolio heat, and risk concentration. The
            Position Risk Engine exists to ensure survival, consistency, and
            long-term performance regardless of strategy.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Position Sizing"
              desc="Determines contract quantity and capital allocation."
            />

            <EngineCard
              title="Risk Per Trade"
              desc="Calculates maximum acceptable loss on each position."
            />

            <EngineCard
              title="Account Protection"
              desc="Monitors daily loss limits and drawdown thresholds."
            />

            <EngineCard
              title="Portfolio Heat"
              desc="Measures total account exposure across positions."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• Position Size Calculator</li>
              <li>• ATR Risk Calculator</li>
              <li>• Risk Per Trade Validation</li>
              <li>• Daily Loss Limits</li>
              <li>• Weekly Loss Limits</li>
              <li>• Maximum Drawdown Controls</li>
              <li>• Consecutive Loss Lockout</li>
              <li>• Portfolio Heat Monitoring</li>
              <li>• Correlated Position Detection</li>
              <li>• Exposure Concentration Alerts</li>
              <li>• Kill Switch Controls</li>
              <li>• Risk Score Generation</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Position Risk vs Executions
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              Executions answer:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                What trades were taken?
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-300">
              Position Risk answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                Should this trade be taken and how large should it be?
              </div>
            </div>

            <p className="mt-6 text-slate-400">
              Executions record activity. Position Risk controls exposure.
              These engines work together but serve different purposes.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Core Risk Principles
            </h2>

            <ul className="mt-4 space-y-3 text-slate-300">
              <li>• Protect Capital First</li>
              <li>• Risk Small, Compound Consistently</li>
              <li>• Survive Losing Streaks</li>
              <li>• Avoid Overexposure</li>
              <li>• Respect Drawdown Limits</li>
              <li>• Never Let One Trade Damage the Account</li>
              <li>• Consistency Over Aggression</li>
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