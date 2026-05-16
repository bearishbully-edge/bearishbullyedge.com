// lib/backtest/backtestEngine.ts
// Pure engine: no React, no UI.

import { SignalAggregator } from '../automation/signalAggregator';
import type {
  CoreConfig,
  IndicatorSignal,
  TradeSignal,
} from '../automation/types';
import type {
  BacktestCandle,
  BacktestConfig,
  BacktestPosition,
  BacktestStrategyId,
  BacktestResult,
} from './types';
import { buildBacktestResult } from './results';

interface BacktestEngineOptions {
  candles: BacktestCandle[];
  strategyId: BacktestStrategyId;
  baseConfig: CoreConfig;
  riskConfig: Pick<
    BacktestConfig,
    'stopLossPct' | 'takeProfitPct' | 'slippagePct' | 'symbol'
  >;
}

export class BacktestEngine {
  private candles: BacktestCandle[];
  private strategyId: BacktestStrategyId;
  private config: BacktestConfig;
  private agg: SignalAggregator;
  private trades: BacktestPosition[] = [];
  private openPositions: BacktestPosition[] = [];
  private lastSignal: TradeSignal | null = null;
  private startingEquity = 100_000;

  constructor(opts: BacktestEngineOptions) {
    this.candles = opts.candles;
    this.strategyId = opts.strategyId;

    this.config = {
      ...opts.baseConfig,
      stopLossPct: opts.riskConfig.stopLossPct,
      takeProfitPct: opts.riskConfig.takeProfitPct,
      slippagePct: opts.riskConfig.slippagePct ?? 0,
      symbol: opts.riskConfig.symbol,
    };

    this.agg = new SignalAggregator(this.config);

    this.agg.on('signal', (signal: TradeSignal) => {
      this.lastSignal = signal;
      this.openFromSignal(signal);
    });

    this.agg.setEnabled(true);
  }

  private getSymbol(): string {
    return this.config.symbol || 'MNQ';
  }

  private synthIndicators(
    idx: number,
    candle: BacktestCandle,
  ): IndicatorSignal[] {
    const prev = this.candles[idx - 1];
    const symbol = this.getSymbol();

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
      source: 'backtest',
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
      const sign =
        candle.close > candle.open
          ? 1
          : candle.close < candle.open
            ? -1
            : 0;

      rawDelta = sign * candle.volume;
    }

    const delta: IndicatorSignal = {
      source: 'backtest',
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
    const sample = this.candles.slice(lookback, idx + 1);
    const first = sample[0]?.close ?? candle.close;
    const last = sample[sample.length - 1]?.close ?? candle.close;
    const trendPct = first > 0 ? (last - first) / first : 0;

    const commercials = trendPct < 0 ? 60_000 : 40_000;
    const largeFunds = 100_000 - commercials;

    const cot: IndicatorSignal = {
      source: 'backtest',
      symbol,
      name: 'cot',
      value: {
        commercials,
        largeFunds,
        commercialIndex: trendPct > 0 ? 70 : 30,
      },
      confidence: Math.min(Math.abs(trendPct) * 10, 1),
      timestamp: candle.timestamp,
    };

    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low || 1;
    const bodyPct = body / range;
    const bigBody = bodyPct > 0.6;

    const imbalance =
      rawDelta ||
      (candle.close > candle.open ? range * 0.5 : -range * 0.5);

    const orderflow: IndicatorSignal = {
      source: 'backtest',
      symbol,
      name: 'orderflow',
      value: {
        absorption: bigBody && Math.abs(imbalance) < range * 0.3,
        imbalance,
        sweep: bigBody && Math.abs(imbalance) > range * 0.7,
      },
      confidence: Math.min(bodyPct * 2, 1),
      timestamp: candle.timestamp,
    };

    const econ: IndicatorSignal = {
      source: 'backtest',
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

  private openFromSignal(signal: TradeSignal): void {
    const lastCandle = this.candles[this.candles.length - 1];
    if (!lastCandle) return;

    const entryPrice = lastCandle.close;

    const stopPrice =
      signal.side === 'long'
        ? entryPrice * (1 - this.config.stopLossPct)
        : entryPrice * (1 + this.config.stopLossPct);

    const targetPrice =
      signal.side === 'long'
        ? entryPrice * (1 + this.config.takeProfitPct)
        : entryPrice * (1 - this.config.takeProfitPct);

    const sizeUsd = this.startingEquity * 0.01;

    const pos: BacktestPosition = {
      id: `BT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      signal: {
        ...signal,
        entryPrice,
        stopPrice,
        targetPrice,
      },
      side: signal.side,
      entryIndex: this.candles.length - 1,
      entryPrice,
      sizeUsd,
      openedAt: lastCandle.timestamp,
      status: 'open',
      strategyId: this.strategyId,
    };

    this.openPositions.push(pos);
  }

  private updateOpenPositions(idx: number): void {
    const candle = this.candles[idx];
    if (!candle) return;

    const { high, low, close, timestamp } = candle;
    const stillOpen: BacktestPosition[] = [];

    for (const pos of this.openPositions) {
      const stop = pos.signal.stopPrice;
      const target = pos.signal.targetPrice;

      if (typeof stop !== 'number' || typeof target !== 'number') {
        stillOpen.push(pos);
        continue;
      }

      let exitPrice: number | null = null;

      if (pos.side === 'long') {
        if (low <= stop) {
          exitPrice = stop;
        } else if (high >= target) {
          exitPrice = target;
        }
      } else {
        if (high >= stop) {
          exitPrice = stop;
        } else if (low <= target) {
          exitPrice = target;
        }
      }

      if (exitPrice == null && idx === this.candles.length - 1) {
        exitPrice = close;
      }

      if (exitPrice == null) {
        stillOpen.push(pos);
        continue;
      }

      const movePct = (exitPrice - pos.entryPrice) / pos.entryPrice;

      const pnl =
        pos.side === 'long'
          ? pos.sizeUsd * movePct
          : pos.sizeUsd * -movePct;

      const closed: BacktestPosition = {
        ...pos,
        status: 'closed',
        exitIndex: idx,
        exitPrice,
        pnl,
        closedAt: timestamp,
      };

      this.trades.push(closed);
    }

    this.openPositions = stillOpen;
  }

  async run(): Promise<BacktestResult> {
    const startedAt = Date.now();

    if (this.candles.length === 0) {
      return buildBacktestResult({
        strategyId: this.strategyId,
        config: this.config,
        candles: [],
        trades: [],
        startedAt,
        finishedAt: Date.now(),
        startingEquity: this.startingEquity,
      });
    }

    this.trades = [];
    this.openPositions = [];
    this.lastSignal = null;

    for (let i = 0; i < this.candles.length; i++) {
      const candle = this.candles[i];
      if (!candle) continue;

      const indicators = this.synthIndicators(i, candle);

      for (const signal of indicators) {
        this.agg.ingestIndicator(signal);
      }

      this.updateOpenPositions(i);
    }

    if (this.openPositions.length > 0) {
      this.updateOpenPositions(this.candles.length - 1);
      this.openPositions = [];
    }

    return buildBacktestResult({
      strategyId: this.strategyId,
      config: this.config,
      candles: this.candles,
      trades: this.trades,
      startedAt,
      finishedAt: Date.now(),
      startingEquity: this.startingEquity,
    });
  }
}