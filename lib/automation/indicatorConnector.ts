// lib/automation/indicatorConnector.ts
'use client';
// @ts-nocheck

import type { IndicatorSignal } from './types';
import { SignalAggregator } from './signalAggregator';

export class IndicatorConnector {
  private agg: SignalAggregator;
  private listeners: ((signal: IndicatorSignal) => void)[] = [];
  private monitorInterval: any = null;

  constructor(aggregator: SignalAggregator) {
    this.agg = aggregator;
  }

  subscribe(cb: (signal: IndicatorSignal) => void) {
    this.listeners.push(cb);
  }

  emit(signal: IndicatorSignal) {
    for (const l of this.listeners) l(signal);
    this.agg.ingestIndicator(signal);
  }

  format(
    name: string,
    value: any,
    confidence: number = 0.5
  ): IndicatorSignal {
    return {
      name,
      value,
      confidence,
      timestamp: Date.now(),
    };
  }

  // ---- High-level bridges ----

  connectDailyBias(data: any) {
    const direction =
      data.direction ||
      (data.priceAboveVWAP && data.higherHighs && data.higherLows
        ? 'bullish'
        : !data.priceAboveVWAP && data.lowerHighs && data.lowerLows
        ? 'bearish'
        : 'neutral');

    const confidence =
      typeof data.confidence === 'number'
        ? data.confidence
        : Math.min(data.trendStrength || 0.7, 1);

    this.emit(
      this.format('bias', { direction, confidence }, confidence)
    );
  }

  connectVolumeDelta(timeframe: string, value: number) {
    this.emit(
      this.format(
        'delta',
        { timeframe, value },
        Math.min(Math.abs(value) / 3000, 1)
      )
    );
  }

  connectCOT(data: any) {
    this.emit(
      this.format(
        'cot',
        {
          commercials: data.commercials || 0,
          largeFunds: data.largeFunds || 0,
        },
        0.6
      )
    );
  }

  connectOrderflow(data: any) {
    this.emit(
      this.format(
        'orderflow',
        {
          absorption: !!data.absorption,
          imbalance: data.imbalance || 0,
          sweep: !!data.sweep,
        },
        0.7
      )
    );
  }

  connectEconomicCalendar(data: any) {
    if (!data) return;
    this.emit(
      this.format(
        'econ',
        {
          nextEvent: data.event || data.nextEvent || '',
          minutesUntil: data.minutesUntil ?? 999,
          impact: data.impact || 'LOW',
        },
        1
      )
    );
  }

  // ---- Monitoring heartbeat ----
  startMonitoring() {
    if (this.monitorInterval) return;
    console.log('🔄 IndicatorConnector: monitoring started');
    this.monitorInterval = setInterval(() => {
      // heartbeat – can be used later if needed
      // right now it just keeps the pipe warm
    }, 10000);
  }

  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('⏹ IndicatorConnector: monitoring stopped');
    }
  }

  // 🔬 Test harness
  simulateSignal(type: 'bullish' | 'bearish') {
    console.log(`🧪 Simulating ${type} scenario`);

    if (type === 'bullish') {
      this.connectDailyBias({
        priceAboveVWAP: true,
        higherHighs: true,
        higherLows: true,
        trendStrength: 0.85,
      });
      this.connectVolumeDelta('485', 2600);
      this.connectCOT({ commercials: 45000, largeFunds: 32000 });
      this.connectOrderflow({ absorption: true, imbalance: 900, sweep: false });
      this.connectEconomicCalendar({
        event: 'Calm session',
        minutesUntil: 999,
        impact: 'LOW',
      });
    } else {
      this.connectDailyBias({
        priceAboveVWAP: false,
        lowerHighs: true,
        lowerLows: true,
        trendStrength: 0.85,
      });
      this.connectVolumeDelta('485', -2600);
      this.connectCOT({ commercials: 25000, largeFunds: 48000 });
      this.connectOrderflow({ absorption: true, imbalance: -900, sweep: true });
      this.connectEconomicCalendar({
        event: 'Calm session',
        minutesUntil: 999,
        impact: 'LOW',
      });
    }
  }
}

export default IndicatorConnector;
