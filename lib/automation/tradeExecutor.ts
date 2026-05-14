// lib/automation/tradeExecutor.ts
'use client';
// @ts-nocheck

import { EventEmitter } from 'events';
import type {
  ExecutorConfig,
  TradeSignal,
  Position,
  ExecutorStats,
} from './types';

export class TradeExecutor extends EventEmitter {
  private config: ExecutorConfig;
  private positions: Map<string, Position> = new Map();
  private pnl = 0;
  private capitalUsed = 0;
  private maxCapital = 100000;
  private dailyTrades = 0;

  constructor(config: ExecutorConfig) {
    super();
    this.config = config;
  }

  async executeSignal(signal: TradeSignal): Promise<boolean> {
    if (!signal || !signal.side || !signal.entry_price || !signal.stop_price) {
      this.emit('execution_blocked', {
        reason: 'invalid_signal',
        signal,
      });
      return false;
    }

    if (this.dailyTrades >= this.config.position_limits.max_daily_trades) {
      this.emit('execution_blocked', { reason: 'daily_limit' });
      return false;
    }

    if (this.positions.size >= this.config.position_limits.max_positions) {
      this.emit('execution_blocked', { reason: 'max_positions' });
      return false;
    }

    const notional = Math.min(
      this.config.position_limits.max_position_size_usd,
      this.maxCapital * 0.02
    );

    if (this.capitalUsed + notional > this.maxCapital) {
      this.emit('execution_blocked', { reason: 'capital_exhausted' });
      return false;
    }

    const id = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const opened_at = Date.now();

    const pos: Position = {
      id,
      signal_id: signal.id,
      market: signal.market,
      side: signal.side,
      entry_price: signal.entry_price,
      stop_price: signal.stop_price,
      target_price: signal.target_price,
      size_usd: notional,
      opened_at,
      status: 'open',
    };

    this.positions.set(id, pos);
    this.capitalUsed += notional;
    this.dailyTrades += 1;

    this.emit('order_filled', {
      order_id: id,
      position: pos,
      mode: this.config.mode,
    });

    this.simulateLifecycle(pos);
    return true;
  }

  private simulateLifecycle(pos: Position) {
    const holdMs = 5000 + Math.random() * 15000; // 5–20s

    setTimeout(() => {
      if (!this.positions.has(pos.id)) return;

      const isWin = Math.random() > 0.45;
      const rMult = isWin
        ? 1 + Math.random() * 1.5 // 1–2.5R
        : -0.5 - Math.random() * 0.8; // -0.5 to -1.3R

      const priceMove = (pos.target_price - pos.entry_price) * rMult;
      const finalPrice =
        pos.side === 'long'
          ? pos.entry_price + priceMove
          : pos.entry_price - priceMove;

      const movePct = (finalPrice - pos.entry_price) / pos.entry_price;
      const pnl =
        pos.side === 'long'
          ? pos.size_usd * movePct
          : pos.size_usd * -movePct;

      this.closePosition(pos.id, finalPrice, pnl);
    }, holdMs);
  }

  private closePosition(id: string, exitPrice: number, pnl: number) {
    const pos = this.positions.get(id);
    if (!pos) return;

    pos.status = 'closed';
    pos.closed_at = Date.now();
    pos.pnl = pnl;

    this.positions.delete(id);
    this.capitalUsed = Math.max(0, this.capitalUsed - pos.size_usd);
    this.pnl += pnl;

    this.emit('position_closed', {
      order_id: id,
      position: pos,
      exit_price: exitPrice,
      pnl,
    });
  }

  getStats(): ExecutorStats {
    return {
      pnl: this.pnl,
      dailyTrades: this.dailyTrades,
      openPositions: this.positions.size,
      capitalUsed: this.capitalUsed,
      capitalAvailable: this.maxCapital - this.capitalUsed,
    };
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }
}

export default TradeExecutor;
