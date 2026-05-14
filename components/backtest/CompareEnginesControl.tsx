'use client';

import React, { useState } from 'react';
import UploadCSV from './UploadCSV';
import ComparisonResults from './ComparisonResults';

import {
  runBacktestEngine,
  runLiveEngineSim,
  compareEngines,
} from '../../lib/backtest/compareEngines';

import type {
  BacktestCandle,
  BacktestConfig,
  BacktestResult,
} from '../../lib/backtest/types';

export default function CompareEnginesControl() {
  const [candles, setCandles] = useState<BacktestCandle[]>([]);
  const [symbol, setSymbol] = useState('MNQ');
  const [stopLossPct, setStopLossPct] = useState(0.005);
  const [takeProfitPct, setTakeProfitPct] = useState(0.01);
  const [isRunning, setIsRunning] = useState(false);
  const [comparison, setComparison] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // ------------------------------------------------------------
  // RUN COMPARISON
  // ------------------------------------------------------------
  const handleRun = async () => {
    if (!candles.length) {
      setError('Load historical data first.');
      return;
    }

    setError(null);
    setIsRunning(true);

    try {
      // ------------------------------
      // VALID BacktestConfig (clean)
      // ------------------------------
      const config: BacktestConfig = {
        mode: 'paper',
        orderflow_required: false,
        veto_window_minutes: 30,
        base_cash: 100_000,
        size_scaler: 1.0,
        trade_threshold: 0.45,
        confidence_threshold: 0.55,
        max_daily_drawdown_pct: 0.02,
        single_trade_max_pct: 0.01,
        slippagePct: 0.1,
        stopLossPct,
        takeProfitPct,
        symbol,
      };

      // ------------------------------
      // RUN BACKTEST ENGINE (offline)
      // ------------------------------
      const backtest = await runBacktestEngine({
        candles,
        strategyId: 'core_logic',
        config,
      });

      // ------------------------------
      // RUN LIVE ENGINE SIMULATION
      // ------------------------------
      const live = await runLiveEngineSim({
        candles,
        strategyId: 'core_logic',
        config,
      });

      // ------------------------------
      // COMPARE BOTH ENGINES
      // ------------------------------
      const cmp = await compareEngines({
        liveSignals: live.signals,
        backtestTrades: backtest.trades,
      });

      setComparison(cmp);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Engine comparison failed.');
    } finally {
      setIsRunning(false);
    }
  };

  // ------------------------------------------------------------
  // RENDER UI
  // ------------------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
        <h3 className="text-white font-bold">⚖️ Compare Engines (Mode 4)</h3>

        <UploadCSV onDataLoaded={setCandles} />

        {/* RUN BUTTON */}
        <button
          onClick={handleRun}
          disabled={isRunning || !candles.length}
          className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs"
        >
          {isRunning ? 'Running comparison…' : 'Compare Engines'}
        </button>

        {/* ERROR */}
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}
      </div>

      {/* RESULTS */}
      <ComparisonResults data={comparison} />
    </div>
  );
}
