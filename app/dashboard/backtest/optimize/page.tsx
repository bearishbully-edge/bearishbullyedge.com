'use client';

import React, { useState } from 'react';
import UploadCSV from '@/components/backtest/UploadCSV';

type Range = {
  min: number;
  max: number;
  step: number;
};

type IndicatorRangeConfig = {
  enabled: boolean;
  weight: Range;
  threshold?: Range;
};

export default function OptimizePage() {
  const [candles, setCandles] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<
    'idle' | 'paper' | 'compare' | 'optimize' | 'shadow' | 'ready'
  >('idle');

  /* ---------------------------------------------
   MODE 5 PARAMETER DEFINITIONS
  --------------------------------------------- */

  const [coreRanges, setCoreRanges] = useState({
    trade_threshold: { min: 0.35, max: 0.6, step: 0.02 },
    confidence_threshold: { min: 0.45, max: 0.7, step: 0.02 },
    stopLossPct: { min: 0.003, max: 0.015, step: 0.001 },
    takeProfitPct: { min: 0.006, max: 0.03, step: 0.002 },
  });

  const [indicatorRanges, setIndicatorRanges] = useState<Record<
    string,
    IndicatorRangeConfig
  >>({
    bias: {
      enabled: true,
      weight: { min: 0.2, max: 0.4, step: 0.05 },
    },
    delta: {
      enabled: true,
      weight: { min: 0.15, max: 0.35, step: 0.05 },
      threshold: { min: 500, max: 3000, step: 250 },
    },
    cot: {
      enabled: true,
      weight: { min: 0.1, max: 0.3, step: 0.05 },
    },
    orderflow: {
      enabled: true,
      weight: { min: 0.1, max: 0.25, step: 0.05 },
      threshold: { min: 300, max: 1200, step: 100 },
    },
    econ: {
      enabled: false,
      weight: { min: 0.05, max: 0.15, step: 0.05 },
    },
  });

  /* ---------------------------------------------
   RUN OPTIMIZATION (ENGINE HOOK LATER)
  --------------------------------------------- */

  const runOptimization = async () => {
    if (!candles.length) return;
    setRunning(true);
    setStage('paper');

    // Placeholder stages — engines plug in later
    setTimeout(() => setStage('compare'), 600);
    setTimeout(() => setStage('optimize'), 1200);
    setTimeout(() => setStage('shadow'), 1800);
    setTimeout(() => {
      setStage('ready');
      setRunning(false);
    }, 2400);
  };

  /* ---------------------------------------------
   UI
  --------------------------------------------- */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h1 className="text-xl font-bold text-white">
          🧠 Mode 5 — Strategy Optimizer
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Indicator-level optimization • Drift analysis • Strategy promotion
        </p>
      </div>

      {/* DATA INPUT */}
      <Section title="1️⃣ Load Historical Data">
        <UploadCSV onDataLoaded={setCandles} />
        <p className="text-[11px] text-gray-400 mt-2">
          {candles.length
            ? `${candles.length} candles loaded`
            : 'No data loaded'}
        </p>
      </Section>

      {/* CORE PARAMETER SEARCH */}
      <Section title="2️⃣ Core Strategy Search Ranges">
        <Grid>
          {Object.entries(coreRanges).map(([k, v]) => (
            <RangeEditor key={k} label={k} range={v} />
          ))}
        </Grid>
      </Section>

      {/* INDICATOR OPTIMIZATION */}
      <Section title="3️⃣ Indicator-Level Optimization">
        <div className="space-y-4">
          {Object.entries(indicatorRanges).map(([name, cfg]) => (
            <div
              key={name}
              className="bg-gray-900 border border-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">
                  {name.toUpperCase()}
                </h4>
                <span
                  className={`text-xs ${
                    cfg.enabled ? 'text-green-400' : 'text-gray-500'
                  }`}
                >
                  {cfg.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <Grid>
                <RangeEditor label="Weight" range={cfg.weight} />
                {cfg.threshold && (
                  <RangeEditor label="Threshold" range={cfg.threshold} />
                )}
              </Grid>
            </div>
          ))}
        </div>
      </Section>

      {/* PROMOTION PIPELINE */}
      <Section title="4️⃣ Strategy Promotion Pipeline">
        <Pipeline stage={stage} />

        <button
          onClick={runOptimization}
          disabled={!candles.length || running}
          className="w-full mt-4 py-2 rounded bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-xs font-semibold text-white"
        >
          {running ? 'Optimizing…' : 'Run Mode 5 Optimization'}
        </button>

        {stage === 'ready' && (
          <button className="w-full mt-3 py-2 rounded bg-green-600 hover:bg-green-700 text-xs font-semibold text-white">
            🚀 Promote Strategy to Shadow Trading
          </button>
        )}
      </Section>
    </div>
  );
}

/* ============================================================
  COMPONENTS
============================================================ */

function Section({ title, children }: any) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {children}
    </div>
  );
}

function RangeEditor({
  label,
  range,
}: {
  label: string;
  range: Range;
}) {
  return (
    <div>
      <label className="block text-[11px] text-gray-400 mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <Input value={range.min} />
        <Input value={range.max} />
        <Input value={range.step} />
      </div>
    </div>
  );
}

function Input({ value }: { value: number }) {
  return (
    <input
      type="number"
      defaultValue={value}
      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200"
    />
  );
}

function Pipeline({ stage }: { stage: string }) {
  const steps = ['paper', 'compare', 'optimize', 'shadow', 'ready'];

  return (
    <div className="flex justify-between text-xs mt-2">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`px-3 py-1 rounded ${
            steps.indexOf(stage) >= i
              ? 'bg-green-700 text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {s.toUpperCase()}
        </div>
      ))}
    </div>
  );
}
