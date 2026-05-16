export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="text-xl font-black tracking-tight">
          BearishBully Edge
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#plans" className="hover:text-white">
            Plans
          </a>
          <a href="/auth/login" className="hover:text-white">
            Log In
          </a>
        </nav>

        <a
          href="/auth/signup"
          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 hover:bg-slate-200"
        >
          Start Free
        </a>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="mb-5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            Built for disciplined traders, not noise chasers.
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Your edge, organized into one trading command center.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            BearishBully Edge combines bias, volume delta, orderflow context,
            COT positioning, economic events, automation controls, and replay
            tools into one clean terminal built for serious decision-making.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="/auth/signup"
              className="rounded-xl bg-emerald-400 px-7 py-4 text-center font-black text-slate-950 hover:bg-emerald-300"
            >
              Create Account
            </a>

            <a
              href="/auth/login"
              className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-white hover:bg-slate-900"
            >
              Log In
            </a>

            <a
              href="/pricing"
              className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
            >
              View Plans
            </a>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Paper automation and analytics first. Live broker execution requires
            broker adapters, risk controls, and server-side approval.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Market Bias</div>
                <div className="text-2xl font-black text-red-400">BEARISH</div>
              </div>
              <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                LIVE TERMINAL
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TerminalCard label="Volume Delta" value="+2,600" />
              <TerminalCard label="COT Positioning" value="Funds Long" />
              <TerminalCard label="Orderflow" value="Absorption" />
              <TerminalCard label="Economic Risk" value="Clear" />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <div className="mb-2 text-sm font-bold text-slate-300">
                Signal Stack
              </div>
              <div className="space-y-3">
                <SignalRow label="Bias aligned" active />
                <SignalRow label="Delta confirmation" active />
                <SignalRow label="Orderflow confirmation" active />
                <SignalRow label="High-impact news veto" active={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-3xl font-black md:text-5xl">
            Everything a serious trader needs before pressing the button.
          </h2>
          <p className="mt-4 text-slate-400">
            Built around confirmation, risk filtering, replay, and disciplined
            execution preparation.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Feature title="Bias Engine" text="Track daily directional context across SPX, NDX, DJIA, and volatility conditions." />
          <Feature title="Volume Delta" text="Monitor buyer/seller pressure and identify aggressive participation." />
          <Feature title="COT Overlay" text="View institutional positioning context before taking directional risk." />
          <Feature title="Economic Calendar" text="Avoid high-impact event windows before entering trades." />
          <Feature title="Paper Automation" text="Test strategy logic with explicit paper execution and risk limits." />
          <Feature title="Replay & Backtesting" text="Compare replay behavior against backtest results for consistency." />
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 md:p-12">
          <h2 className="text-3xl font-black md:text-5xl">
            Start with the terminal. Upgrade as your process matures.
          </h2>
          <p className="mt-4 max-w-3xl text-slate-400">
            BearishBully Edge is designed as a premium trading SaaS with gated
            analytics, automation tools, replay systems, and future broker
            integrations.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/auth/signup"
              className="rounded-xl bg-white px-7 py-4 text-center font-black text-slate-950 hover:bg-slate-200"
            >
              Create Your Account
            </a>
            <a
              href="/pricing"
              className="rounded-xl border border-slate-700 px-7 py-4 text-center font-bold text-white hover:bg-slate-800"
            >
              See Pricing
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900 px-6 py-8 text-center text-sm text-slate-500">
        © 2026 BearishBully Edge. Trading involves risk. Use discipline,
        risk controls, and proper position sizing.
      </footer>
    </main>
  );
}

function TerminalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
  );
}

function SignalRow({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-950 px-3 py-2">
      <span className="text-sm text-slate-300">{label}</span>
      <span
        className={
          active
            ? 'text-sm font-bold text-emerald-300'
            : 'text-sm font-bold text-slate-600'
        }
      >
        {active ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}