export interface RiskGateInput {
  dailyLossLocked: boolean;

  maxPositionsReached: boolean;

  economicLockout: boolean;
}

export interface RiskGateResult {
  approved: boolean;

  reason?: string;
}

export function evaluateRiskGate(
  input: RiskGateInput,
): RiskGateResult {
  if (
    input.dailyLossLocked
  ) {
    return {
      approved: false,
      reason:
        'Daily loss limit reached.',
    };
  }

  if (
    input.maxPositionsReached
  ) {
    return {
      approved: false,
      reason:
        'Maximum positions reached.',
    };
  }

  if (
    input.economicLockout
  ) {
    return {
      approved: false,
      reason:
        'Economic lockout active.',
    };
  }

  return {
    approved: true,
  };
}