import type {
  TrendAnalysis,
} from './trendEngine';

import type {
  MomentumAnalysis,
} from './momentumEngine';

import type {
  LiquidityAnalysis,
} from './liquidityEngine';

import type {
  MarketStructureAnalysis,
} from './marketStructureEngine';

import type {
  CycleAnalysis,
} from './cycleEngine';

export type MarketRegime =
  | 'trend'
  | 'range'
  | 'expansion'
  | 'compression'
  | 'reversal'
  | 'exhaustion'
  | 'unclear';

export interface RegimeAnalysis {
  regime: MarketRegime;

  trendFriendly: boolean;
  meanReversionFriendly: boolean;
  breakoutFriendly: boolean;
  cautionRequired: boolean;

  regimeScore: number;

  coachNote: string;
}

export function analyzeRegime({
  trend,
  momentum,
  liquidity,
  structure,
  cycle,
}: {
  trend: TrendAnalysis;
  momentum: MomentumAnalysis;
  liquidity: LiquidityAnalysis;
  structure: MarketStructureAnalysis;
  cycle: CycleAnalysis;
}): RegimeAnalysis {
  let regime: MarketRegime = 'unclear';
  let regimeScore = 50;

  let trendFriendly = false;
  let meanReversionFriendly = false;
  let breakoutFriendly = false;
  let cautionRequired = false;

  if (
    trend.trendAligned &&
    momentum.momentumAligned &&
    structure.continuationBias
  ) {
    regime = 'trend';
    regimeScore = 75;
    trendFriendly = true;
  }

  if (
    structure.structureState === 'breakout' ||
    structure.structureState === 'breakdown'
  ) {
    regime = 'expansion';
    regimeScore = 80;
    breakoutFriendly = true;
  }

  if (
    structure.structureState === 'range'
  ) {
    regime = 'range';
    regimeScore = 60;
    meanReversionFriendly = true;
  }

  if (
    liquidity.sweepDetected &&
    structure.reversalBias
  ) {
    regime = 'reversal';
    regimeScore = 70;
    meanReversionFriendly = true;
    cautionRequired = true;
  }

  if (
    cycle.reversalProbability >= 55
  ) {
    regime = 'exhaustion';
    regimeScore = 65;
    meanReversionFriendly = true;
    cautionRequired = true;
  }

  if (
    !momentum.momentumAligned &&
    !structure.continuationBias &&
    !structure.reversalBias
  ) {
    regime = 'compression';
    regimeScore = 55;
    cautionRequired = true;
  }

  return {
    regime,
    trendFriendly,
    meanReversionFriendly,
    breakoutFriendly,
    cautionRequired,
    regimeScore,
    coachNote:
      `Current regime classified as ${regime}.`,
  };
}