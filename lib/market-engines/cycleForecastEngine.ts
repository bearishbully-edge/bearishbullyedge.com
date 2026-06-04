import type {
  CycleAnalysis,
} from './cycleEngine';

import type {
  CyclePhaseResolution,
} from './cyclePhaseResolver';

export interface CycleForecast {
  nextLikelyPhase: string;

  transitionProbability: number;

  expectedReactionDelayBars: number;

  marketPressure: 'building' | 'active' | 'exhausting';

  coachNote: string;
}

export function forecastCycle(
  cycle: CycleAnalysis,
  phase: CyclePhaseResolution,
): CycleForecast {
  let nextLikelyPhase =
    cycle.cyclePhase;

  let transitionProbability = 25;

  let expectedReactionDelayBars = 5;

  let marketPressure:
    | 'building'
    | 'active'
    | 'exhausting' =
    'active';

  if (
    phase.phaseAge === 'early'
  ) {
    transitionProbability = 20;

    marketPressure =
      'building';

    expectedReactionDelayBars = 8;
  }

  if (
    phase.phaseAge === 'middle'
  ) {
    transitionProbability = 40;

    marketPressure =
      'active';

    expectedReactionDelayBars = 5;
  }

  if (
    phase.phaseAge === 'late'
  ) {
    transitionProbability = 75;

    marketPressure =
      'exhausting';

    expectedReactionDelayBars = 3;
  }

  return {
    nextLikelyPhase,

    transitionProbability,

    expectedReactionDelayBars,

    marketPressure,

    coachNote:
      'Cycle forecast generated from current phase maturity.',
  };
}