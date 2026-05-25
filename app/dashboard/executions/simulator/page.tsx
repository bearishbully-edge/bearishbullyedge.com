'use client';

import { useState } from 'react';

type SimulationResult = {
  ok: boolean;
  executionId?: string;
  journalEntryId?: string;
  reused?: boolean;
  error?: string;
  message?: string;
};

export default function ExecutionSimulatorPage() {
  const [loading, setLoading] = useState(false);

  const [result, setResult] =
    useState<SimulationResult | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        '/api/trade-executions/create',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            userId:
              'ebddb73c-c217-4c47-bb3e-187b731159fe',

            executionSource: 'paper',

            brokerTradeId: `sim-${Date.now()}`,

            symbol: 'MNQ',

            tradeSide: Math.random() > 0.5
              ? 'long'
              : 'short',

            strategyName:
              'Volatility Expansion Breakout',

            executionMode: 'paper',

            entryPrice: 21450,
            stopPrice: 21410,
            targetPrice: 21540,
            exitPrice: 21505,

            quantity: 1,

            pnl:
              Math.random() > 0.3
                ? 420
                : -180,

            confidenceScore:
              Math.floor(
                75 + Math.random() * 25,
              ),

            setupGrade:
              Math.random() > 0.5
                ? 'A+'
                : 'A',

            biasState: 'aligned',

            volatilityState:
              'expanding_after_compression',

            liquidityState:
              'sweep_detected',

            cycleState:
              'bullish_transition',

            divergenceState:
              'none',

            economicRiskState:
              'clear',

            status: 'closed',
          }),
        },
      );

      const data =
        (await response.json()) as SimulationResult;

      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        error: 'simulation_failed',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      });
    }

    setLoading(false);
  };

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-12 text-white'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-10'>
          <div className='text-sm font-black uppercase tracking-[0.2em] text-emerald-300'>
            Execution Testing
          </div>

          <h1 className='mt-4 text-5xl font-black tracking-tight'>
            Execution Simulator
          </h1>

          <p className='mt-4 max-w-2xl text-slate-400'>
            Simulate automated paper trades
            flowing through the execution,
            journal and performance systems.
          </p>
        </div>

        <div className='rounded-3xl border border-slate-800 bg-slate-900 p-8'>
          <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
            <div>
              <div className='text-2xl font-black'>
                Paper Execution Engine
              </div>

              <p className='mt-2 text-slate-400'>
                Creates:
                execution → journal draft →
                performance update.
              </p>
            </div>

            <button
              onClick={runSimulation}
              disabled={loading}
              className='rounded-2xl bg-emerald-400 px-8 py-4 text-lg font-black text-black transition hover:scale-[1.02] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {loading
                ? 'Running Simulation...'
                : 'Run Simulation'}
            </button>
          </div>
        </div>

        {result && (
          <div className='mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-8'>
            <div className='text-sm font-black uppercase tracking-[0.2em] text-slate-400'>
              Simulation Result
            </div>

            <div
              className={
                result.ok
                  ? 'mt-4 text-4xl font-black text-emerald-300'
                  : 'mt-4 text-4xl font-black text-red-300'
              }
            >
              {result.ok
                ? 'SUCCESS'
                : 'FAILED'}
            </div>

            <div className='mt-6 space-y-4 text-sm text-slate-300'>
              {result.executionId && (
                <div>
                  <span className='font-black text-white'>
                    Execution ID:
                  </span>{' '}
                  {result.executionId}
                </div>
              )}

              {result.journalEntryId && (
                <div>
                  <span className='font-black text-white'>
                    Journal Entry:
                  </span>{' '}
                  {result.journalEntryId}
                </div>
              )}

              {result.reused && (
                <div className='text-yellow-300'>
                  Existing execution reused.
                </div>
              )}

              {result.message && (
                <div>{result.message}</div>
              )}
            </div>
          </div>
        )}

        <div className='mt-8 flex gap-4'>
          <a
            href='/dashboard/executions'
            className='rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white'
          >
            View Executions
          </a>

          <a
            href='/dashboard/journal/history'
            className='rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white'
          >
            View Journal History
          </a>
        </div>
      </div>
    </main>
  );
}