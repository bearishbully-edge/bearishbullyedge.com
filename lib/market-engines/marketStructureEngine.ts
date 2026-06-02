export type MarketStructureState =
  | 'uptrend'
  | 'downtrend'
  | 'range'
  | 'breakout'
  | 'breakdown'
  | 'failed_breakout'
  | 'failed_breakdown';

export interface MarketStructureInput {
  symbol: string;

  higherHigh: boolean;
  higherLow: boolean;

  lowerHigh: boolean;
  lowerLow: boolean;

  breakoutAttempt: boolean;
  breakoutConfirmed: boolean;

  breakdownAttempt: boolean;
  breakdownConfirmed: boolean;

  rangeBound: boolean;
}

export interface MarketStructureAnalysis {
  structureState: MarketStructureState;
  structureScore: number;

  bullishStructure: boolean;
  bearishStructure: boolean;

  continuationBias: boolean;
  reversalBias: boolean;

  coachNote: string;
}

export function analyzeMarketStructure(
  input: MarketStructureInput,
): MarketStructureAnalysis {
  let structureState: MarketStructureState = 'range';
  let structureScore = 50;

  let bullishStructure = false;
  let bearishStructure = false;

  let continuationBias = false;
  let reversalBias = false;

  if (
    input.higherHigh &&
    input.higherLow
  ) {
    structureState = 'uptrend';
    structureScore = 80;
    bullishStructure = true;
    continuationBias = true;
  }

  if (
    input.lowerHigh &&
    input.lowerLow
  ) {
    structureState = 'downtrend';
    structureScore = 80;
    bearishStructure = true;
    continuationBias = true;
  }

  if (
    input.breakoutAttempt &&
    input.breakoutConfirmed
  ) {
    structureState = 'breakout';
    structureScore = 90;
    bullishStructure = true;
    continuationBias = true;
  }

  if (
    input.breakdownAttempt &&
    input.breakdownConfirmed
  ) {
    structureState = 'breakdown';
    structureScore = 90;
    bearishStructure = true;
    continuationBias = true;
  }

if (
input.breakoutAttempt &&
!input.breakoutConfirmed
) {
structureState = 'failed_breakout';
structureScore = 75;
bullishStructure = false;
bearishStructure = true;
continuationBias = false;
reversalBias = true;
}

if (
  input.breakdownAttempt &&
  !input.breakdownConfirmed
) {
  structureState = 'failed_breakdown';
  structureScore = 75;
  bullishStructure = true;
  bearishStructure = false;
  continuationBias = false;
  reversalBias = true;
}

  if (input.rangeBound) {
    structureState = 'range';
    structureScore = 40;
    continuationBias = false;
  }

  let coachNote =
    'Market is trading inside a range. Favor patience and confirmation.';

  switch (structureState) {
    case 'uptrend':
      coachNote =
        'Structure remains bullish with higher highs and higher lows.';
      break;

    case 'downtrend':
      coachNote =
        'Structure remains bearish with lower highs and lower lows.';
      break;

    case 'breakout':
      coachNote =
        'Bullish breakout confirmed. Favor continuation setups.';
      break;

    case 'breakdown':
      coachNote =
        'Bearish breakdown confirmed. Favor continuation setups.';
      break;

    case 'failed_breakout':
      coachNote =
        'Failed breakout detected. Reversal risk elevated.';
      break;

    case 'failed_breakdown':
      coachNote =
        'Failed breakdown detected. Reversal risk elevated.';
      break;
  }

  return {
    structureState,
    structureScore,

    bullishStructure,
    bearishStructure,

    continuationBias,
    reversalBias,

    coachNote,
  };
}