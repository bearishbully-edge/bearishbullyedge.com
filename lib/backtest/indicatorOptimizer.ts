// lib/backtest/indicatorOptimizer.ts
// ============================================================
// MODE 5 — INDICATOR-LEVEL OPTIMIZER
// Purpose:
//   - Optimize individual indicator contribution
//   - Measure drift, usefulness, and stability
//   - Produce promotion-safe indicator configs
// ============================================================

import { BacktestEngine } from './backtestEngine';

import type {
  BacktestCandle,
  BacktestConfig,
  BacktestResult,
  BacktestStrategyId,
} from './types';

/* ============================================================
   TYPES
============================================================ */

export type Range = {
  min: number;
  max: number;
  step: number;
};

export interface IndicatorOptimizationConfig {
  indicator: string;
  weightRange: Range;
  thresholdRange?: Range;
}

export interface IndicatorOptimizerParams {
  candles: BacktestCandle[];
  strategyId: BacktestStrategyId;
  baseConfig: BacktestConfig;
  indicator: IndicatorOptimizationConfig;
}

export interface IndicatorCandidate {
  indicator: string;
  weight: number;
  threshold?: number;
  metrics: IndicatorMetrics;
  score: number;
}

export interface IndicatorMetrics {
  netProfit: number;
  winRate: number;
  tradeCount: number;
  expectancy: number;
  maxDrawdown: number;
}

/* ============================================================
   PUBLIC ENTRY
============================================================ */

export async function runIndicatorOptimization(
  params: IndicatorOptimizerParams
): Promise<IndicatorCandidate[]> {
  const { candles, strategyId, baseConfig, indicator } = params;

  const results: IndicatorCandidate[] = [];

  const weights = expandRange(indicator.weightRange);
  const thresholds = indicator.thresholdRange
    ? expandRange(indicator.thresholdRange)
    : [undefined];

  for (const weight of weights) {
    for (const threshold of thresholds) {
      const config: BacktestConfig = {
        ...baseConfig,
        indicator_overrides: {
          ...(baseConfig as any).indicator_overrides,
          [indicator.indicator]: {
            weight,
            threshold,
          },
        },
      };

      const engine = new BacktestEngine({
        candles,
        strategyId,
        baseConfig: config,
        riskConfig: {
          stopLossPct: config.stopLossPct,
          takeProfitPct: config.takeProfitPct,
          slippagePct: config.slippagePct ?? 0,
          symbol: config.symbol,
        },
      });

      const result: BacktestResult = await engine.run();
      const metrics = computeMetrics(result);

      if (metrics.tradeCount < 20) continue;

      const score = computeScore(metrics);

      results.push({
        indicator: indicator.indicator,
        weight,
        threshold,
        metrics,
        score,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/* ============================================================
   METRICS
============================================================ */

function computeMetrics(result: BacktestResult): IndicatorMetrics {
  const trades = result.trades;
  if (!trades.length) {
    return {
      netProfit: 0,
      winRate: 0,
      tradeCount: 0,
      expectancy: 0,
      maxDrawdown: 0,
    };
  }

  let wins = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;

  for (const t of trades) {
    equity += t.pnl;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.min(maxDrawdown, equity - peak);

    if (t.pnl > 0) {
      wins++;
      grossProfit += t.pnl;
    } else {
      grossLoss += Math.abs(t.pnl);
    }
  }

  const tradeCount = trades.length;
  const winRate = wins / tradeCount;
  const expectancy =
    (grossProfit - grossLoss) / tradeCount;

  return {
    netProfit: grossProfit - grossLoss,
    winRate,
    tradeCount,
    expectancy,
    maxDrawdown: Math.abs(maxDrawdown),
  };
}

/* ============================================================
   SCORING
============================================================ */

function computeScore(m: IndicatorMetrics): number {
  return (
    m.expectancy * 100 +
    m.winRate * 25 -
    m.maxDrawdown * 0.4
  );
}

/* ============================================================
   HELPERS
============================================================ */

function expandRange(range: Range): number[] {
  const values: number[] = [];
  for (let v = range.min; v <= range.max + 1e-9; v += range.step) {
    values.push(Number(v.toFixed(6)));
  }
  return values;
}
