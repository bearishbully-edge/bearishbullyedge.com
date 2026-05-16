// lib/auth/licenseMatrix.ts

import type {
  EntitlementFeature,
  LicenseEntitlement,
  LicenseTier,
} from '@/types/license';

export const TIER_STRATEGIES: Record<LicenseTier, string[]> = {
  none: [],
  edge_starter: ['core_logic'],
  edge_pro: ['core_logic', 'core_plus'],
  edge_institutional: ['core_logic', 'core_plus', 'foundation', 'edge'],
  signal_trader: ['core_logic', 'core_plus', 'foundation', 'edge', 'edge_pro'],
  ultimate: ['core_logic', 'core_plus', 'foundation', 'edge', 'edge_pro', 'apex'],
};

export const TIER_FEATURES: Record<LicenseTier, EntitlementFeature[]> = {
  none: [],
  edge_starter: ['basic_volume', 'economic_calendar', 'cot_overlay'],
  edge_pro: [
    'basic_volume',
    'advanced_volume',
    'economic_calendar',
    'cot_overlay',
    'orderflow_snapshot',
    'backtest',
    'paper_automation',
  ],
  edge_institutional: [
    'basic_volume',
    'advanced_volume',
    'economic_calendar',
    'cot_overlay',
    'orderflow_snapshot',
    'backtest',
    'replay',
    'paper_automation',
  ],
  signal_trader: [
    'basic_volume',
    'advanced_volume',
    'economic_calendar',
    'cot_overlay',
    'orderflow_snapshot',
    'backtest',
    'replay',
    'paper_automation',
    'ai_coaching',
  ],
  ultimate: [
    'basic_volume',
    'advanced_volume',
    'economic_calendar',
    'cot_overlay',
    'orderflow_snapshot',
    'backtest',
    'replay',
    'paper_automation',
    'live_automation',
    'tradovate_connect',
    'rithmic_connect',
    'ai_coaching',
    'affiliate_offers',
  ],
};

export function isLicenseTier(value: unknown): value is LicenseTier {
  return (
    value === 'none' ||
    value === 'edge_starter' ||
    value === 'edge_pro' ||
    value === 'edge_institutional' ||
    value === 'signal_trader' ||
    value === 'ultimate'
  );
}

export function buildEntitlement(input: {
  tier: LicenseTier;
  status?: LicenseEntitlement['status'];
  userId?: string;
  email?: string | null;
}): LicenseEntitlement {
  const status = input.status ?? (input.tier === 'none' ? 'none' : 'active');

  if (status !== 'active') {
    return {
      tier: input.tier,
      status,
      source: 'server',
      userId: input.userId,
      email: input.email,
      features: [],
      enabledStrategies: [],
    };
  }

  return {
    tier: input.tier,
    status,
    source: 'server',
    userId: input.userId,
    email: input.email,
    features: TIER_FEATURES[input.tier],
    enabledStrategies: TIER_STRATEGIES[input.tier],
  };
}

export function buildNoAccessEntitlement(): LicenseEntitlement {
  return {
    tier: 'none',
    status: 'none',
    source: 'fallback',
    features: [],
    enabledStrategies: [],
  };
}

export function hasFeature(
  entitlement: LicenseEntitlement | null | undefined,
  feature: EntitlementFeature,
): boolean {
  if (!entitlement || entitlement.status !== 'active') return false;
  return entitlement.features.includes(feature);
}