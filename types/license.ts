// types/license.ts

export type LicenseTier =
  | 'none'
  | 'edge_starter'
  | 'edge_pro'
  | 'edge_institutional'
  | 'signal_trader'
  | 'ultimate';

export type EntitlementFeature =
  | 'basic_volume'
  | 'advanced_volume'
  | 'economic_calendar'
  | 'cot_overlay'
  | 'orderflow_snapshot'
  | 'backtest'
  | 'replay'
  | 'paper_automation'
  | 'live_automation'
  | 'tradovate_connect'
  | 'rithmic_connect'
  | 'ai_coaching'
  | 'affiliate_offers';

export interface LicenseEntitlement {
  tier: LicenseTier;
  features: EntitlementFeature[];
  enabledStrategies: string[];
  status: 'none' | 'active' | 'inactive' | 'past_due' | 'cancelled';
  source: 'server' | 'fallback';
  userId?: string;
  email?: string | null;
}

export interface LicenseApiResponse {
  ok: boolean;
  entitlement: LicenseEntitlement;
  error?: string;
}