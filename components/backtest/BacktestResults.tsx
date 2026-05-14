// components/backtest/BacktestResults.tsx
'use client';

import React from 'react';
import type { BacktestResult } from '../../lib/backtest/types';

interface BacktestResultsProps {
  result: BacktestResult | null;
}

export default function BacktestResults({ result }: BacktestResultsProps) {
  if (!result) {
    return (
      <div className="border border-dashed border-gray-700 rounded-lg p-4 text-xs text-gray-500">
        No backtest results yet. Load data, pick a strategy, and click
        <span className="font-semibold"> Run Backtest</span>.
      </div>
    );
  }

  const m = result.metrics;
  const realized = result.trades.filter((t) => t.status === 'closed');

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            📊 Backtest Results – {result.strategyId.toUpperCase()}
          </h3>
          <p className="text-[11px] text-gray-500">
            {result.trades.length} trades · {result.candles.length} candles ·
            Run in {(result.durationMs / 1000).toFixed(2)}s
          </p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <div>
            Start: $
            {m.startingEquity.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
          <div>
            End: $
            {m.endingEquity.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <MetricCard
          label="Net P&L"
          value={`$${m.netPnl.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })}`}
          accent={m.netPnl >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <MetricCard
          label="Max Drawdown"
          value={`$${m.maxDrawdown.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          })} (${m.maxDrawdownPct.toFixed(1)}%)`}
          accent="text-red-400"
        />
        <MetricCard
          label="Win Rate"
          value={`${m.winRate.toFixed(1)}%`}
          accent={m.winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}
        />
        <MetricCard
          label="Profit Factor"
          value={m.profitFactor === Infinity ? '∞' : m.profitFactor.toFixed(2)}
          accent={m.profitFactor >= 1.5 ? 'text-green-400' : 'text-yellow-400'}
        />
      </div>

      {/* Trade Summary */}
      <div className="bg-gray-800/70 rounded-lg p-3 text-[11px] text-gray-300">
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="text-gray-500">Total Trades:</span>{' '}
            <span className="font-semibold">{m.totalTrades}</span>
          </div>
          <div>
            <span className="text-gray-500">Realized Trades:</span>{' '}
            <span className="font-semibold">{realized.length}</span>
          </div>
          <div>
            <span className="text-gray-500">Avg R / Trade:</span>{' '}
            <span className="font-semibold">{m.avgR.toFixed(2)}R</span>
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Recent Trades</span>
          <span className="text-[10px] text-gray-500">
            Showing last {Math.min(realized.length, 10)} of {realized.length}
          </span>
        </div>
        {realized.length === 0 ? (
          <div className="border border-dashed border-gray-700 rounded p-2 text-[11px] text-gray-500">
            No closed trades yet in this backtest.
          </div>
        ) : (
          <div className="max-h-40 overflow-y-auto space-y-1">
            {realized
              .slice(-10)
              .reverse()
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between bg-gray-900/70 rounded px-2 py-1 text-[11px]"
                >
                  <div>
                    <div
                      className={
                        t.side === 'long'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }
                    >
                      {t.side.toUpperCase()} {t.signal.market}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Entry {t.entryPrice.toFixed(2)} →{' '}
                      {t.exitPrice?.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={
                        (t.pnl ?? 0) >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }
                    >
                      {t.pnl && t.pnl >= 0 ? '+' : ''}
                      {t.pnl?.toFixed(2)} $
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Size {t.sizeUsd.toFixed(0)}$
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-gray-900/70 rounded p-2">
      <div className="text-gray-500 text-[11px]">{label}</div>
      <div className={`text-gray-100 font-semibold ${accent || ''}`}>
        {value}
      </div>
    </div>
  );
}
