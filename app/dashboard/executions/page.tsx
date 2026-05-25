'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type TradeExecution = {
  id: string;

  execution_source: string;
  execution_mode: string;

  symbol: string;
  trade_side: string;

  strategy_name: string | null;

  entry_price: number | null;
  exit_price: number | null;

  quantity: number | null;
  pnl: number | null;

  confidence_score: number | null;
  setup_grade: string | null;

  status: string;

  created_at: string;
};

export default function ExecutionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [executions, setExecutions] = useState<
    TradeExecution[]
  >([]);

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setLoading(true);
    setError('');

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      setError('Login required.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('trade_executions')
      .select(`
        id,

        execution_source,
        execution_mode,

        symbol,
        trade_side,

        strategy_name,

        entry_price,
        exit_price,

        quantity,
        pnl,

        confidence_score,
        setup_grade,

        status,

        created_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setExecutions((data ?? []) as TradeExecution[]);
    setLoading(false);
  };

  const analytics = useMemo(() => {
    const totalExecutions = executions.length;

    const totalPnl = executions.reduce(
      (sum, execution) =>
        sum + (execution.pnl ?? 0),
      0,
    );

    const openTrades = executions.filter(
      (execution) => execution.status === 'open',
    ).length;

    const closedTrades = executions.filter(
      (execution) => execution.status === 'closed',
    ).length;

    return {
      totalExecutions,
      totalPnl,
      openTrades,
      closedTrades,
    };
  }, [executions]);

  if (loading) {
    return (
      <main className='min-h-screen bg-slate-950 flex items-center justify-center text-slate-400'>
        Loading execution engine...
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-slate-950 px-6 py-8 text-white'>
      <div className='mx-auto max-w-7xl'>
        <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm font-bold text-emerald-300'>
              Execution Infrastructure
            </p>

            <h1 className='mt-2 text-4xl font-black tracking-tight'>
              Trade Execution Feed
            </h1>

            <p className='mt-3 max-w-3xl text-slate-400'>
              Unified broker-agnostic execution
              tracking for paper and live trades.
            </p>
          </div>

          <a
            href='/dashboard'
            className='rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white'
          >
            Back to Terminal
          </a>
        </div>

        {error && (
          <div className='mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300'>
            {error}
          </div>
        )}

        <section className='mb-8 grid gap-5 md:grid-cols-4'>
          <StatCard
            label='Total Executions'
            value={String(analytics.totalExecutions)}
          />

          <StatCard
            label='Open Trades'
            value={String(analytics.openTrades)}
          />

          <StatCard
            label='Closed Trades'
            value={String(analytics.closedTrades)}
          />

          <StatCard
            label='Net P&L'
            value={`$${analytics.totalPnl.toFixed(2)}`}
            highlight
          />
        </section>

        <div className='space-y-5'>
          {executions.map((execution) => (
            <article
              key={execution.id}
              className='rounded-3xl border border-slate-800 bg-slate-900/80 p-6'
            >
              <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
                <div>
                  <div className='flex flex-wrap items-center gap-3'>
                    <div className='text-3xl font-black'>
                      {execution.symbol}
                    </div>

                    <Badge
                      text={execution.trade_side}
                      color={
                        execution.trade_side === 'long'
                          ? 'green'
                          : 'red'
                      }
                    />

                    <Badge
                      text={execution.status}
                      color={
                        execution.status === 'closed'
                          ? 'blue'
                          : 'yellow'
                      }
                    />

                    <Badge
                      text={
                        execution.execution_source
                      }
                      color='gray'
                    />
                  </div>

                  <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    <Metric
                      label='Strategy'
                      value={
                        execution.strategy_name ??
                        'Not specified'
                      }
                    />

                    <Metric
                      label='Entry'
                      value={
                        execution.entry_price?.toString() ??
                        '-'
                      }
                    />

                    <Metric
                      label='Exit'
                      value={
                        execution.exit_price?.toString() ??
                        '-'
                      }
                    />

                    <Metric
                      label='Quantity'
                      value={
                        execution.quantity?.toString() ??
                        '-'
                      }
                    />
                  </div>

                  <div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    <Metric
                      label='Confidence'
                      value={
                        execution.confidence_score
                          ? `${execution.confidence_score}%`
                          : '-'
                      }
                    />

                    <Metric
                      label='Setup Grade'
                      value={
                        execution.setup_grade ?? '-'
                      }
                    />

                    <Metric
                      label='Mode'
                      value={
                        execution.execution_mode
                      }
                    />
                  </div>

                  <div className='mt-5 text-sm text-slate-500'>
                    {new Date(
                      execution.created_at,
                    ).toLocaleString()}
                  </div>
                </div>

                <div className='lg:min-w-[220px]'>
                  <div className='rounded-2xl border border-slate-800 bg-slate-950 p-5'>
                    <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>
                      Trade P&L
                    </div>

                    <div
                      className={
                        (execution.pnl ?? 0) >= 0
                          ? 'mt-2 text-4xl font-black text-emerald-300'
                          : 'mt-2 text-4xl font-black text-red-300'
                      }
                    >
                      $
                      {(
                        execution.pnl ?? 0
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {executions.length === 0 && (
            <div className='rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-500'>
              No executions yet.
            </div>
          )}
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
      <div className='text-sm text-slate-500'>
        {label}
      </div>

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

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-2xl border border-slate-800 bg-slate-950 p-4'>
      <div className='text-xs font-bold uppercase tracking-wide text-slate-500'>
        {label}
      </div>

      <div className='mt-2 text-sm font-semibold text-slate-200'>
        {value}
      </div>
    </div>
  );
}

function Badge({
  text,
  color,
}: {
  text: string;
  color: 'green' | 'red' | 'yellow' | 'blue' | 'gray';
}) {
  const styles = {
    green:
      'bg-emerald-400/20 text-emerald-300',
    red:
      'bg-red-400/20 text-red-300',
    yellow:
      'bg-yellow-400/20 text-yellow-300',
    blue:
      'bg-blue-400/20 text-blue-300',
    gray:
      'bg-slate-700 text-slate-300',
  };

  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${styles[color]}`}
    >
      {text}
    </div>
  );
}