// lib/automation/tradeExecutor.ts
'use client';

import { EventEmitter } from 'events';
import type {
  ExecutorConfig,
  ExecutorStats,
  Position,
  TradeSignal,
} from './types';

type ExecutionBlockReason =
  | 'invalid_signal'
  | 'live_mode_not_supported'
  | 'daily_limit'
  | 'max_positions'
  | 'capital_exhausted'
  | 'duplicate_signal'
  | 'kill_switch_enabled';

type ExecutionEvent = {
  reason: ExecutionBlockReason;
  signal?: TradeSignal;
  details?: string;
};

export class TradeExecutor extends EventEmitter {
  private readonly config: ExecutorConfig;
  private readonly positions: Map<string, Position> = new Map();
  private readonly executedSignalIds: Set<string> = new Set();

  private pnl = 0;
  private capitalUsed = 0;
  private maxCapital = 100_000;
  private dailyTrades = 0;
  private killSwitchEnabled = false;

  constructor(config: ExecutorConfig) {
    super();
    this.config = config;
  }

  setKillSwitch(enabled: boolean): void {
    this.killSwitchEnabled = enabled;
    this.emit('kill_switch_changed', { enabled });
  }

  async executeSignal(signal: TradeSignal): Promise<boolean> {
    const blockReason = this.validateSignal(signal);

    if (blockReason) {
      this.emitBlocked(blockReason, signal);
      return false;
    }

    if (this.config.mode !== 'paper') {
      this.emitBlocked('live_mode_not_supported', signal, {
        details:
          'Live execution must go through a broker adapter and server-side risk engine.',
      });
      return false;
    }

    if (this.killSwitchEnabled) {
      this.emitBlocked('kill_switch_enabled', signal);
      return false;
    }

    if (this.executedSignalIds.has(signal.id)) {
      this.emitBlocked('duplicate_signal', signal);
      return false;
    }

    if (this.dailyTrades >= this.config.riskRules.maxDailyTrades) {
      this.emitBlocked('daily_limit', signal);
      return false;
    }

    if (this.positions.size >= this.config.riskRules.maxOpenPositions) {
      this.emitBlocked('max_positions', signal);
      return false;
    }

    const notional = this.calculateNotional();

    if (this.capitalUsed + notional > this.maxCapital) {
      this.emitBlocked('capital_exhausted', signal);
      return false;
    }

    const position = this.createPaperPosition(signal, notional);

    this.positions.set(position.id, position);
    this.executedSignalIds.add(signal.id);
    this.capitalUsed += notional;
    this.dailyTrades += 1;

    this.emit('paper_order_filled', {
      orderId: position.id,
      position,
      mode: this.config.mode,
      signalId: signal.id,
    });

    return true;
  }

  closePaperPosition(id: string, exitPrice: number): boolean {
    const position = this.positions.get(id);

    if (!position || position.status !== 'open') {
      return false;
    }

    const pnl = this.calculatePnl(position, exitPrice);

    const closedPosition: Position = {
      ...position,
      status: 'closed',
      closedAt: Date.now(),
      pnl,
    };

    this.positions.delete(id);
    this.capitalUsed = Math.max(0, this.capitalUsed - (position.sizeUsd ?? 0));
    this.pnl += pnl;

    this.emit('paper_position_closed', {
      orderId: id,
      position: closedPosition,
      exitPrice,
      pnl,
    });

    return true;
  }

  getStats(): ExecutorStats {
    return {
      pnl: this.pnl,
      dailyTrades: this.dailyTrades,
      openPositions: this.positions.size,
      capitalUsed: this.capitalUsed,
      capitalAvailable: Math.max(0, this.maxCapital - this.capitalUsed),
    };
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  private validateSignal(signal: TradeSignal | null | undefined): ExecutionBlockReason | null {
    if (!signal) return 'invalid_signal';

    if (!signal.id) return 'invalid_signal';
    if (signal.side !== 'long' && signal.side !== 'short') return 'invalid_signal';
    if (typeof signal.entryPrice !== 'number' || signal.entryPrice <= 0) {
      return 'invalid_signal';
    }
    if (typeof signal.stopPrice !== 'number' || signal.stopPrice <= 0) {
      return 'invalid_signal';
    }
    if (typeof signal.targetPrice !== 'number' || signal.targetPrice <= 0) {
      return 'invalid_signal';
    }

    return null;
  }

  private calculateNotional(): number {
    return Math.min(
      this.config.riskRules.maxPositionSizeUsd,
      this.maxCapital * 0.02,
    );
  }

  private createPaperPosition(signal: TradeSignal, notional: number): Position {
    const now = Date.now();

    return {
      id: `PAPER-${now}-${Math.random().toString(36).slice(2, 7)}`,
      signalId: signal.id,
      market: signal.market,
      side: signal.side,
      entryPrice: signal.entryPrice,
      stopPrice: signal.stopPrice,
      targetPrice: signal.targetPrice,
      sizeUsd: notional,
      openedAt: now,
      status: 'open',
      metadata: {
        strategyId: signal.strategyId,
        confidence: signal.confidence,
        score: signal.score,
        mode: 'paper',
      },
    };
  }

  private calculatePnl(position: Position, exitPrice: number): number {
    if (!position.sizeUsd || position.entryPrice <= 0) return 0;

    const movePct = (exitPrice - position.entryPrice) / position.entryPrice;

    return position.side === 'long'
      ? position.sizeUsd * movePct
      : position.sizeUsd * -movePct;
  }

  private emitBlocked(
    reason: ExecutionBlockReason,
    signal?: TradeSignal,
    extra?: Pick<ExecutionEvent, 'details'>,
  ): void {
    const event: ExecutionEvent = {
      reason,
      signal,
      details: extra?.details,
    };

    this.emit('execution_blocked', event);
  }
}

export default TradeExecutor;