// lib/automation/types.ts

export type MarketSymbol = 'MNQ' | 'MES' | 'QQQ' | 'SPY';

export interface CoreConfig {
  mode: 'paper' | 'live';
  orderflow_required: boolean;
  veto_window_minutes: number;
  base_cash: number;
  size_scaler: number;
  trade_threshold: number;
  confidence_threshold: number;
  max_daily_drawdown_pct: number;
  single_trade_max_pct: number;
}

export interface IndicatorSignal {
  name: string;           // "bias" | "delta" | "cot" | "orderflow" | "econ" | etc.
  value: any;
  confidence: number;     // 0–1
  timestamp: number;
}

export interface BiasState {
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0–1
  updatedAt: number;
}

export interface DeltaState {
  value: number;
  timeframe: string;
  magnitude: number;
  updatedAt: number;
}

export interface CotState {
  commercials: number;
  largeFunds: number;
  zScore: number;
  updatedAt: number;
}

export interface OrderflowState {
  absorption: boolean;
  imbalance: number;
  sweep: boolean;
  updatedAt: number;
}

export interface EconState {
  nextEvent: string;
  minutesUntil: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  updatedAt: number;
}

export interface TradeSignal {
  id: string;
  market: MarketSymbol | string;
  side: 'long' | 'short';
  score: number;
  confidence: number;
  entry_price: number;
  stop_price: number;
  target_price: number;
  timestamp: number;
  reasons: string[];
  tags?: string[];
}

export interface AggregatorStatus {
  enabled: boolean;
  market: MarketSymbol | string;
  currentScore: number;
  lastSignalAt: number | null;
  bias: BiasState;
  delta: DeltaState;
  cot: CotState;
  orderflow: OrderflowState;
  econ: EconState;
  activeSignals: TradeSignal[];
}

export interface ExecutorConfig {
  mode: 'paper' | 'live';
  max_slippage_pct: number;
  position_limits: {
    max_positions: number;
    max_position_size_usd: number;
    max_daily_trades: number;
  };
}

export interface Position {
  id: string;
  signal_id: string;
  market: string;
  side: 'long' | 'short';
  entry_price: number;
  stop_price: number;
  target_price: number;
  size_usd: number;
  opened_at: number;
  closed_at?: number;
  status: 'open' | 'closed';
  pnl?: number;
}

export interface ExecutorStats {
  pnl: number;
  dailyTrades: number;
  openPositions: number;
  capitalUsed: number;
  capitalAvailable: number;
}
