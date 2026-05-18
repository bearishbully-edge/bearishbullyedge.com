'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

type JournalEntry = {
  id: string;
  symbol: string;
  trade_side: string;
  pnl: number | null;
  emotional_state: string | null;
  lesson: string | null;
  notes: string | null;
  created_at: string;
};

export default function JournalHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
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
      .from('trade_journal_entries')
      .select(`
        id,
        symbol,
        trade_side,
        pnl,
        emotional_state,
        lesson,
        notes,
        created_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setEntries((data ?? []) as JournalEntry[]);
    setLoading(false);
  };

  const stats = useMemo(() => {
    const totalTrades = entries.length;

    const totalPnl = entries.reduce(
      (sum, entry) => sum + (entry.pnl ?? 0),
      0,
    );

    const wins = entries.filter((entry) => (entry.pnl ?? 0) > 0).length;

    const winRate =
      totalTrades === 0
        ? 0
        : Math.round((wins / totalTrades) * 100);

    return {
      totalTrades,
      totalPnl,
      winRate,
    };
  }, [entries]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">
              Journal History
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Trade Intelligence Archive
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Review execution history, emotional patterns, and performance behavior over time.
            </p>
          </div>

          <a
            href="/dashboard/journal"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Back to Journal
          </a>
        </div>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <StatCard
            label="Total Trades"
            value={String(stats.totalTrades)}
          />

          <StatCard
            label="Win Rate"
            value={`${stats.winRate}%`}
          />

          <StatCard
            label="Net P&L"
            value={`$${stats.totalPnl.toFixed(2)}`}
          />
        </section>

        {loading && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
            Loading journal history...
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-5">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-black">
                        {entry.symbol}
                      </div>

                      <div
                        className={
                          entry.trade_side === 'long'
                            ? 'rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-black uppercase text-emerald-300'
                            : 'rounded-full bg-red-400/20 px-3 py-1 text-xs font-black uppercase text-red-300'
                        }
                      >
                        {entry.trade_side}
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-slate-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </div>

                    {entry.emotional_state && (
                      <div className="mt-4">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Emotional State
                        </div>

                        <div className="mt-1 text-sm text-slate-300">
                          {entry.emotional_state}
                        </div>
                      </div>
                    )}

                    {entry.lesson && (
                      <div className="mt-4">
                        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Lesson
                        </div>

                        <div className="mt-1 text-sm leading-6 text-slate-300">
                          {entry.lesson}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:min-w-[220px]">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Trade P&L
                      </div>

                      <div
                        className={
                          (entry.pnl ?? 0) >= 0
                            ? 'mt-2 text-4xl font-black text-emerald-300'
                            : 'mt-2 text-4xl font-black text-red-300'
                        }
                      >
                        ${(entry.pnl ?? 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {entry.notes && (
                  <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="text-xs font-bold uppercase tracking-wide text-yellow-300">
                      System Notes
                    </div>

                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                      {entry.notes}
                    </pre>
                  </div>
                )}
              </article>
            ))}

            {entries.length === 0 && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-500">
                No journal entries yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-sm text-slate-500">{label}</div>

      <div className="mt-2 text-4xl font-black">
        {value}
      </div>
    </div>
  );
}