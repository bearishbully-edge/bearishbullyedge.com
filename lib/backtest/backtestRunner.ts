// lib/backtest/backtestRunner.ts

import type {
  BacktestCandle,
  BacktestConfig,
  BacktestStrategyId,
  BacktestResult,
} from './types';
import { BacktestEngine } from './backtestEngine';

export async function runSingleBacktest(params: {
  candles: BacktestCandle[];
  strategyId: BacktestStrategyId;
  config: BacktestConfig;
}): Promise<BacktestResult> {
  const engine = new BacktestEngine({
    candles: params.candles,
    strategyId: params.strategyId,
    baseConfig: params.config,
    riskConfig: {
      stopLossPct: params.config.stopLossPct,
      takeProfitPct: params.config.takeProfitPct,
      slippagePct: params.config.slippagePct ?? 0,
      symbol: params.config.symbol,
    },
  });

  return engine.run();
}
