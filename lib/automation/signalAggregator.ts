// lib/automation/signalAggregator.ts
'use client';
// @ts-nocheck

import { EventEmitter } from 'events';
import type {
  CoreConfig,
  IndicatorSignal,
  AggregatorStatus,
  BiasState,
  DeltaState,
  CotState,
  OrderflowState,
  EconState,
  TradeSignal,
} from './types';

export class SignalAggregator extends EventEmitter {
  private config: CoreConfig;
  private market: string = 'MNQ';
  private enabled = false;

  // Evaluation + safety timing
  private lastEval = 0;
  private evalCooldownMs = 1_000;      // how often we re-evaluate
  private minSignalGapMs = 30_000;     // minimum gap between new signals (per engine)

  // "Freshness" windows (ms)
  private biasFreshMs = 60_000;
  private deltaFreshMs = 60_000;
  private cotFreshMs = 86_400_000;     // 1 day
  private orderflowFreshMs = 15_000;
  private econFreshMs = 60_000;

  private bias: BiasState = {
    direction: 'neutral',
    confidence: 0,
    updatedAt: 0,
  };

  private delta: DeltaState = {
    value: 0,
    timeframe: '485',
    magnitude: 0,
    updatedAt: 0,
  };

  private cot: CotState = {
    commercials: 0,
    largeFunds: 0,
    zScore: 0,
    updatedAt: 0,
  };

  private orderflow: OrderflowState = {
    absorption: false,
    imbalance: 0,
    sweep: false,
    updatedAt: 0,
  };

  private econ: EconState = {
    nextEvent: '',
    minutesUntil: 999,
    impact: 'LOW',
    updatedAt: 0,
  };

  private activeSignals: TradeSignal[] = [];
  private lastSignalAt: number | null = null;

  constructor(config: CoreConfig, rules: any[] = []) {
    super();
    this.config = config;
  }

  // ─────────────────────────────────────────────────────────────
  // CONFIG / CONTROL
  // ─────────────────────────────────────────────────────────────

  updateMarket(market: string) {
    this.market = market;
    this.emit('market_changed', market);
  }

  updateStrategy(partial: Partial<CoreConfig>) {
    this.config = { ...this.config, ...partial };
    this.emit('strategy_updated', this.config);
  }

  setEnabled(flag: boolean) {
    this.enabled = flag;
    this.emit('enabled_changed', flag);
  }

  // ─────────────────────────────────────────────────────────────
  // FRESHNESS HELPERS
  // ─────────────────────────────────────────────────────────────

  private isFresh(ts: number, maxAgeMs: number): boolean {
    if (!ts) return false;
    return Date.now() - ts <= maxAgeMs;
  }

  private hasFreshBias(): boolean {
    return (
      this.isFresh(this.bias.updatedAt, this.biasFreshMs) &&
      (this.bias.direction === 'bullish' || this.bias.direction === 'bearish') &&
      this.bias.confidence > 0
    );
  }

  private hasFreshDelta(): boolean {
    return (
      this.isFresh(this.delta.updatedAt, this.deltaFreshMs) &&
      Math.abs(this.delta.magnitude) > 0
    );
  }

  private hasFreshCot(): boolean {
    return this.isFresh(this.cot.updatedAt, this.cotFreshMs);
  }

  private hasFreshOrderflow(): boolean {
    return (
      this.isFresh(this.orderflow.updatedAt, this.orderflowFreshMs) &&
      (this.orderflow.absorption ||
        Math.abs(this.orderflow.imbalance) > 0 ||
        this.orderflow.sweep)
    );
  }

  private hasFreshEcon(): boolean {
    return this.isFresh(this.econ.updatedAt, this.econFreshMs);
  }

  // ─────────────────────────────────────────────────────────────
  // UNIVERSAL INDICATOR INGEST
  // ─────────────────────────────────────────────────────────────

  // 🔌 Universal entry point for all indicator updates
  ingestIndicator(signal: IndicatorSignal) {
    if (!signal || !signal.name) return;

    switch (signal.name) {
      case 'bias': {
        const value = signal.value || {};
        this.bias = {
          direction: value.direction || 'neutral',
          confidence: value.confidence ?? signal.confidence ?? 0,
          updatedAt: signal.timestamp || Date.now(),
        };
        break;
      }

      case 'delta': {
        const value = signal.value || {};
        const val =
          typeof value.value === 'number'
            ? value.value
            : typeof value === 'number'
            ? value
            : Number(value.value ?? value ?? 0);

        this.delta = {
          value: val,
          timeframe: value.timeframe || '485',
          magnitude: Math.abs(val),
          updatedAt: signal.timestamp || Date.now(),
        };
        break;
      }

      case 'cot': {
        const v = signal.value || {};
        const commercials = v.commercials ?? 0;
        const largeFunds = v.largeFunds ?? 0;
        const zScore = (largeFunds - commercials) / 100;
        this.cot = {
          commercials,
          largeFunds,
          zScore,
          updatedAt: signal.timestamp || Date.now(),
        };
        break;
      }

      case 'orderflow': {
        const v = signal.value || {};
        this.orderflow = {
          absorption: !!v.absorption,
          imbalance: v.imbalance ?? 0,
          sweep: !!v.sweep,
          updatedAt: signal.timestamp || Date.now(),
        };
        break;
      }

      case 'econ': {
        const v = signal.value || {};
        this.econ = {
          nextEvent: v.nextEvent || v.event || '',
          minutesUntil: v.minutesUntil ?? 999,
          impact: (v.impact as any) || 'LOW',
          updatedAt: signal.timestamp || Date.now(),
        };
        break;
      }

      default:
        // Future: cycle, divergence, volatility, heatmap, etc.
        break;
    }

    this.maybeEvaluate();
  }

  // ─────────────────────────────────────────────────────────────
  // CORE EVAL PIPELINE
  // ─────────────────────────────────────────────────────────────

  private maybeEvaluate() {
    if (!this.enabled) return;

    const now = Date.now();

    // Cooldown so we don't hammer every tick
    if (now - this.lastEval < this.evalCooldownMs) return;
    this.lastEval = now;

    // Minimum gap between actual trade signals
    if (this.lastSignalAt && now - this.lastSignalAt < this.minSignalGapMs) {
      return;
    }

    // 1️⃣ ECONOMIC VETO
    if (
      this.econ.impact === 'HIGH' &&
      this.econ.minutesUntil <= this.config.veto_window_minutes
    ) {
      this.emit('veto', {
        type: 'econ',
        reason: 'High-impact event inside veto window',
        econ: this.econ,
      });
      return;
    }

    // 2️⃣ DATA QUALITY / SAFETY GATES
    // CORE requirement: we DO NOT fire with missing bias/delta
    if (!this.hasFreshBias() || !this.hasFreshDelta()) {
      this.emit('veto', {
        type: 'data_insufficient',
        reason: 'Bias and Delta not both fresh/valid',
        bias: this.bias,
        delta: this.delta,
      });
      return;
    }

    // CORE+ and above: orderflow_required is set by strategyConfigs
    if (this.config.orderflow_required && !this.hasFreshOrderflow()) {
      this.emit('veto', {
        type: 'orderflow_missing',
        reason: 'Strategy requires orderflow, but no fresh orderflow data',
        orderflow: this.orderflow,
      });
      return;
    }

    // 3️⃣ SCORE + THRESHOLD
    const score = this.calculateScore();
    const confidence = this.bias.confidence || 0;

    if (
      score >= this.config.trade_threshold &&
      confidence >= this.config.confidence_threshold
    ) {
      const side =
        this.bias.direction === 'bullish'
          ? 'long'
          : this.bias.direction === 'bearish'
          ? 'short'
          : null;

      if (!side) return;

      const signal = this.buildSignal(
        side as 'long' | 'short',
        score,
        confidence
      );

      this.activeSignals.unshift(signal);
      this.activeSignals = this.activeSignals.slice(0, 50);
      this.lastSignalAt = signal.timestamp;

      this.emit('signal', signal);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SCORING ENGINE
  // ─────────────────────────────────────────────────────────────

  private calculateScore(): number {
    // Fixed weights – ALWAYS sum to 1.0
    const wBias = 0.3;
    const wDelta = 0.25;
    const wCOT = 0.2;
    const wOF = 0.15;
    const wEcon = 0.1;

    let biasScore = 0;
    let deltaScore = 0;
    let cotScore = 0;
    let ofScore = 0;
    let econScore = 0;

    // Bias
    if (this.hasFreshBias()) {
      biasScore = this.bias.confidence; // already 0–1
    }

    // Delta
    if (this.hasFreshDelta()) {
      deltaScore = Math.min(this.delta.magnitude / 3000, 1);
    }

    // COT
    if (this.hasFreshCot()) {
      cotScore = Math.min(Math.abs(this.cot.zScore) / 2, 1);
    }

    // Orderflow
    if (this.hasFreshOrderflow()) {
      const ofRaw =
        (this.orderflow.absorption ? 0.4 : 0) +
        (Math.abs(this.orderflow.imbalance) > 500 ? 0.3 : 0) +
        (this.orderflow.sweep ? 0.3 : 0);
      ofScore = Math.min(ofRaw, 1);
    }

    // Econ: only adds a *small* tilt, never standalone alpha
    if (this.hasFreshEcon()) {
      if (this.econ.impact === 'LOW') econScore = 0.1;
      else if (this.econ.impact === 'MEDIUM') econScore = 0.05;
      else econScore = 0;
    }

    const raw =
      biasScore * wBias +
      deltaScore * wDelta +
      cotScore * wCOT +
      ofScore * wOF +
      econScore * wEcon;

    const totalWeight = wBias + wDelta + wCOT + wOF + wEcon; // 1.0

    return totalWeight > 0 ? raw / totalWeight : 0;
  }

  // ─────────────────────────────────────────────────────────────
  // TRADE SIGNAL CONSTRUCTION
  // ─────────────────────────────────────────────────────────────

  private buildSignal(
    side: 'long' | 'short',
    score: number,
    confidence: number
  ): TradeSignal {
    const basePrice =
      this.market === 'MNQ'
        ? 21500
        : this.market === 'MES'
        ? 5800
        : this.market === 'QQQ'
        ? 400
        : this.market === 'SPY'
        ? 500
        : 100;

    const entry = basePrice;
    const stop = side === 'long' ? entry - 25 : entry + 25;
    const target = side === 'long' ? entry + 50 : entry - 50;
    const ts = Date.now();

    const reasons: string[] = [];
    reasons.push(
      `Bias: ${this.bias.direction} (${(confidence * 100).toFixed(0)}%)`
    );

    if (this.delta.magnitude > 800) {
      reasons.push(
        `Delta: ${this.delta.value > 0 ? '+' : ''}${this.delta.value.toFixed(0)}`
      );
    }

    if (Math.abs(this.cot.zScore) > 0.5) {
      reasons.push(
        `COT: ${
          this.cot.zScore > 0 ? 'Bullish positioning' : 'Bearish positioning'
        }`
      );
    }

    if (this.hasFreshOrderflow()) {
      if (
        this.orderflow.absorption ||
        Math.abs(this.orderflow.imbalance) > 500 ||
        this.orderflow.sweep
      ) {
        reasons.push('Orderflow confirmation');
      }
    }

    return {
      id: `sig_${ts}_${Math.random().toString(36).slice(2, 7)}`,
      market: this.market,
      side,
      score,
      confidence,
      entry_price: entry,
      stop_price: stop,
      target_price: target,
      timestamp: ts,
      reasons,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // STATUS
  // ─────────────────────────────────────────────────────────────

  getSystemStatus(): AggregatorStatus {
    return {
      enabled: this.enabled,
      market: this.market,
      currentScore: this.calculateScore(),
      lastSignalAt: this.lastSignalAt,
      bias: this.bias,
      delta: this.delta,
      cot: this.cot,
      orderflow: this.orderflow,
      econ: this.econ,
      activeSignals: this.activeSignals,
    };
  }
}

export default SignalAggregator;
