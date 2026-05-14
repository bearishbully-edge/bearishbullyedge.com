// components/backtest/ComparisonResults.tsx
'use client';

import React, { useState } from 'react';
import type { ComparisonEngineOutput } from '../../lib/backtest/compareEngines';

interface Props {
  data: ComparisonEngineOutput | null;
}

export default function ComparisonResults({ data }: Props) {
  const [showRaw, setShowRaw] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  if (!data) {
    return (
      <div className="text-center text-gray-400 text-sm">
        No comparison results yet.
      </div>
    );
  }

  const matchScore = getMatchScore(data);
  const scoreColor =
    matchScore >= 90
      ? 'text-green-400'
      : matchScore >= 70
      ? 'text-yellow-300'
      : 'text-red-400';

  return (
    <div className="space-y-6">
      {/* TOP SUMMARY + SCORE METER */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              🧪 Engine Comparison Results
            </h3>
            <p className="text-xs text-gray-400">
              Comparing live SignalAggregator vs offline BacktestEngine for the same candles.
            </p>
          </div>

          {/* Match Score Meter */}
          <div className="w-full md:w-64">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-gray-300 uppercase tracking-wide">
                Engine Match Score
              </span>
              <span className={`text-lg font-bold ${scoreColor}`}>
                {matchScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
              <div
                className={`h-full ${
                  matchScore >= 90
                    ? 'bg-green-500'
                    : matchScore >= 70
                    ? 'bg-yellow-400'
                    : 'bg-red-500'
                }`}
                style={{ width: `${matchScore}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              100% = perfect 1:1 alignment between live and backtest engines.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <SummaryCard
            label="Matched Signals"
            value={data.matchingCount}
            color="text-green-400"
          />
          <SummaryCard
            label="Mismatched"
            value={data.mismatchingCount}
            color="text-red-400"
          />
          <SummaryCard
            label="Live Engine Only"
            value={data.missedSignals}
            color="text-yellow-400"
          />
          <SummaryCard
            label="Backtest Only"
            value={data.extraSignals}
            color="text-blue-400"
          />
        </div>

        {/* Bullet Summary */}
        <ul className="mt-4 space-y-1 text-xs text-gray-400">
          {data.summary.map((s, i) => (
            <li key={i}>• {s}</li>
          ))}
        </ul>
      </div>

      {/* TOGGLES */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => setShowHeatmap((v) => !v)}
          className={`px-3 py-1 rounded border ${
            showHeatmap
              ? 'bg-purple-700 border-purple-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-200'
          }`}
        >
          {showHeatmap ? 'Hide Mismatch Heatmap' : 'Show Mismatch Heatmap'}
        </button>

        <button
          onClick={() => setShowTimeline((v) => !v)}
          className={`px-3 py-1 rounded border ${
            showTimeline
              ? 'bg-blue-700 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-200'
          }`}
        >
          {showTimeline ? 'Hide Sync Timeline' : 'Show Sync Timeline'}
        </button>

        <button
          onClick={() => setShowRaw((v) => !v)}
          className={`px-3 py-1 rounded border ${
            showRaw
              ? 'bg-gray-700 border-gray-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-200'
          }`}
        >
          {showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}
        </button>
      </div>

      {/* SYNC TIMELINE VIEW */}
      {showTimeline && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            ⏱ Sync Timeline – Live vs Backtest
          </h3>
          <SyncTimeline data={data} />
        </div>
      )}

      {/* MATCHED / MISMATCHED TABLE */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">
          Signal Timestamp Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-gray-300 border-collapse">
            <thead className="text-gray-400 border-b border-gray-700">
              <tr>
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Live: Side</th>
                <th className="p-2 text-left">Live: Timestamp</th>
                <th className="p-2 text-left">Backtest: Side</th>
                <th className="p-2 text-left">Backtest: Timestamp</th>
                <th className="p-2 text-left">Match?</th>
              </tr>
            </thead>
            <tbody>{renderSignalRows(data)}</tbody>
          </table>
        </div>
      </div>

      {/* HEATMAP */}
      {showHeatmap && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-xs">
          <h3 className="text-lg font-semibold text-white mb-3">
            🔥 Mismatch Heatmap
          </h3>
          <Heatmap data={data} />
          <p className="text-[10px] text-gray-500 mt-2">
            Green = match • Red = mismatch • Yellow = live-only • Blue = backtest-only
          </p>
        </div>
      )}

      {/* RAW JSON */}
      {showRaw && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-xs">
          <pre className="mt-1 whitespace-pre-wrap text-gray-300 bg-black/30 p-3 rounded border border-gray-700">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------------

// Score: how aligned are both engines overall?
function getMatchScore(data: ComparisonEngineOutput): number {
  const total = data.liveSignals.length + data.backtestTrades.length;
  if (!total) return 0;
  const aligned = data.matchingCount * 2; // each match = 2 aligned events
  return Math.round((aligned / total) * 100);
}

// Summary stat card
function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-1 uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}

// Row render for table
function renderSignalRows(data: ComparisonEngineOutput) {
  const live = data.liveSignals;
  const bt = data.backtestTrades;
  const max = Math.max(live.length, bt.length);
  const rows = [];

  for (let i = 0; i < max; i++) {
    const ls = live[i];
    const bs = bt[i];

    const lsTs = ls?.timestamp ?? null;
    const bsTs = bs?.openedAt ?? null;
    const lsSide = ls?.side ?? '-';
    const bsSide = bs?.side ?? '-';

    const match =
      ls &&
      bs &&
      lsSide === bsSide &&
      Math.abs(lsTs - bsTs) <= 1000;

    rows.push(
      <tr
        key={i}
        className={match ? 'bg-green-900/10' : 'bg-red-900/10'}
      >
        <td className="p-2 text-gray-400">{i + 1}</td>
        <td className="p-2">{lsSide}</td>
        <td className="p-2">{lsTs ?? '-'}</td>
        <td className="p-2">{bsSide}</td>
        <td className="p-2">{bsTs ?? '-'}</td>
        <td className="p-2 font-semibold">
          {match ? (
            <span className="text-green-400">MATCH</span>
          ) : (
            <span className="text-red-400">DIFF</span>
          )}
        </td>
      </tr>
    );
  }

  return rows;
}

// ------------------------------------------------------------------
// HEATMAP COMPONENT
// ------------------------------------------------------------------
function Heatmap({ data }: { data: ComparisonEngineOutput }) {
  const live = data.liveSignals;
  const bt = data.backtestTrades;
  const max = Math.max(live.length, bt.length);

  const cells = [];

  for (let i = 0; i < max; i++) {
    const ls = live[i];
    const bs = bt[i];

    const lsTs = ls?.timestamp ?? null;
    const bsTs = bs?.openedAt ?? null;
    const lsSide = ls?.side ?? null;
    const bsSide = bs?.side ?? null;

    let colorClass = 'bg-gray-700';
    let title = `Row ${i + 1}`;

    const match =
      ls &&
      bs &&
      lsSide === bsSide &&
      Math.abs(lsTs - bsTs) <= 1000;

    if (match) {
      colorClass = 'bg-green-500';
      title = `Match: ${lsSide} / ts≈${lsTs}`;
    } else if (ls && !bs) {
      colorClass = 'bg-yellow-400';
      title = `Live only: ${lsSide} / ts=${lsTs}`;
    } else if (!ls && bs) {
      colorClass = 'bg-blue-400';
      title = `Backtest only: ${bsSide} / ts=${bsTs}`;
    } else if (ls && bs) {
      colorClass = 'bg-red-500';
      title = `Mismatch: live=${lsSide}, backtest=${bsSide}`;
    }

    cells.push(
      <div
        key={i}
        className={`w-4 h-4 ${colorClass} rounded-sm`}
        title={title}
      />
    );
  }

  if (!cells.length) {
    return (
      <div className="text-xs text-gray-400">
        No signals/trades to visualize yet.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-full">
      {cells}
    </div>
  );
}

// ------------------------------------------------------------------
// SYNC TIMELINE COMPONENT
// ------------------------------------------------------------------
function SyncTimeline({ data }: { data: ComparisonEngineOutput }) {
  const live = data.liveSignals;
  const bt = data.backtestTrades;

  const liveTs = live.map((s) => s.timestamp);
  const btTs = bt.map((t) => t.openedAt);
  const allTs = [...liveTs, ...btTs].filter((x) => typeof x === 'number');

  if (!allTs.length) {
    return (
      <div className="text-xs text-gray-400">
        No timestamps available to plot.
      </div>
    );
  }

  const minTs = Math.min(...allTs);
  const maxTs = Math.max(...allTs) || minTs + 1;
  const span = maxTs - minTs || 1;

  const normalize = (ts: number) =>
    ((ts - minTs) / span) * 100;

  return (
    <div className="space-y-4">
      {/* Live row */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-gray-300 uppercase tracking-wide">
            Live Engine Signals
          </span>
          <span className="text-[10px] text-gray-500">
            {live.length} events
          </span>
        </div>
        <div className="relative h-8 bg-gray-900 border border-gray-700 rounded overflow-hidden">
          {live.map((s, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 w-[2px] bg-emerald-400"
              style={{ left: `${normalize(s.timestamp)}%` }}
              title={`Live ${s.side} @ ${s.timestamp}`}
            />
          ))}
        </div>
      </div>

      {/* Backtest row */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-gray-300 uppercase tracking-wide">
            Backtest Trades
          </span>
          <span className="text-[10px] text-gray-500">
            {bt.length} events
          </span>
        </div>
        <div className="relative h-8 bg-gray-900 border border-gray-700 rounded overflow-hidden">
          {bt.map((t, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 w-[2px] bg-sky-400"
              style={{ left: `${normalize(t.openedAt)}%` }}
              title={`BT ${t.side} @ ${t.openedAt}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-gray-500">
        <span>First event: {minTs}</span>
        <span>Last event: {maxTs}</span>
      </div>
    </div>
  );
}
