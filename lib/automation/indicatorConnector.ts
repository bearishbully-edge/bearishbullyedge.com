// lib/automation/indicatorConnector.ts

import type { IndicatorSignal, MarketSymbol } from './types';
import { SignalAggregator } from './signalAggregator';

type BiasInput = {
  direction?: 'bullish' | 'bearish' | 'neutral';
  confidence?: number;
  priceAboveVWAP?: boolean;
  higherHighs?: boolean;
  higherLows?: boolean;
  lowerHighs?: boolean;
  lowerLows?: boolean;
  trendStrength?: number;
};

type CotInput = {
  commercials?: number;
  largeFunds?: number;
};

type OrderflowInput = {
  absorption?: boolean;
  imbalance?: number;
  sweep?: boolean;
};

type EconomicInput = {
  event?: string;
  nextEvent?: string;
  minutesUntil?: number;
  impact?: 'LOW' | 'MEDIUM' | 'HIGH';
};

export class IndicatorConnector {
  private readonly agg: SignalAggregator;

  private readonly market: MarketSymbol;

  private readonly listeners: Array<
    (signal: IndicatorSignal) => void
  > = [];

  private monitorInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    aggregator: SignalAggregator,
    market: MarketSymbol = 'MNQ',
  ) {
    this.agg = aggregator;
    this.market = market;
  }

  subscribe(cb: (signal: IndicatorSignal) => void): void {
    this.listeners.push(cb);
  }

  emit(signal: IndicatorSignal): void {
    for (const listener of this.listeners) {
      listener(signal);
    }

    this.agg.ingestIndicator(signal);
  }

  private buildSignal<T>(
    name: string,
    value: T,
    confidence = 0.5,
  ): IndicatorSignal<T> {
    return {
      source: 'manual',
      symbol: this.market,
      name,
      value,
      confidence,
      timestamp: Date.now(),
    };
  }

  connectDailyBias(data: BiasInput): void {
    const direction =
      data.direction ||
      (data.priceAboveVWAP &&
      data.higherHighs &&
      data.higherLows
        ? 'bullish'
        : !data.priceAboveVWAP &&
            data.lowerHighs &&
            data.lowerLows
          ? 'bearish'
          : 'neutral');

    const confidence =
      typeof data.confidence === 'number'
        ? data.confidence
        : Math.min(data.trendStrength || 0.7, 1);

    this.emit(
      this.buildSignal(
        'bias',
        {
          direction,
          confidence,
        },
        confidence,
      ),
    );
  }

  connectVolumeDelta(
    timeframe: string,
    value: number,
  ): void {
    this.emit(
      this.buildSignal(
        'delta',
        {
          timeframe,
          value,
        },
        Math.min(Math.abs(value) / 3000, 1),
      ),
    );
  }

  connectCOT(data: CotInput): void {
    this.emit(
      this.buildSignal(
        'cot',
        {
          commercials: data.commercials || 0,
          largeFunds: data.largeFunds || 0,
        },
        0.6,
      ),
    );
  }

  connectOrderflow(data: OrderflowInput): void {
    this.emit(
      this.buildSignal(
        'orderflow',
        {
          absorption: !!data.absorption,
          imbalance: data.imbalance || 0,
          sweep: !!data.sweep,
        },
        0.7,
      ),
    );
  }

  connectEconomicCalendar(data: EconomicInput | null): void {
    if (!data) {
      return;
    }

    this.emit(
      this.buildSignal(
        'econ',
        {
          nextEvent: data.event || data.nextEvent || '',
          minutesUntil: data.minutesUntil ?? 999,
          impact: data.impact || 'LOW',
        },
        1,
      ),
    );
  }

  startMonitoring(): void {
    if (this.monitorInterval) {
      return;
    }

    this.monitorInterval = setInterval(() => {
      // Reserved for future health heartbeat
    }, 10_000);
  }

  stopMonitoring(): void {
    if (!this.monitorInterval) {
      return;
    }

    clearInterval(this.monitorInterval);
    this.monitorInterval = null;
  }

  simulateSignal(type: 'bullish' | 'bearish'): void {
    if (type === 'bullish') {
      this.connectDailyBias({
        priceAboveVWAP: true,
        higherHighs: true,
        higherLows: true,
        trendStrength: 0.85,
      });

      this.connectVolumeDelta('485', 2600);

      this.connectCOT({
        commercials: 45_000,
        largeFunds: 32_000,
      });

      this.connectOrderflow({
        absorption: true,
        imbalance: 900,
        sweep: false,
      });
    } else {
      this.connectDailyBias({
        priceAboveVWAP: false,
        lowerHighs: true,
        lowerLows: true,
        trendStrength: 0.85,
      });

      this.connectVolumeDelta('485', -2600);

      this.connectCOT({
        commercials: 25_000,
        largeFunds: 48_000,
      });

      this.connectOrderflow({
        absorption: true,
        imbalance: -900,
        sweep: true,
      });
    }

    this.connectEconomicCalendar({
      event: 'Calm session',
      minutesUntil: 999,
      impact: 'LOW',
    });
  }
}

export default IndicatorConnector;