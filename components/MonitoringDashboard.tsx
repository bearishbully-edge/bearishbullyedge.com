// components/MonitoringDashboard.tsx
// @ts-nocheck
'use client';

import React from 'react';
import { useGlobalState } from '../lib/automation/globalState';

export default function MonitoringDashboard() {
  const signals = useGlobalState((s) => s.signals);
  const aggregatorStatus = useGlobalState((s) => s.aggregatorStatus);
  const executorStats = useGlobalState((s) => s.executorStats);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-200">
        📊 Monitoring Dashboard
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-gray-800/70 rounded p-2">
          <div className="text-gray-500">Engine</div>
          <div className="text-gray-100 font-semibold">
            {aggregatorStatus?.enabled ? 'Active' : 'Idle'}
          </div>
        </div>
        <div className="bg-gray-800/70 rounded p-2">
          <div className="text-gray-500">Current Score</div>
          <div className="text-gray-100 font-semibold">
            {aggregatorStatus
              ? `${(aggregatorStatus.currentScore * 100).toFixed(1)}%`
              : '0.0%'}
          </div>
        </div>
        <div className="bg-gray-800/70 rounded p-2">
          <div className="text-gray-500">Open Positions</div>
          <div className="text-gray-100 font-semibold">
            {executorStats?.openPositions || 0}
          </div>
        </div>
        <div className="bg-gray-800/70 rounded p-2">
          <div className="text-gray-500">Daily Trades</div>
          <div className="text-gray-100 font-semibold">
            {executorStats?.dailyTrades || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-800/70 rounded p-2">
          <div className="text-gray-500">Realized P&L</div>
          <div
            className={
              (executorStats?.pnl || 0) >= 0
                ? 'text-green-400 font-semibold'
                : 'text-red-400 font-semibold'
            }
          >
            ${ (executorStats?.pnl || 0).toFixed(2) }
          </div>
        </div>
        <div className="bg-gray-800/70 rounded p-2">
          <div className="text-gray-500">Capital In Use</div>
          <div className="text-gray-100 font-semibold">
            ${ (executorStats?.capitalUsed || 0).toFixed(2) }
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Signals (session)</span>
          <span className="text-[10px] text-gray-500">
            {signals.length} total
          </span>
        </div>
        {signals.length === 0 ? (
          <div className="text-[11px] text-gray-500 border border-dashed border-gray-700 rounded p-2">
            No signals have fired yet.
          </div>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {signals.slice(0, 15).map((sig, i) => (
              <div
                key={sig.id || i}
                className="text-[11px] bg-gray-800/80 rounded p-2 flex justify-between"
              >
                <div>
                  <div
                    className={
                      sig.side === 'long' ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {sig.side?.toUpperCase()} {sig.market}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {(sig.reasons || []).slice(0, 2).join(' · ')}
                  </div>
                </div>
                <div className="text-right text-[10px] text-gray-400">
                  <div>{((sig.confidence || 0) * 100).toFixed(0)}% conf</div>
                  <div>{(sig.score || 0).toFixed(2)} score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
