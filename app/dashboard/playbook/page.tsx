export default function PlaybookPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Playbook Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Playbook Engine
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            The Playbook Engine is the strategy library for BearishBully Edge.
            It defines approved setups, entry rules, stop rules, target rules,
            risk requirements, and trade management instructions before a setup
            is allowed to move through Scanner, Signals, Executions, Journal,
            Performance, and Coach.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <EngineCard
              title="Strategy Library"
              desc="Stores approved BearishBully trading strategies."
            />

            <EngineCard
              title="Setup Requirements"
              desc="Defines the conditions required before a trade qualifies."
            />

            <EngineCard
              title="Execution Rules"
              desc="Defines entries, stops, targets, and management rules."
            />

            <EngineCard
              title="Performance Attribution"
              desc="Tracks results by strategy, setup type, and playbook rule."
            />
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Playbooks
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• Compression Breakout</li>
              <li>• Trend Continuation</li>
              <li>• Range Expansion</li>
              <li>• Volatility Expansion</li>
              <li>• Momentum Continuation</li>
              <li>• Divergence Reversal</li>
              <li>• Structure Failure Reversal</li>
              <li>• Support Bounce</li>
              <li>• Resistance Rejection</li>
              <li>• Economic Event Reaction</li>
              <li>• Order Flow Confirmation</li>
              <li>• Custom User Playbooks</li>
            </ul>
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Playbook vs Journal
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              Playbook answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                What setups am I allowed to trade?
              </div>
            </div>

            <p className="mt-6 leading-8 text-slate-300">
              Journal answers:
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="font-bold text-white">
                What happened after I traded?
              </div>
            </div>

            <p className="mt-6 text-slate-400">
              The Playbook defines the plan before execution. The Journal
              records and reviews what happened after execution.
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Example Playbook Structure
            </h2>

            <div className="mt-6 space-y-4 text-slate-400">
              <div>
                <span className="font-bold text-white">Setup:</span>{" "}
                Compression Breakout
              </div>

              <div>
                <span className="font-bold text-white">Requirements:</span>{" "}
                Trend aligned, momentum increasing, volatility contracted,
                economic risk clear, structure intact.
              </div>

              <div>
                <span className="font-bold text-white">Entry:</span>{" "}
                Break of compression range after confirmation.
              </div>

              <div>
                <span className="font-bold text-white">Stop:</span>{" "}
                Opposite side of compression structure or ATR-defined invalidation.
              </div>

              <div>
                <span className="font-bold text-white">Target:</span>{" "}
                Measured expansion objective or next major structure level.
              </div>
            </div>
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
      <div className="text-xl font-black text-white">{title}</div>

      <p className="mt-3 text-sm leading-7 text-slate-400">{desc}</p>
    </div>
  );
}