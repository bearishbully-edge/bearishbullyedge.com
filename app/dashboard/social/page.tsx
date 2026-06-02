export default function SocialPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-6xl mb-6">🌐</div>

          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Social Trading Network
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Social Trading Network
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-400">
            Community intelligence, trader leaderboards, shared executions,
            strategy following, copy infrastructure, reputation scoring,
            collaboration, and collective market intelligence.
          </p>

          <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-yellow-300">
            Community & Copy Trading Infrastructure Placeholder
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Leaderboards"
              desc="Rank traders by performance, consistency, and discipline."
            />

            <FeatureCard
              title="Shared Executions"
              desc="View verified trades and execution history."
            />

            <FeatureCard
              title="Strategy Following"
              desc="Follow traders and monitor playbook performance."
            />

            <FeatureCard
              title="Copy Infrastructure"
              desc="Future automated strategy mirroring framework."
            />

            <FeatureCard
              title="Reputation Scores"
              desc="Trust and credibility scoring for community members."
            />

            <FeatureCard
              title="Market Intelligence"
              desc="Crowdsourced insights and market observations."
            />
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