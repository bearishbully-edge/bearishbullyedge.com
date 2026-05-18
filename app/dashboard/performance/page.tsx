'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';

type JournalEntry = {
  id: string;
  pnl: number | null;
  notes: string | null;
};

type ChecklistCompletion = {
  id: string;
};

export default function PerformancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [checklistCompletions, setChecklistCompletions] = useState<
    ChecklistCompletion[]
  >([]);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
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

    const { data: journalData, error: journalError } = await supabase
      .from('trade_journal_entries')
      .select(`
        id,
        pnl,
        notes
      `)
      .eq('user_id', session.user.id);

    if (journalError) {
      setError(journalError.message);
      setLoading(false);
      return;
    }

    const { data: checklistData, error: checklistError } = await supabase
      .from('trader_checklist_completions')
      .select('id')
      .eq('user_id', session.user.id);

    if (checklistError) {
      setError(checklistError.message);
      setLoading(false);
      return;
    }

    setJournalEntries((journalData ?? []) as JournalEntry[]);
    setChecklistCompletions(
      (checklistData ?? []) as ChecklistCompletion[],
    );

    setLoading(false);
  };

  const analytics = useMemo(() => {
    const totalTrades = journalEntries.length;

    const totalPnl = journalEntries.reduce(
      (sum, entry) => sum + (entry.pnl ?? 0),
      0,
    );

    const wins = journalEntries.filter(
      (entry) => (entry.pnl ?? 0) > 0,
    ).length;

    const winRate =
      totalTrades === 0
        ? 0
        : Math.round((wins / totalTrades) * 100);

    const revengeTrades = journalEntries.filter((entry) =>
      entry.notes?.toLowerCase().includes('revenge trade'),
    ).length;

    const fomoTrades = journalEntries.filter((entry) =>
      entry.notes?.toLowerCase().includes('fomo'),
    ).length;

    const checklistCount = checklistCompletions.length;

    let disciplineScore = 0;

    if (checklistCount >= 5) disciplineScore += 25;
    if (totalTrades >= 1) disciplineScore += 20;
    if (revengeTrades === 0) disciplineScore += 20;
    if (fomoTrades === 0) disciplineScore += 15;
    if (winRate >= 50) disciplineScore += 10;
    if (totalTrades >= 3) disciplineScore += 10;

    disciplineScore = Math.min(100, disciplineScore);

    let disciplineGrade = 'D';

    if (disciplineScore >= 90) disciplineGrade = 'A+';
    else if (disciplineScore >= 80) disciplineGrade = 'A';
    else if (disciplineScore >= 70) disciplineGrade = 'B';
    else if (disciplineScore >= 60) disciplineGrade = 'C';

    return {
      totalTrades,
      totalPnl,
      winRate,
      revengeTrades,
      fomoTrades,
      checklistCount,
      disciplineScore,
      disciplineGrade,
    };
  }, [journalEntries, checklistCompletions]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading performance engine...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">
              Performance Intelligence
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Trader Discipline Dashboard
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Behavioral analytics for consistency, execution quality,
              and discipline tracking.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Back to Terminal
          </a>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-5 md:grid-cols-4">
          <StatCard
            label="Discipline Score"
            value={`${analytics.disciplineScore}%`}
            highlight
          />

          <StatCard
            label="Discipline Grade"
            value={analytics.disciplineGrade}
          />

          <StatCard
            label="Win Rate"
            value={`${analytics.winRate}%`}
          />

          <StatCard
            label="Net P&L"
            value={`$${analytics.totalPnl.toFixed(2)}`}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Execution Metrics">
            <MetricRow
              label="Total Trades"
              value={String(analytics.totalTrades)}
            />

            <MetricRow
              label="Checklist Completions"
              value={String(analytics.checklistCount)}
            />

            <MetricRow
              label="Revenge Trades"
              value={String(analytics.revengeTrades)}
              danger={analytics.revengeTrades > 0}
            />

            <MetricRow
              label="FOMO Trades"
              value={String(analytics.fomoTrades)}
              danger={analytics.fomoTrades > 0}
            />
          </Panel>

          <Panel title="Coach Evaluation">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <div className="text-sm font-bold uppercase tracking-wide text-yellow-300">
                Coach Notes
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {analytics.disciplineScore >= 90 &&
                  'Elite discipline profile. Current execution behavior is highly controlled.'}

                {analytics.disciplineScore >= 70 &&
                  analytics.disciplineScore < 90 &&
                  'Good structure overall. Continue improving consistency and emotional control.'}

                {analytics.disciplineScore >= 50 &&
                  analytics.disciplineScore < 70 &&
                  'Discipline instability detected. Reduce low-quality entries and tighten execution process.'}

                {analytics.disciplineScore < 50 &&
                  'Behavioral degradation detected. Pause aggressive trading and review checklist adherence.'}
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <div className="text-sm font-bold uppercase tracking-wide text-emerald-300">
                System Direction
              </div>

              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>• Increase A-quality setup frequency</li>
                <li>• Avoid emotional entries during volatility compression</li>
                <li>• Continue checklist enforcement before execution</li>
                <li>• Review recurring behavioral mistakes weekly</li>
              </ul>
            </div>
          </Panel>
        </section>
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

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="mb-5 text-2xl font-black">{title}</h2>

      {children}
    </div>
  );
}

function MetricRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 py-4 last:border-b-0">
      <div className="text-sm font-bold text-slate-400">
        {label}
      </div>

      <div
        className={
          danger
            ? 'text-lg font-black text-red-300'
            : 'text-lg font-black text-white'
        }
      >
        {value}
      </div>
    </div>
  );
}