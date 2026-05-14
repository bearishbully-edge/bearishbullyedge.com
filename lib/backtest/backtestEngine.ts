// lib/backtest/backtestEngine.ts
// Pure engine: no React, no UI

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

/**
 * BacktestEngine:
 *  - Replays candles
 *  - Synthesizes indicator signals (Bias / Delta / COT / Orderflow / Econ)
 *  - Feeds them into SignalAggregator
 *  - Builds trades with deterministic risk logic
 */
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

    this.agg = new SignalAggregator(this.config, []);

    this.agg.on('signal', (signal: TradeSignal) => {
      this.lastSignal = signal;
      this.openFromSignal(signal);
    });
  }

  private synthIndicators(
    idx: number,
    candle: BacktestCandle,
  ): IndicatorSignal[] {
    const prev = this.candles[idx - 1];

    // --- Bias: trend / momentum
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

    const biasConfidence = Math.min(changePct * 20, 1); // 0–5% move maps to 0–1

    const bias: IndicatorSignal = {
      name: 'bias',
      value: {
        direction,
        confidence: biasConfidence,
      },
      confidence: biasConfidence,
      timestamp: candle.timestamp,
    };

    // --- Delta: use provided delta or volume + price direction
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
      name: 'delta',
      value: {
        value: rawDelta,
        timeframe: '485',
      },
      confidence: Math.min(Math.abs(rawDelta) / 50_000, 1),
      timestamp: candle.timestamp,
    };

    // --- COT: synthetic from higher timeframe momentum (very rough)
    const lookback = Math.max(0, idx - 50);
    const sample = this.candles.slice(lookback, idx + 1);
    const first = sample[0]?.close ?? candle.close;
    const last = sample[sample.length - 1]?.close ?? candle.close;
    const trendPct =
      first > 0 ? (last - first) / first : 0;
    const commercials = trendPct < 0 ? 60_000 : 40_000;
    const largeFunds = 100_000 - commercials;
    const cot: IndicatorSignal = {
      name: 'cot',
      value: {
        commercials,
        largeFunds,
        commercialIndex: trendPct > 0 ? 70 : 30,
      },
      confidence: Math.min(Math.abs(trendPct) * 10, 1),
      timestamp: candle.timestamp,
    };

    // --- Orderflow: large body & volume = aggression
    const body = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low || 1;
    const bodyPct = body / range;
    const bigBody = bodyPct > 0.6;
    const imbalance =
      rawDelta ||
      (candle.close > candle.open ? range * 0.5 : -range * 0.5);

    const orderflow: IndicatorSignal = {
      name: 'orderflow',
      value: {
        absorption: bigBody && Math.abs(imbalance) < range * 0.3,
        imbalance,
        sweep: bigBody && Math.abs(imbalance) > range * 0.7,
      },
      confidence: Math.min(bodyPct * 2, 1),
      timestamp: candle.timestamp,
    };

    // --- Econ: flat calm for now
    const econ: IndicatorSignal = {
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

  private openFromSignal(signal: TradeSignal) {
    const lastCandle =
      this.candles[this.candles.length - 1];
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

    const sizeUsd = this.startingEquity * 0.01; // 1% notional per trade

    const pos: BacktestPosition = {
      id: `BT-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,
      signal: {
        ...signal,
        entry_price: entryPrice,
        stop_price: stopPrice,
        target_price: targetPrice,
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

  private updateOpenPositions(idx: number) {
    const candle = this.candles[idx];
    if (!candle) return;
    const { high, low, close, timestamp } = candle;

    const stillOpen: BacktestPosition[] = [];

    for (const pos of this.openPositions) {
      const stop = pos.signal.stop_price;
      const target = pos.signal.target_price;

      let exitPrice: number | null = null;
      let hitStop = false;
      let hitTarget = false;

      if (pos.side === 'long') {
        if (low <= stop) {
          exitPrice = stop;
          hitStop = true;
        } else if (high >= target) {
          exitPrice = target;
          hitTarget = true;
        }
      } else {
        // short
        if (high >= stop) {
          exitPrice = stop;
          hitStop = true;
        } else if (low <= target) {
          exitPrice = target;
          hitTarget = true;
        }
      }

      if (exitPrice == null) {
        // Not hit yet; if last bar, close at close
        if (idx === this.candles.length - 1) {
          exitPrice = close;
        }
      }

      if (exitPrice == null) {
        stillOpen.push(pos);
        continue;
      }

      const movePct =
        (exitPrice - pos.entryPrice) / pos.entryPrice;
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

    // Reset state
    this.trades = [];
    this.openPositions = [];
    this.lastSignal = null;

    // Replay candles
    for (let i = 0; i < this.candles.length; i++) {
      const c = this.candles[i];

      // 1) Update indicator signals
      const indicators = this.synthIndicators(i, c);
      for (const sig of indicators) {
        this.agg.ingestIndicator(sig);
      }

      // 2) Update open positions with this bar
      this.updateOpenPositions(i);
    }

    // If any positions still open, close them at last candle
    if (this.openPositions.length) {
      this.updateOpenPositions(this.candles.length - 1);
      this.openPositions = [];
    }

    const finishedAt = Date.now();

    return buildBacktestResult({
      strategyId: this.strategyId,
      config: this.config,
      candles: this.candles,
      trades: this.trades,
      startedAt,
      finishedAt,
      startingEquity: this.startingEquity,
    });
  }
}
