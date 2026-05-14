// lib/backtest/results.ts

import type {
  BacktestResult,
  BacktestConfig,
  BacktestCandle,
  BacktestPosition,
  BacktestStrategyId,
} from './types';
import { buildEquityCurve, computeMetrics } from './metrics';

export function buildBacktestResult(params: {
  strategyId: BacktestStrategyId;
  config: BacktestConfig;
  candles: BacktestCandle[];
  trades: BacktestPosition[];
  startedAt: number;
  finishedAt: number;
  startingEquity?: number;
}): BacktestResult {
  const startingEquity = params.startingEquity ?? 100_000;
  const equityCurve = buildEquityCurve(
    params.trades,
    startingEquity,
  );
  const metrics = computeMetrics(params.trades, startingEquity);

  return {
    strategyId: params.strategyId,
    config: params.config,
    candles: params.candles,
    trades: params.trades,
    equityCurve,
    metrics,
    startedAt: params.startedAt,
    finishedAt: params.finishedAt,
    durationMs: params.finishedAt - params.startedAt,
  };
}
