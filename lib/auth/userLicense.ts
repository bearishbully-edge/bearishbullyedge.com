// lib/auth/userLicense.ts
// @ts-nocheck

/**
 * Canonical license tiers for BearishBully Edge
 *
 * Tiers (mapped to Stripe price IDs)
 *  - edge_starter       -> Edge Starter (Terminal Starter)
 *  - edge_pro           -> Edge Pro (Terminal Pro)
 *  - edge_institutional -> Edge Institutional (Terminal Elite)
 *  - signal_trader      -> Signal Trader Bundle
 *  - ultimate           -> ALL-ACCESS ULTIMATE
 *
 * In production:
 *   - subscription_tier is set from Stripe webhooks
 *   - stripe_price_id is a fallback if tier is not set
 */

export type LicenseTier =
  | 'edge_starter'
  | 'edge_pro'
  | 'edge_institutional'
  | 'signal_trader'
  | 'ultimate';

export type AppUser = {
  id?: string;
  email?: string | null;
  subscription_tier?: LicenseTier | null;
  stripe_price_id?: string | null;
};

// Stripe price → tier mapping (these are your REAL IDs)
const PRICE_ID_TO_TIER: Record<string, LicenseTier> = {
  // Terminal Starter -> Edge Starter
  'price_1STFKFPXksLWbiDocx3UDwS6': 'edge_starter',
  // Terminal Pro -> Edge Pro
  'price_1STFWePXksLWbiDoWNqC0o9Y': 'edge_pro',
  // Terminal Elite -> Edge Institutional
  'price_1STFoFPXksLWbiDoyWSq7EVp': 'edge_institutional',
  // Signal Trader Bundle
  'price_1STG3HPXksLWbiDoQcT7DJWv': 'signal_trader',
  // ALL-ACCESS ULTIMATE
  'price_1STGBfPXksLWbiDoq94vxqhg': 'ultimate',
};

// Tier → strategies (strategy IDs from AutomationControl / StrategyPresets)
const TIER_STRATEGIES: Record<LicenseTier, string[]> = {
  edge_starter: ['core_logic'],
  edge_pro: ['core_logic', 'core_plus'],
  edge_institutional: ['core_logic', 'core_plus', 'foundation', 'edge'],
  signal_trader: ['core_logic', 'core_plus', 'foundation', 'edge', 'edge_pro'],
  ultimate: [
    'core_logic',
    'core_plus',
    'foundation',
    'edge',
    'edge_pro',
    'apex', // MASTER system (APEX id in your configs)
  ],
};

export function getUserLicense(user?: AppUser) {
  // 🔧 DEV MODE: if no user passed, treat as ALL-ACCESS
  // When you wire Supabase/Stripe, always call with a real user
  if (!user) {
    return {
      tier: 'ultimate' as LicenseTier,
      enabledStrategies: TIER_STRATEGIES['ultimate'],
    };
  }

  let tier: LicenseTier = 'edge_starter';

  // 1) Prefer explicit subscription_tier from DB
  if (user.subscription_tier && TIER_STRATEGIES[user.subscription_tier]) {
    tier = user.subscription_tier;
  }
  // 2) Fallback: infer from stripe_price_id
  else if (user.stripe_price_id && PRICE_ID_TO_TIER[user.stripe_price_id]) {
    tier = PRICE_ID_TO_TIER[user.stripe_price_id];
  }

  return {
    tier,
    enabledStrategies: TIER_STRATEGIES[tier],
  };
}
