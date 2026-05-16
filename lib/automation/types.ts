// lib/automation/types.ts

import type {
  IndicatorSignal,
  Position,
  RiskRules,
  StrategyDefinition,
  TradingSignal,
  MarketSymbol,
  SignalDirection,
  TradeMode,
} from '@/types/trading';

export type {
  IndicatorSignal,
  Position,
  RiskRules,
  StrategyDefinition,
  TradingSignal,
  MarketSymbol,
  SignalDirection,
  TradeMode,
};

export type TradeSignal = TradingSignal;

export interface CoreConfig {
  mode: TradeMode;
  orderflow_required: boolean;
  veto_window_minutes: number;
  base_cash: number;
  size_scaler: number;
  trade_threshold: number;
  confidence_threshold: number;
  max_daily_drawdown_pct: number;
  single_trade_max_pct: number;
}

export interface BiasState {
  direction: SignalDirection;
  confidence: number;
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

export interface AggregatorStatus {
  enabled: boolean;
  market: MarketSymbol;
  currentScore: number;
  lastSignalAt: number | null;

  bias: BiasState;
  delta: DeltaState;
  cot: CotState;
  orderflow: OrderflowState;
  econ: EconState;

  activeSignals: TradingSignal[];
}

export interface ExecutorConfig {
  mode: TradeMode;

  maxSlippagePct: number;

  riskRules: RiskRules;
}

export interface ExecutorStats {
  pnl: number;
  dailyTrades: number;
  openPositions: number;
  capitalUsed: number;
  capitalAvailable: number;
}