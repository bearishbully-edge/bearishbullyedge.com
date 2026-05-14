// lib/backtest/compareEngines.ts
// -----------------------------------------------------------
// OPTION C — Dual Engine Comparison Layer
// Exports:
//   - runBacktestEngine()
//   - runLiveEngineSim()
//   - compareEngines()
// -----------------------------------------------------------

import { SignalAggregator } from '../automation/signalAggregator';
import { BacktestEngine } from './backtestEngine';

import type {
  BacktestCandle,
  BacktestStrategyId,
  BacktestConfig,
  BacktestResult,
} from './types';

import type {
  CoreConfig,
  IndicatorSignal,
  TradeSignal,
} from '../automation/types';

// -----------------------------------------------------------
// PUBLIC TYPES — Required by ComparisonResults.tsx
// -----------------------------------------------------------

export interface ComparisonEngineOutput {
  liveSignals: TradeSignal[];
  backtestTrades: BacktestResult['trades'];
  matchingCount: number;
  mismatchingCount: number;
  missedSignals: number;
  extraSignals: number;
  summary: string[];
}

export interface ComparisonParams {
  candles: BacktestCandle[];
  strategyId: BacktestStrategyId;
  config: BacktestConfig;
}

// -----------------------------------------------------------
// PUBLIC EXPORT 1: Run Backtest Engine Only
// (Matches BacktestControl behavior exactly)
// -----------------------------------------------------------
export async function runBacktestEngine(params: {
  candles: BacktestCandle[];
  strategyId: BacktestStrategyId;
  config: BacktestConfig;
}) {
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

  const result = await engine.run();
  return {
    trades: result.trades,
    result,
  };
}

// -----------------------------------------------------------
// PUBLIC EXPORT 2: Run Live Engine (SignalAggregator Replay)
// This simulates live real-time logic deterministically.
// -----------------------------------------------------------

function synthIndicatorsForLive(
  idx: number,
  candles: BacktestCandle[]
): IndicatorSignal[] {
  const candle = candles[idx];
  const prev = candles[idx - 1];

  const direction =
    !prev || candle.close === prev.close
      ? 'neutral'
      : candle.close > prev.close
      ? 'bullish'
      : 'bearish';

  const changePct =
    prev && prev.close > 0
      ? Math.abs(candle.close - prev.close) / prev.close
      : 0;

  const bias: IndicatorSignal = {
    name: 'bias',
    value: {
      direction,
      confidence: Math.min(changePct * 20, 1),
    },
    confidence: Math.min(changePct * 20, 1),
    timestamp: candle.timestamp,
  };

  // Delta
  let rawDelta = 0;
  if (typeof candle.delta === 'number') rawDelta = candle.delta;
  else if (typeof candle.volume === 'number') {
    rawDelta =
      candle.close > candle.open ? candle.volume :
      candle.close < candle.open ? -candle.volume : 0;
  }

  const delta: IndicatorSignal = {
    name: 'delta',
    value: {
      value: rawDelta,
      timeframe: '485',
    },
    confidence: Math.min(Math.abs(rawDelta) / 50_000, 1),
    timestamp: candle.timestamp,
  };

  // COT synthetic
  const lookback = Math.max(0, idx - 50);
  const sample = candles.slice(lookback, idx + 1);
  const first = sample[0]?.close ?? candle.close;
  const last = sample[sample.length - 1]?.close ?? candle.close;
  const trendPct = first > 0 ? (last - first) / first : 0;

  const commercials = trendPct < 0 ? 60_000 : 40_000;
  const largeFunds = 100_000 - commercials;

  const cot: IndicatorSignal = {
    name: 'cot',
    value: { commercials, largeFunds },
    confidence: Math.min(Math.abs(trendPct) * 10, 1),
    timestamp: candle.timestamp,
  };

  // Orderflow
  const body = Math.abs(candle.close - candle.open);
  const range = candle.high - candle.low || 1;
  const bodyPct = body / range;

  const imbalance =
    rawDelta ||
    (candle.close > candle.open ? range * 0.5 : -range * 0.5);

  const orderflow: IndicatorSignal = {
    name: 'orderflow',
    value: {
      absorption: bodyPct > 0.6 && Math.abs(imbalance) < range * 0.3,
      imbalance,
      sweep: bodyPct > 0.6 && Math.abs(imbalance) > range * 0.7,
    },
    confidence: Math.min(bodyPct * 2, 1),
    timestamp: candle.timestamp,
  };

  const econ: IndicatorSignal = {
    name: 'econ',
    value: { nextEvent: '', minutesUntil: 999, impact: 'LOW' },
    confidence: 0.5,
    timestamp: candle.timestamp,
  };

  return [bias, delta, cot, orderflow, econ];
}

export async function runLiveEngineSim(params: {
  candles: BacktestCandle[];
  strategyId: BacktestStrategyId;
  config: BacktestConfig;
}) {
  const agg = new SignalAggregator(params.config as CoreConfig, []);
  const signals: TradeSignal[] = [];

  agg.on('signal', (s) => signals.push(s));

  for (let i = 0; i < params.candles.length; i++) {
    const indicators = synthIndicatorsForLive(i, params.candles);
    for (const ind of indicators) agg.ingestIndicator(ind);
  }

  return { signals };
}

// -----------------------------------------------------------
// PUBLIC EXPORT 3: Compare Both Engines
// -----------------------------------------------------------

export async function compareEngines(params: {
  liveSignals: TradeSignal[];
  backtestTrades: BacktestResult['trades'];
}) {
  const { liveSignals, backtestTrades } = params;

  const simplifiedLive = liveSignals.map((s) => ({
    side: s.side,
    ts: s.timestamp,
  }));

  const simplifiedBT = backtestTrades.map((t) => ({
    side: t.side,
    ts: t.openedAt,
  }));

  let matching = 0;
  let mismatching = 0;

  simplifiedLive.forEach((ls) => {
    const match = simplifiedBT.find(
      (bt) =>
        bt.side === ls.side &&
        Math.abs(bt.ts - ls.ts) <= 1000
    );
    if (match) matching++;
    else mismatching++;
  });

  const missed = Math.max(0, simplifiedLive.length - matching);
  const extras = Math.max(0, simplifiedBT.length - matching);

  return {
    liveSignals,
    backtestTrades,
    matchingCount: matching,
    mismatchingCount: mismatching,
    missedSignals: missed,
    extraSignals: extras,
    summary: [
      `Matched: ${matching}`,
      `Mismatched: ${mismatching}`,
      `Live-but-missing: ${missed}`,
      `Backtest-only signals: ${extras}`,
    ],
  };
}
