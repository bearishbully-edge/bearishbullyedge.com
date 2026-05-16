// lib/automation/configAdapters/backtestConfigAdapter.ts

import type { CoreConfig } from '../types';

type BacktestConfigLike = Partial<CoreConfig> & {
  symbol?: string;
  stopLossPct?: number;
  takeProfitPct?: number;
  slippagePct?: number;
};

function numberOrDefault(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function booleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeBacktestConfigToCoreConfig(
  config: BacktestConfigLike,
): CoreConfig {
  return {
    mode: config.mode === 'live' ? 'live' : 'paper',
    orderflow_required: booleanOrDefault(config.orderflow_required, false),
    veto_window_minutes: numberOrDefault(config.veto_window_minutes, 30),
    base_cash: numberOrDefault(config.base_cash, 100_000),
    size_scaler: numberOrDefault(config.size_scaler, 1),
    trade_threshold: numberOrDefault(config.trade_threshold, 0.65),
    confidence_threshold: numberOrDefault(config.confidence_threshold, 0.55),
    max_daily_drawdown_pct: numberOrDefault(config.max_daily_drawdown_pct, 0.03),
    single_trade_max_pct: numberOrDefault(config.single_trade_max_pct, 0.01),
  };
}