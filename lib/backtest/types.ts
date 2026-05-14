import type {
  CoreConfig,
  TradeSignal,
} from '../automation/types';

export interface BacktestCandle {
  timestamp: number;      // ms since epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  delta?: number;         // optional buy-sell delta
  symbol?: string;
}

export type BacktestStrategyId =
  | 'core_logic'
  | 'core_plus'
  | 'foundation';

/**
 * BacktestConfig EXTENDS CoreConfig
 * (do NOT redeclare CoreConfig fields here)
 */
export interface BacktestConfig extends CoreConfig {
  // Risk for backtest (R-based)
  stopLossPct: number;     // e.g. 0.005 = 0.5%
  takeProfitPct: number;   // e.g. 0.01 = 1%
  slippagePct?: number;    // extra slippage on entry/exit
  symbol: string;          // MNQ/MES/QQQ/SPY etc.

  // ✅ Mode 5 — Indicator-level overrides
  indicator_overrides?: Record<
    string,
    {
      weight?: number;
      threshold?: number;
    }
  >;
}

export interface BacktestPosition {
  id: string;
  signal: TradeSignal;
  side: 'long' | 'short';
  entryIndex: number;
  exitIndex?: number;
  entryPrice: number;
  exitPrice?: number;
  sizeUsd: number;
  pnl?: number;
  openedAt: number;
  closedAt?: number;
  status: 'open' | 'closed';
  strategyId: BacktestStrategyId;
}

export interface EquityPoint {
  timestamp: number;
  equity: number;
}

export interface BacktestMetrics {
  startingEquity: number;
  endingEquity: number;
  netPnl: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
  winRate: number;
  totalTrades: number;
  avgR: number;
  profitFactor: number;
}

export interface BacktestResult {
  strategyId: BacktestStrategyId;
  config: BacktestConfig;
  candles: BacktestCandle[];
  trades: BacktestPosition[];
  equityCurve: EquityPoint[];
  metrics: BacktestMetrics;
  startedAt: number;
  finishedAt: number;
  durationMs: number;
}
