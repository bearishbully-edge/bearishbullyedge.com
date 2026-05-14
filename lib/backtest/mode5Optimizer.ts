// lib/backtest/mode5Optimizer.ts
// ============================================================
// MODE 5 — STRATEGY OPTIMIZER ENGINE
// Purpose:
//   - Systematic grid search over strategy + indicator params
//   - Deterministic evaluation using BacktestEngine
//   - Produces ranked, promotion-ready candidates
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

export interface CoreSearchSpace {
  trade_threshold: Range;
  confidence_threshold: Range;
  stopLossPct: Range;
  takeProfitPct: Range;
}

export interface IndicatorSearchSpace {
  enabled: boolean;
  weight: Range;
  threshold?: Range;
}

export interface Mode5SearchParams {
  candles: BacktestCandle[];
  strategyId: BacktestStrategyId;
  baseConfig: BacktestConfig;

  core: CoreSearchSpace;
  indicators: Record<string, IndicatorSearchSpace>;
}

export interface Mode5Candidate {
  config: BacktestConfig;
  score: number;
  metrics: StrategyMetrics;
}

export interface StrategyMetrics {
  netProfit: number;
  maxDrawdown: number;
  winRate: number;
  tradeCount: number;
  profitFactor: number;
  expectancy: number;
}

/* ============================================================
   PUBLIC ENTRY POINT
============================================================ */

export async function runMode5GridSearch(
  params: Mode5SearchParams
): Promise<Mode5Candidate[]> {
  const { candles, strategyId, baseConfig, core } = params;

  const candidates: Mode5Candidate[] = [];

  const tradeThresholds = expandRange(core.trade_threshold);
  const confidenceThresholds = expandRange(core.confidence_threshold);
  const stopLosses = expandRange(core.stopLossPct);
  const takeProfits = expandRange(core.takeProfitPct);

  for (const trade_threshold of tradeThresholds) {
    for (const confidence_threshold of confidenceThresholds) {
      for (const stopLossPct of stopLosses) {
        for (const takeProfitPct of takeProfits) {
          const config: BacktestConfig = {
            ...baseConfig,
            trade_threshold,
            confidence_threshold,
            stopLossPct,
            takeProfitPct,
          };

          const engine = new BacktestEngine({
            candles,
            strategyId,
            baseConfig: config,
            riskConfig: {
              stopLossPct,
              takeProfitPct,
              slippagePct: config.slippagePct ?? 0,
              symbol: config.symbol,
            },
          });

          const result: BacktestResult = await engine.run();
          const metrics = computeMetrics(result);

          // Hard reject insufficient data
          if (metrics.tradeCount < 20) continue;

          const score = computeScore(metrics);

          candidates.push({
            config,
            metrics,
            score,
          });
        }
      }
    }
  }

  return candidates.sort((a, b) => b.score - a.score);
}

/* ============================================================
   METRICS + SCORING
============================================================ */

function computeMetrics(result: BacktestResult): StrategyMetrics {
  const trades = result.trades;
  if (!trades.length) {
    return {
      netProfit: 0,
      maxDrawdown: 0,
      winRate: 0,
      tradeCount: 0,
      profitFactor: 0,
      expectancy: 0,
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
  const profitFactor =
    grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  const expectancy =
    (grossProfit - grossLoss) / tradeCount;

  return {
    netProfit: grossProfit - grossLoss,
    maxDrawdown: Math.abs(maxDrawdown),
    winRate,
    tradeCount,
    profitFactor,
    expectancy,
  };
}

/**
 * Composite score:
 * - rewards expectancy & profit factor
 * - penalizes drawdown
 * - lightly favors consistency
 */
function computeScore(m: StrategyMetrics): number {
  return (
    m.expectancy * 100 +
    m.profitFactor * 10 +
    m.winRate * 20 -
    m.maxDrawdown * 0.5
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
