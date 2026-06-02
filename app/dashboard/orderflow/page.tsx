const orderflowSnapshot = {
  symbol: 'MNQ',
  delta: '+528,303',
  deltaState: 'Buyer Pressure',
  absorption: 'Moderate',
  imbalance: 'Bullish',
  largeOrders: 12,
  aggressiveBuying: 'Elevated',
  aggressiveSelling: 'Normal',
  executionNote:
    'Buyers are lifting offers with positive delta. Watch for absorption near resistance before chasing continuation.',
};

export default function OrderflowPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">
            Order Flow Engine
          </div>

          <h1 className="mt-4 text-5xl font-black tracking-tight">
            Order Flow Intelligence
          </h1>

          <p className="mt-6 max-w-4xl text-lg leading-8 text-slate-400">
            Classical execution intelligence for volume delta, bid/ask pressure,
            absorption, imbalance, large order activity, and participation quality.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Symbol" value={orderflowSnapshot.symbol} />
            <MetricCard label="Volume Delta" value={orderflowSnapshot.delta} highlight />
            <MetricCard label="Delta State" value={orderflowSnapshot.deltaState} />
            <MetricCard label="Large Orders" value={String(orderflowSnapshot.largeOrders)} />
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard title="Absorption" value={orderflowSnapshot.absorption} />
            <FeatureCard title="Imbalance" value={orderflowSnapshot.imbalance} />
            <FeatureCard title="Aggressive Buying" value={orderflowSnapshot.aggressiveBuying} />
            <FeatureCard title="Aggressive Selling" value={orderflowSnapshot.aggressiveSelling} />
            <FeatureCard title="Footprint Readiness" value="Integration Ready" />
            <FeatureCard title="NinjaTrader Bridge" value="Phase 2 Pending" />
          </div>

          <div className="mt-10 rounded-2xl border border-emerald-900 bg-emerald-950/20 p-6">
            <h2 className="text-xl font-black text-emerald-300">
              Execution Note
            </h2>

            <p className="mt-4 leading-8 text-slate-300">
              {orderflowSnapshot.executionNote}
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-950 p-6">
            <h2 className="text-xl font-black text-white">
              Planned Order Flow Components
            </h2>

            <ul className="mt-4 space-y-3 text-slate-400">
              <li>• Bid / Ask Volume</li>
              <li>• Volume Delta</li>
              <li>• Cumulative Delta</li>
              <li>• Absorption Detection</li>
              <li>• Imbalance Detection</li>
              <li>• Large Order Detection</li>
              <li>• Footprint Chart Integration</li>
              <li>• Execution Pressure Score</li>
              <li>• Participation Quality Score</li>
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

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div
        className={
          highlight
            ? 'mt-2 text-3xl font-black text-emerald-300'
            : 'mt-2 text-3xl font-black text-white'
        }
      >
        {value}
      </div>
    </div>
  );
}

function FeatureCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
      <div className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </div>

      <div className="mt-2 text-xl font-black text-white">
        {value}
      </div>
    </div>
  );
}