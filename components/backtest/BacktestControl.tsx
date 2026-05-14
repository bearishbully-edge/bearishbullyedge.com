// components/backtest/BacktestControl.tsx
'use client';

import React, { useState } from 'react';
import UploadCSV from './UploadCSV';
import BacktestResults from './BacktestResults';
import type {
  BacktestCandle,
  BacktestResult,
  BacktestStrategyId,
  BacktestConfig,
} from '../../lib/backtest/types';
import { runSingleBacktest } from '../../lib/backtest/backtestRunner';

const defaultCoreConfig: Omit<
  BacktestConfig,
  'stopLossPct' | 'takeProfitPct' | 'symbol'
> = {
  mode: 'paper',
  orderflow_required: false,
  veto_window_minutes: 30,
  base_cash: 100_000,
  size_scaler: 1.0,
  trade_threshold: 0.45,
  confidence_threshold: 0.55,
  max_daily_drawdown_pct: 0.02,
  single_trade_max_pct: 0.01,
  max_slippage_pct: 0.1,
  position_limits: {
    max_positions: 10,
    max_position_size_usd: 5_000,
    max_daily_trades: 100,
  },
} as any; // we only care about CoreConfig fields

export default function BacktestControl() {
  const [candles, setCandles] = useState<BacktestCandle[]>([]);
  const [strategyId, setStrategyId] =
    useState<BacktestStrategyId>('core_logic');
  const [symbol, setSymbol] = useState<string>('MNQ');
  const [stopLossPct, setStopLossPct] = useState<number>(0.005); // 0.5%
  const [takeProfitPct, setTakeProfitPct] =
    useState<number>(0.01); // 1%
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!candles.length) {
      setError('Load historical data first.');
      return;
    }
    setError(null);
    setIsRunning(true);
    setResult(null);

    try {
      const config: BacktestConfig = {
        ...(defaultCoreConfig as any),
        mode: 'paper',
        orderflow_required:
          strategyId === 'core_plus' ||
          strategyId === 'foundation',
        symbol,
        stopLossPct,
        takeProfitPct,
      };

      const res = await runSingleBacktest({
        candles,
        strategyId,
        config,
      });
      setResult(res);
    } catch (err: any) {
      console.error(err);
      setError(
        err?.message ||
          'Backtest failed. Check console for details.',
      );
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-200">
              🎛 Mode 4 – Backtest Engine
            </h3>
            <p className="text-[11px] text-gray-400">
              Replay CORE / CORE+ / FOUNDATION on historical data.
            </p>
          </div>
          <div className="text-[11px] text-gray-500">
            {candles.length > 0
              ? `${candles.length} candles loaded`
              : 'No data loaded'}
          </div>
        </div>

        {/* Controls */}
        <div className="grid gap-3 md:grid-cols-2">
          <UploadCSV onDataLoaded={setCandles} />

          <div className="space-y-3">
            {/* Strategy & Symbol */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Strategy
                </label>
                <select
                  value={strategyId}
                  onChange={(e) =>
                    setStrategyId(
                      e.target.value as BacktestStrategyId,
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200"
                >
                  <option value="core_logic">
                    CORE – Bias + Delta + COT
                  </option>
                  <option value="core_plus">
                    CORE+ – CORE + Orderflow
                  </option>
                  <option value="foundation">
                    FOUNDATION – Full Technical Suite
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Symbol
                </label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200"
                >
                  <option value="MNQ">MNQ</option>
                  <option value="MES">MES</option>
                  <option value="QQQ">QQQ</option>
                  <option value="SPY">SPY</option>
                </select>
              </div>
            </div>

            {/* Risk */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Stop Loss (%)
                </label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={(stopLossPct * 100).toFixed(2)}
                  onChange={(e) =>
                    setStopLossPct(
                      Number(e.target.value) / 100,
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">
                  Take Profit (%)
                </label>
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={(takeProfitPct * 100).toFixed(2)}
                  onChange={(e) =>
                    setTakeProfitPct(
                      Number(e.target.value) / 100,
                    )
                  }
                  className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200"
                />
              </div>
            </div>

            <button
              onClick={handleRun}
              disabled={isRunning || !candles.length}
              className="w-full mt-1 py-2 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white transition"
            >
              {isRunning
                ? 'Running Backtest...'
                : 'Run Backtest'}
            </button>

            {error && (
              <div className="text-[11px] text-red-400 bg-red-900/20 border border-red-500/40 rounded px-2 py-1">
                {error}
              </div>
            )}

            <p className="text-[10px] text-gray-500">
              Mode 4 uses the same CORE scoring engine as live
              automation, but runs deterministically on historical
              candles.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <BacktestResults result={result} />
    </div>
  );
}
