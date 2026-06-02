export default function WorkspacePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">

          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Execution Workspace
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Execution Workspace
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-400">
            Real-time trading environment for execution, monitoring,
            footprint analysis, broker connectivity, and position management.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <WorkspaceCard
              title="Charting"
              desc="TradingView and execution charts."
            />

            <WorkspaceCard
              title="Footprint"
              desc="Bid/Ask volume visualization."
            />

            <WorkspaceCard
              title="DOM"
              desc="Depth of Market ladder."
            />

            <WorkspaceCard
              title="Tape"
              desc="Time & Sales monitoring."
            />

            <WorkspaceCard
              title="Positions"
              desc="Open trades and exposure."
            />

            <WorkspaceCard
              title="Broker Controls"
              desc="Execution and routing controls."
            />

          </div>

          <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-yellow-300">
            Live Workspace Infrastructure Placeholder
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

function WorkspaceCard({
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