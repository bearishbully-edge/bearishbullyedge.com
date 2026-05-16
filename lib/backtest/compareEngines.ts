// lib/backtest/compareEngines.ts

import { SignalAggregator } from '../automation/signalAggregator';
import { BacktestEngine } from './backtestEngine';
import { normalizeBacktestConfigToCoreConfig } from '../automation/configAdapters/backtestConfigAdapter';

import type {
  BacktestCandle,
  BacktestStrategyId,
  BacktestConfig,
  BacktestResult,
} from './types';

import type {
  IndicatorSignal,
  TradeSignal,
} from '../automation/types';

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

export async function runBacktestEngine(params: ComparisonParams) {
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

function synthIndicatorsForLive(
  idx: number,
  candles: BacktestCandle[],
  symbol: string,
): IndicatorSignal[] {
  const candle = candles[idx];
  if (!candle) return [];

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

  const biasConfidence = Math.min(changePct * 20, 1);

  const bias: IndicatorSignal = {
    source: 'replay',
    symbol,
    name: 'bias',
    value: {
      direction,
      confidence: biasConfidence,
    },
    confidence: biasConfidence,
    timestamp: candle.timestamp,
  };

  let rawDelta = 0;

  if (typeof candle.delta === 'number') {
    rawDelta = candle.delta;
  } else if (typeof candle.volume === 'number') {
    rawDelta =
      candle.close > candle.open
        ? candle.volume
        : candle.close < candle.open
          ? -candle.volume
          : 0;
  }

  const delta: IndicatorSignal = {
    source: 'replay',
    symbol,
    name: 'delta',
    value: {
      value: rawDelta,
      timeframe: '485',
    },
    confidence: Math.min(Math.abs(rawDelta) / 50_000, 1),
    timestamp: candle.timestamp,
  };

  const lookback = Math.max(0, idx - 50);
  const sample = candles.slice(lookback, idx + 1);

  const first = sample[0]?.close ?? candle.close;
  const last = sample[sample.length - 1]?.close ?? candle.close;
  const trendPct = first > 0 ? (last - first) / first : 0;

  const commercials = trendPct < 0 ? 60_000 : 40_000;
  const largeFunds = 100_000 - commercials;

  const cot: IndicatorSignal = {
    source: 'replay',
    symbol,
    name: 'cot',
    value: {
      commercials,
      largeFunds,
    },
    confidence: Math.min(Math.abs(trendPct) * 10, 1),
    timestamp: candle.timestamp,
  };

  const body = Math.abs(candle.close - candle.open);
  const range = candle.high - candle.low || 1;
  const bodyPct = body / range;

  const imbalance =
    rawDelta ||
    (candle.close > candle.open ? range * 0.5 : -range * 0.5);

  const orderflow: IndicatorSignal = {
    source: 'replay',
    symbol,
    name: 'orderflow',
    value: {
      absorption:
        bodyPct > 0.6 &&
        Math.abs(imbalance) < range * 0.3,
      imbalance,
      sweep:
        bodyPct > 0.6 &&
        Math.abs(imbalance) > range * 0.7,
    },
    confidence: Math.min(bodyPct * 2, 1),
    timestamp: candle.timestamp,
  };

  const econ: IndicatorSignal = {
    source: 'replay',
    symbol,
    name: 'econ',
    value: {
      nextEvent: '',
      minutesUntil: 999,
      impact: 'LOW',
    },
    confidence: 0.5,
    timestamp: candle.timestamp,
  };

  return [bias, delta, cot, orderflow, econ];
}

export async function runLiveEngineSim(params: ComparisonParams) {
  const coreConfig =
    normalizeBacktestConfigToCoreConfig(params.config);

  const agg = new SignalAggregator(coreConfig);

  const signals: TradeSignal[] = [];
  agg.on('signal', (signal: TradeSignal) => {
    signals.push(signal);
  });

  agg.setEnabled(true);

  for (let i = 0; i < params.candles.length; i++) {
    const indicators = synthIndicatorsForLive(
      i,
      params.candles,
      params.config.symbol,
    );

    for (const indicator of indicators) {
      agg.ingestIndicator(indicator);
    }
  }

  return { signals };
}

export async function compareEngines(params: {
  liveSignals: TradeSignal[];
  backtestTrades: BacktestResult['trades'];
}): Promise<ComparisonEngineOutput> {
  const { liveSignals, backtestTrades } = params;

  const simplifiedLive = liveSignals.map((signal) => ({
    side: signal.side,
    ts: signal.timestamp,
  }));

  const simplifiedBacktest = backtestTrades.map((trade) => ({
    side: trade.side,
    ts: trade.openedAt,
  }));

  let matchingCount = 0;
  let mismatchingCount = 0;

  simplifiedLive.forEach((liveSignal) => {
    const match = simplifiedBacktest.find(
      (backtestTrade) =>
        backtestTrade.side === liveSignal.side &&
        Math.abs(backtestTrade.ts - liveSignal.ts) <= 1000,
    );

    if (match) {
      matchingCount++;
    } else {
      mismatchingCount++;
    }
  });

  const missedSignals = Math.max(0, simplifiedLive.length - matchingCount);
  const extraSignals = Math.max(0, simplifiedBacktest.length - matchingCount);

  return {
    liveSignals,
    backtestTrades,
    matchingCount,
    mismatchingCount,
    missedSignals,
    extraSignals,
    summary: [
      `Matched: ${matchingCount}`,
      `Mismatched: ${mismatchingCount}`,
      `Live-but-missing: ${missedSignals}`,
      `Backtest-only signals: ${extraSignals}`,
    ],
  };
}