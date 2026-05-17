'use client';

import { useMemo, useState } from 'react';

type TradeSide = 'long' | 'short';
type TradeTag =
  | 'Mean Reversion'
  | 'Trend Continuation'
  | 'Compression Breakout'
  | 'Liquidity Sweep'
  | 'News Trade'
  | 'A+ Setup'
  | 'FOMO'
  | 'Revenge Trade';

type JournalForm = {
  symbol: string;
  tradeSide: TradeSide;
  setupName: string;
  entryPrice: string;
  stopPrice: string;
  targetPrice: string;
  exitPrice: string;
  pnl: string;
  biasAligned: boolean;
  volatilityFavorable: boolean;
  liquidityMapped: boolean;
  economicRiskHandled: boolean;
  checklistComplete: boolean;
  riskRewardDefined: boolean;
  emotionalState: string;
  lesson: string;
  notes: string;
  tags: TradeTag[];
};

const TRADE_TAGS: TradeTag[] = [
  'Mean Reversion',
  'Trend Continuation',
  'Compression Breakout',
  'Liquidity Sweep',
  'News Trade',
  'A+ Setup',
  'FOMO',
  'Revenge Trade',
];

function calculateScore(form: JournalForm): number {
  let score = 0;

  if (form.biasAligned) score += 20;
  if (form.volatilityFavorable) score += 20;
  if (form.liquidityMapped) score += 20;
  if (form.economicRiskHandled) score += 15;
  if (form.checklistComplete) score += 15;
  if (form.riskRewardDefined) score += 10;

  if (form.tags.includes('FOMO')) score -= 10;
  if (form.tags.includes('Revenge Trade')) score -= 20;

  return Math.max(0, Math.min(100, score));
}

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

function coachNoteFromScore(score: number): string {
  if (score >= 90) return 'Elite setup quality. Process was aligned before execution.';
  if (score >= 80) return 'Strong setup. Stay disciplined and review execution quality.';
  if (score >= 70) return 'Tradable, but not elite. Identify what kept this from being A-grade.';
  if (score >= 60) return 'Lower quality environment. Reduce size or wait for cleaner confirmation.';
  return 'Coach warning: this trade lacked enough confirmation. Review before taking another setup.';
}

export default function JournalPage() {
  const [form, setForm] = useState<JournalForm>({
    symbol: 'QQQ',
    tradeSide: 'long',
    setupName: '',
    entryPrice: '',
    stopPrice: '',
    targetPrice: '',
    exitPrice: '',
    pnl: '',
    biasAligned: false,
    volatilityFavorable: false,
    liquidityMapped: false,
    economicRiskHandled: false,
    checklistComplete: false,
    riskRewardDefined: false,
    emotionalState: '',
    lesson: '',
    notes: '',
    tags: [],
  });

  const score = useMemo(() => calculateScore(form), [form]);
  const grade = gradeFromScore(score);
  const coachNote = coachNoteFromScore(score);

  const toggleTag = (tag: TradeTag) => {
    setForm((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((item) => item !== tag)
        : [...current.tags, tag],
    }));
  };

  const updateBoolean = (key: keyof JournalForm) => {
    setForm((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">Trader Journal</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">
              Decision Intelligence Archive
            </h1>
            <p className="mt-3 max-w-3xl text-slate-400">
              Capture the trade, score the setup objectively, and document the lesson.
              The trader explains emotion. The platform grades the process.
            </p>
          </div>

          <a
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Back to Terminal
          </a>
        </div>

        <section className="mb-8 grid gap-5 md:grid-cols-4">
          <ScoreCard label="Confidence Score" value={`${score}%`} />
          <ScoreCard label="Setup Grade" value={grade} />
          <ScoreCard label="Environment" value={score >= 80 ? 'Favorable' : score >= 60 ? 'Mixed' : 'Poor'} />
          <ScoreCard label="Coach Status" value={score >= 80 ? 'Clear' : 'Review'} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Trade Details">
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Symbol" value={form.symbol} onChange={(value) => setForm({ ...form, symbol: value.toUpperCase() })} />
                <Select
                  label="Side"
                  value={form.tradeSide}
                  options={['long', 'short']}
                  onChange={(value) => setForm({ ...form, tradeSide: value as TradeSide })}
                />
                <Input label="Setup Name" value={form.setupName} onChange={(value) => setForm({ ...form, setupName: value })} />
                <Input label="Entry Price" value={form.entryPrice} onChange={(value) => setForm({ ...form, entryPrice: value })} />
                <Input label="Stop Price" value={form.stopPrice} onChange={(value) => setForm({ ...form, stopPrice: value })} />
                <Input label="Target Price" value={form.targetPrice} onChange={(value) => setForm({ ...form, targetPrice: value })} />
                <Input label="Exit Price" value={form.exitPrice} onChange={(value) => setForm({ ...form, exitPrice: value })} />
                <Input label="PnL" value={form.pnl} onChange={(value) => setForm({ ...form, pnl: value })} />
              </div>
            </Panel>

            <Panel title="System Context Checks">
              <div className="grid gap-3 md:grid-cols-2">
                <CheckRow label="Bias aligned" checked={form.biasAligned} onClick={() => updateBoolean('biasAligned')} />
                <CheckRow label="Volatility favorable" checked={form.volatilityFavorable} onClick={() => updateBoolean('volatilityFavorable')} />
                <CheckRow label="Liquidity mapped" checked={form.liquidityMapped} onClick={() => updateBoolean('liquidityMapped')} />
                <CheckRow label="Economic risk handled" checked={form.economicRiskHandled} onClick={() => updateBoolean('economicRiskHandled')} />
                <CheckRow label="Checklist complete" checked={form.checklistComplete} onClick={() => updateBoolean('checklistComplete')} />
                <CheckRow label="Risk/reward defined" checked={form.riskRewardDefined} onClick={() => updateBoolean('riskRewardDefined')} />
              </div>
            </Panel>

            <Panel title="Tags">
              <div className="flex flex-wrap gap-3">
                {TRADE_TAGS.map((tag) => {
                  const active = form.tags.includes(tag);

                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={
                        active
                          ? 'rounded-full bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950'
                          : 'rounded-full border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300 hover:border-emerald-400'
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Trader Reflection">
              <div className="space-y-4">
                <Input
                  label="Emotional State"
                  value={form.emotionalState}
                  onChange={(value) => setForm({ ...form, emotionalState: value })}
                />
                <TextArea
                  label="Lesson"
                  value={form.lesson}
                  onChange={(value) => setForm({ ...form, lesson: value })}
                />
                <TextArea
                  label="Notes"
                  value={form.notes}
                  onChange={(value) => setForm({ ...form, notes: value })}
                />
              </div>
            </Panel>
          </div>

          <aside className="space-y-6">
            <Panel title="Coach Evaluation">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="text-sm text-slate-500">System Grade</div>
                <div className="mt-2 text-6xl font-black text-emerald-300">
                  {grade}
                </div>
                <div className="mt-3 text-sm text-slate-400">
                  {score}% confidence score
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <div className="text-sm font-bold text-yellow-300">Coach Note</div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {coachNote}
                </p>
              </div>

              <button className="mt-5 w-full rounded-xl bg-emerald-400 px-6 py-4 font-black text-slate-950 hover:bg-emerald-300">
                Save Journal Draft
              </button>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                MVP note: this screen is ready for auto-captured trades. Next step is wiring
                saves to Supabase and auto-drafting from paper/live executions.
              </p>
            </Panel>
          </aside>
        </section>
      </div>
    </main>
  );
}

function ScoreCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <h2 className="mb-5 text-2xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-300">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400"
      />
    </label>
  );
}

function CheckRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left hover:border-emerald-400/40"
    >
      <div
        className={
          checked
            ? 'flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950'
            : 'h-7 w-7 rounded-full border border-slate-600'
        }
      >
        {checked ? '✓' : ''}
      </div>

      <span className="font-bold text-white">{label}</span>
    </button>
  );
}