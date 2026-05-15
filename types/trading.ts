// types/trading.ts

export type MarketSymbol = 'MNQ' | 'MES' | 'NQ' | 'ES' | 'QQQ' | 'SPY' | string;

export type TradeSide = 'long' | 'short';
export type TradeMode = 'paper' | 'live';
export type SignalDirection = 'bullish' | 'bearish' | 'neutral';
export type SignalSource =
  | 'bias'
  | 'delta'
  | 'cot'
  | 'orderflow'
  | 'econ'
  | 'manual'
  | 'backtest'
  | 'replay'
  | 'tradovate'
  | 'rithmic'
  | 'ninjatrader';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

export interface IndicatorSignal<TValue = unknown> {
  id?: string;
  source: SignalSource;
  name: string;
  symbol: MarketSymbol;
  value: TValue;
  confidence: number; // 0-1
  timestamp: number;
  reasons?: string[];
  metadata?: Record<string, unknown>;
}

export interface TradingSignal {
  id: string;
  market: MarketSymbol;
  side: TradeSide;
  direction: SignalDirection;
  score: number; // 0-100
  confidence: number; // 0-1
  entryPrice: number;
  stopPrice: number;
  targetPrice: number;
  timestamp: number;
  sourceSignals: IndicatorSignal[];
  reasons: string[];
  tags?: string[];
  strategyId?: string;
  mode?: TradeMode;
}

export interface RiskRules {
  maxDailyDrawdownPct: number;
  singleTradeMaxPct: number;
  maxDailyTrades: number;
  maxOpenPositions: number;
  maxPositionSizeUsd: number;
}

export interface StrategyDefinition {
  id: string;
  name: string;
  tier: 'CORE' | 'CORE_PLUS' | 'FOUNDATION' | 'EDGE' | 'EDGE_PRO' | 'MASTER';
  description: string;
  requiredSignals: SignalSource[];
  optionalSignals?: SignalSource[];
  tradeThreshold: number;
  confidenceThreshold: number;
  riskRules: RiskRules;
  enabled: boolean;
}

export interface BrokerOrderRequest {
  broker: 'simulated' | 'tradovate' | 'rithmic' | 'ninjatrader';
  accountId?: string;
  symbol: MarketSymbol;
  side: TradeSide;
  quantity: number;
  orderType: 'market' | 'limit' | 'stop' | 'bracket';
  limitPrice?: number;
  stopPrice?: number;
  targetPrice?: number;
  clientOrderId: string;
  metadata?: Record<string, unknown>;
}

export interface BrokerOrderResult {
  accepted: boolean;
  broker: BrokerOrderRequest['broker'];
  brokerOrderId?: string;
  clientOrderId: string;
  status: 'accepted' | 'rejected' | 'filled' | 'partially_filled' | 'cancelled';
  message?: string;
  filledQuantity?: number;
  averageFillPrice?: number;
  raw?: unknown;
}

export interface Position {
  id: string;
  signalId?: string;
  brokerPositionId?: string;
  market: MarketSymbol;
  side: TradeSide;
  entryPrice: number;
  stopPrice?: number;
  targetPrice?: number;
  quantity?: number;
  sizeUsd?: number;
  openedAt: number;
  closedAt?: number;
  status: 'open' | 'closed';
  pnl?: number;
  metadata?: Record<string, unknown>;
}

export interface VolumeBar {
  id?: string;
  symbol: MarketSymbol;
  relatedSymbol?: string;
  barTime: string;
  openVolume: number;
  closeVolume: number;
  deltaVolume: number;
  timeframe: Timeframe;
  source?: string;
  createdAt?: string;
}