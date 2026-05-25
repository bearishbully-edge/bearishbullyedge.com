'use client';

import { useState } from 'react';

type SignalResult = {
  ok: boolean;
  signal?: {
    symbol: string;
    tradeSide: string;
    confidenceScore: number;
    setupGrade: string;
    conditions: {
      biasAligned: boolean;
      volatilityExpansion: boolean;
      liquidityMapped: boolean;
      cycleAligned: boolean;
      economicRiskClear: boolean;
    };
  };
  execution?: {
    ok: boolean;
    executionId?: string;
    journalEntryId?: string;
    reused?: boolean;
    error?: string;
    message?: string;
  };
};

export default function SignalsPage() {
  const [symbol, setSymbol] = useState('MNQ');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SignalResult | null>(null);

  const runSignal = async () => {
    setLoading(true);
    setResult(null);

    const response = await fetch('/api/signals/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'ebddb73c-c217-4c47-bb3e-187b731159fe',
        symbol,
      }),
    });

    const data = (await response.json()) as SignalResult;

    setResult(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">
              Signal Engine
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Signal Simulation Console
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Generate a scored paper signal and push it through the execution,
              journal, and performance pipeline.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Back to Terminal
          </a>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-300">
                Symbol
              </span>

              <input
                value={symbol}
                onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
            </label>

            <button
              onClick={runSignal}
              disabled={loading}
              className="rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {loading ? 'Running Signal...' : 'Run Signal'}
            </button>
          </div>
        </section>

        {result && (
          <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 text-sm font-black uppercase tracking-[0.2em] text-slate-500">
              Result
            </div>

            <div
              className={
                result.ok
                  ? 'text-4xl font-black text-emerald-300'
                  : 'text-4xl font-black text-red-300'
              }
            >
              {result.ok ? 'SIGNAL ACCEPTED' : 'SIGNAL FAILED'}
            </div>

            {result.signal && (
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <Metric label="Symbol" value={result.signal.symbol} />
                <Metric label="Side" value={result.signal.tradeSide} />
                <Metric
                  label="Confidence"
                  value={`${result.signal.confidenceScore}%`}
                />
                <Metric label="Grade" value={result.signal.setupGrade} />
              </div>
            )}

            {result.signal && (
              <div className="mt-6 grid gap-3 md:grid-cols-5">
                <Condition
                  label="Bias"
                  active={result.signal.conditions.biasAligned}
                />
                <Condition
                  label="Volatility"
                  active={result.signal.conditions.volatilityExpansion}
                />
                <Condition
                  label="Liquidity"
                  active={result.signal.conditions.liquidityMapped}
                />
                <Condition
                  label="Cycle"
                  active={result.signal.conditions.cycleAligned}
                />
                <Condition
                  label="Econ Risk"
                  active={result.signal.conditions.economicRiskClear}
                />
              </div>
            )}

            {result.execution && (
              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5 text-sm text-slate-300">
                <div>
                  <span className="font-black text-white">Execution:</span>{' '}
                  {result.execution.executionId ?? 'none'}
                </div>

                <div className="mt-2">
                  <span className="font-black text-white">Journal:</span>{' '}
                  {result.execution.journalEntryId ?? 'none'}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="/dashboard/executions"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            View Executions
          </a>

          <a
            href="/dashboard/journal/history"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            View Journal History
          </a>

          <a
            href="/dashboard/performance"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            View Performance
          </a>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function Condition({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={
        active
          ? 'rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-emerald-300'
          : 'rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-red-300'
      }
    >
      <div className="text-xs font-bold uppercase tracking-wide">{label}</div>
      <div className="mt-2 text-sm font-black">
        {active ? 'PASS' : 'FAIL'}
      </div>
    </div>
  );
}