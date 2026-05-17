'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

type ChecklistItem = {
  id: string;
  title: string;
  category: string;
  sort_order: number;
  is_required: boolean;
  is_active: boolean;
};

type CompletionRow = {
  checklist_item_id: string;
};

export default function CoachChecklistPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const completedCount = completedIds.size;
  const totalCount = items.length;
  const completionPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const premarketItems = useMemo(
    () => items.filter((item) => item.category === 'premarket'),
    [items],
  );

  const executionItems = useMemo(
    () => items.filter((item) => item.category === 'execution'),
    [items],
  );

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    setLoading(true);
    setError('');

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      router.push('/auth/login');
      return;
    }

    setUserId(session.user.id);

    const { data: checklistRows, error: checklistError } = await supabase
      .from('trader_checklist_items')
      .select('id,title,category,sort_order,is_required,is_active')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (checklistError) {
      setError(checklistError.message);
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    const { data: completionRows, error: completionError } = await supabase
      .from('trader_checklist_completions')
      .select('checklist_item_id')
      .eq('user_id', session.user.id)
      .eq('completed_date', today);

    if (completionError) {
      setError(completionError.message);
      setLoading(false);
      return;
    }

    setItems((checklistRows ?? []) as ChecklistItem[]);

    const completed = new Set(
      ((completionRows ?? []) as CompletionRow[]).map((row) => row.checklist_item_id),
    );

    setCompletedIds(completed);
    setLoading(false);
  };

  const toggleItem = async (itemId: string) => {
    if (!userId) return;

    const today = new Date().toISOString().slice(0, 10);
    const nextCompleted = new Set(completedIds);
    const isCompleted = nextCompleted.has(itemId);

    if (isCompleted) {
      nextCompleted.delete(itemId);
      setCompletedIds(nextCompleted);

      const { error: deleteError } = await supabase
        .from('trader_checklist_completions')
        .delete()
        .eq('user_id', userId)
        .eq('checklist_item_id', itemId)
        .eq('completed_date', today);

      if (deleteError) {
        setError(deleteError.message);
        loadChecklist();
      }

      return;
    }

    nextCompleted.add(itemId);
    setCompletedIds(nextCompleted);

    const { error: insertError } = await supabase
      .from('trader_checklist_completions')
      .insert({
        user_id: userId,
        checklist_item_id: itemId,
        completed_date: today,
      });

    if (insertError) {
      setError(insertError.message);
      loadChecklist();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-slate-400">Loading coach checklist...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">Trader Coach</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Daily Execution Checklist
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Your sideline coach before the trade. Complete the required checks before
              pressing the button.
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
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-slate-500">Checklist Score</div>
            <div className="mt-2 text-5xl font-black text-emerald-300">
              {completionPct}%
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {completedCount} of {totalCount} checks complete today.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-slate-500">Coach Status</div>
            <div className="mt-2 text-2xl font-black">
              {completionPct === 100 ? 'Cleared to execute' : 'Stay disciplined'}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {completionPct === 100
                ? 'All required checks are complete.'
                : 'Do not let urgency replace process.'}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <div className="text-sm text-slate-500">Rule Pressure</div>
            <div className="mt-2 text-2xl font-black text-yellow-300">
              {completionPct < 100 ? 'Active' : 'Controlled'}
            </div>
            <p className="mt-3 text-sm text-slate-400">
              The coach layer exists to stop rushed, emotional, low-quality entries.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ChecklistGroup
            title="Premarket Discipline"
            description="Context checks before looking for execution."
            items={premarketItems}
            completedIds={completedIds}
            onToggle={toggleItem}
          />

          <ChecklistGroup
            title="Execution Discipline"
            description="Rules that protect the next trade."
            items={executionItems}
            completedIds={completedIds}
            onToggle={toggleItem}
          />
        </section>
      </div>
    </main>
  );
}

function ChecklistGroup({
  title,
  description,
  items,
  completedIds,
  onToggle,
}: {
  title: string;
  description: string;
  items: ChecklistItem[];
  completedIds: Set<string>;
  onToggle: (itemId: string) => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm text-slate-400">{description}</p>

      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const completed = completedIds.has(item.id);

          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className="flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left hover:border-emerald-400/40"
            >
              <div
                className={
                  completed
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950'
                    : 'h-7 w-7 rounded-full border border-slate-600'
                }
              >
                {completed ? '✓' : ''}
              </div>

              <div className="flex-1">
                <div className="font-bold text-white">{item.title}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {item.category} {item.is_required ? '• required' : ''}
                </div>
              </div>
            </button>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-500">
            No checklist items in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}