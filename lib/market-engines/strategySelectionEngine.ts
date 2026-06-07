import type {
  RegimeAnalysis,
} from './regimeEngine';

import type {
  CycleAnalysis,
} from './cycleEngine';

import type {
  DivergenceLocationAnalysis,
} from './divergenceLocationResolver';

export type StrategyType =
  | 'trend_continuation'
  | 'breakout_continuation'
  | 'mean_reversion'
  | 'reversal'
  | 'stand_aside';

export interface StrategySelection {
  strategyType: StrategyType;
  strategyConfidence: 'low' | 'medium' | 'high';
  autoExecutionAllowed: boolean;
  coachNote: string;
}

export function selectStrategy({
  regime,
  cycle,
  divergenceLocation,
}: {
  regime: RegimeAnalysis;
  cycle: CycleAnalysis;
  divergenceLocation: DivergenceLocationAnalysis;
}): StrategySelection {
  if (
    regime.cautionRequired &&
    cycle.reversalProbability >= 55
  ) {
    return {
      strategyType: 'reversal',
      strategyConfidence: 'medium',
      autoExecutionAllowed: false,
      coachNote:
        'Reversal conditions detected, but caution is required. Manual confirmation preferred.',
    };
  }

  if (
    regime.breakoutFriendly &&
    !divergenceLocation.locationMeaningful
  ) {
    return {
      strategyType: 'breakout_continuation',
      strategyConfidence: 'medium',
      autoExecutionAllowed: true,
      coachNote:
        'Breakout-friendly regime detected. Continuation strategy is preferred.',
    };
  }

  if (
    regime.trendFriendly &&
    cycle.continuationProbability >= 70
  ) {
    return {
      strategyType: 'trend_continuation',
      strategyConfidence: 'high',
      autoExecutionAllowed: true,
      coachNote:
        'Trend-friendly regime with cycle continuation support.',
    };
  }

  if (
    regime.meanReversionFriendly
  ) {
    return {
      strategyType: 'mean_reversion',
      strategyConfidence: 'medium',
      autoExecutionAllowed: false,
      coachNote:
        'Mean reversion conditions detected. Require confirmation before execution.',
    };
  }

  return {
    strategyType: 'stand_aside',
    strategyConfidence: 'low',
    autoExecutionAllowed: false,
    coachNote:
      'No clean strategy fit detected. Stand aside.',
  };
}