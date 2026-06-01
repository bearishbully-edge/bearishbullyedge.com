'use client';

import { useState } from 'react';

type ScanCandidate = {
  symbol: string;
  tradeSide: 'long' | 'short';
  confidenceScore: number;
  setupGrade: string;
  liquidityAnalysis?: {
    liquidityScore: number;
    liquidityBias: string;
    sweepDetected: boolean;
    sweepDirection: string;
    targetLiquidityZone: string;
    stopRunProbability: number;
    coachNote: string;
  };
  conditions: {
    biasAligned: boolean;
    volatilityExpansion: boolean;
    liquidityMapped: boolean;
    cycleAligned: boolean;
    divergenceConfirmed: boolean;
    economicRiskClear: boolean;
  };
};

type ScannerResult = {
  ok: boolean;
  scannedAt?: string;
  autoExecute?: boolean;
  topCandidate?: ScanCandidate;
  candidates?: ScanCandidate[];
  execution?: {
    ok?: boolean;
    executionId?: string;
    journalEntryId?: string;
    reused?: boolean;
    error?: string;
    message?: string;
  } | null;
  error?: string;
};

export default function ScannerPage() {
  const [symbols, setSymbols] = useState('MNQ,NQ,ES,SPY,QQQ');
  const [autoExecute, setAutoExecute] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScannerResult | null>(null);

  const runScanner = async () => {
    setLoading(true);
    setResult(null);

    try {
      const symbolList = symbols
        .split(',')
        .map((symbol) => symbol.trim().toUpperCase())
        .filter(Boolean);

      const response = await fetch('/api/scanner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'ebddb73c-c217-4c47-bb3e-187b731159fe',
          symbols: symbolList,
          autoExecute,
        }),
      });

      const data = (await response.json()) as ScannerResult;
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Scanner request failed.',
      });
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">
              Market Scanner
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Scanner Engine
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Scan symbols, rank setups, score confluence, and optionally push
              high-confidence setups into the execution and journal pipeline.
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
          <div className="grid gap-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <label>
              <span className="mb-2 block text-sm font-bold text-slate-300">
                Symbols
              </span>

              <input
                value={symbols}
                onChange={(event) => setSymbols(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
            </label>

            <button
              onClick={() => setAutoExecute((current) => !current)}
              className={
                autoExecute
                  ? 'rounded-xl border border-emerald-400 bg-emerald-400/10 px-5 py-3 font-black text-emerald-300'
                  : 'rounded-xl border border-slate-700 px-5 py-3 font-black text-slate-300'
              }
            >
              {autoExecute ? 'Auto Execute ON' : 'Auto Execute OFF'}
            </button>

            <button
              onClick={runScanner}
              disabled={loading}
              className="rounded-xl bg-emerald-400 px-6 py-3 font-black text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {loading ? 'Scanning...' : 'Run Scanner'}
            </button>
          </div>
        </section>

        {result && (
          <section className="mt-8">
            {!result.ok && (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
                {result.error ?? 'Scanner failed.'}
              </div>
            )}

            {result.ok && (
              <>
                <div className="mb-6 grid gap-5 md:grid-cols-4">
                  <StatCard
                    label="Candidates"
                    value={String(result.candidates?.length ?? 0)}
                  />

                  <StatCard
                    label="Top Symbol"
                    value={result.topCandidate?.symbol ?? '-'}
                  />

                  <StatCard
                    label="Top Score"
                    value={
                      result.topCandidate
                        ? `${result.topCandidate.confidenceScore}%`
                        : '-'
                    }
                    highlight
                  />

                  <StatCard
                    label="Execution"
                    value={result.execution?.ok ? 'Created' : 'None'}
                  />
                </div>

                {result.execution?.ok && (
                  <div className="mb-6 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-5 text-emerald-300">
                    Execution created: {result.execution.executionId}
                    <br />
                    Journal draft: {result.execution.journalEntryId}
                  </div>
                )}

                <div className="space-y-5">
                  {(result.candidates ?? []).map((candidate, index) => (
                    <article
                      key={`${candidate.symbol}-${index}`}
                      className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="text-3xl font-black">
                              #{index + 1} {candidate.symbol}
                            </div>

                            <Badge
                              text={candidate.tradeSide}
                              color={
                                candidate.tradeSide === 'long'
                                  ? 'green'
                                  : 'red'
                              }
                            />

                            <Badge
                              text={candidate.setupGrade}
                              color={
                                candidate.confidenceScore >= 80
                                  ? 'green'
                                  : candidate.confidenceScore >= 60
                                    ? 'yellow'
                                    : 'red'
                              }
                            />
                          </div>

                          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                            <Condition
                              label="Bias"
                              active={candidate.conditions.biasAligned}
                            />

                            <Condition
                              label="Volatility"
                              active={
                                candidate.conditions.volatilityExpansion
                              }
                            />

                            <Condition
                              label="Liquidity"
                              active={candidate.conditions.liquidityMapped}
                            />

                            <Condition
                              label="Cycle"
                              active={candidate.conditions.cycleAligned}
                            />

                            <Condition
                              label="Divergence"
                              active={
                                candidate.conditions.divergenceConfirmed
                              }
                            />

                            <Condition
                              label="Econ"
                              active={candidate.conditions.economicRiskClear}
                            />
                          </div>
                          {candidate.liquidityAnalysis && (
                            <div className="mt-5 rounded-2xl border border-blue-400/30 bg-blue-400/10 p-5">
                              <div className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-blue-300">
                                Liquidity Intelligence
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <Metric
                                  label="Liquidity Score"
                                  value={`${candidate.liquidityAnalysis.liquidityScore}%`}
                                />

                                <Metric
                                  label="Bias"
                                  value={candidate.liquidityAnalysis.liquidityBias}
                                />

                                <Metric
                                  label="Sweep"
                                  value={candidate.liquidityAnalysis.sweepDirection}
                                />

                                <Metric
                                  label="Target Zone"
                                  value={candidate.liquidityAnalysis.targetLiquidityZone}
                                />

                                <Metric
                                  label="Stop Run"
                                  value={`${candidate.liquidityAnalysis.stopRunProbability}%`}
                                />

                                <Metric
                                  label="Sweep Detected"
                                  value={candidate.liquidityAnalysis.sweepDetected ? 'YES' : 'NO'}
                                />
                              </div>

                              <p className="mt-4 text-sm leading-6 text-blue-100">
                                {candidate.liquidityAnalysis.coachNote}
                              </p>
                            </div>
                          )}                          
                        </div>

                        <div className="lg:min-w-[220px]">
                          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              Confidence
                            </div>

                            <div
                              className={
                                candidate.confidenceScore >= 80
                                  ? 'mt-2 text-5xl font-black text-emerald-300'
                                  : candidate.confidenceScore >= 60
                                    ? 'mt-2 text-5xl font-black text-yellow-300'
                                    : 'mt-2 text-5xl font-black text-red-300'
                              }
                            >
                              {candidate.confidenceScore}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
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

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? 'rounded-3xl border border-emerald-400/40 bg-slate-900 p-6'
          : 'rounded-3xl border border-slate-800 bg-slate-900 p-6'
      }
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div
        className={
          highlight
            ? 'mt-2 text-5xl font-black text-emerald-300'
            : 'mt-2 text-4xl font-black'
        }
      >
        {value}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 p-3">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-sm font-black text-white">
        {value}
      </div>
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
      <div className="mt-2 text-sm font-black">{active ? 'PASS' : 'FAIL'}</div>
    </div>
  );
}

function Badge({
  text,
  color,
}: {
  text: string;
  color: 'green' | 'red' | 'yellow';
}) {
  const styles = {
    green: 'bg-emerald-400/20 text-emerald-300',
    red: 'bg-red-400/20 text-red-300',
    yellow: 'bg-yellow-400/20 text-yellow-300',
  };

  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${styles[color]}`}
    >
      {text}
    </div>
  );
}