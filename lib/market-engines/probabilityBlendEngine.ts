import type {
  ProbabilityEstimate,
} from './probabilityContext';

import type {
  HistoricalProbability,
} from './historicalProbabilityEngine';

export interface BlendedProbability {
  longProbability: number;
  shortProbability: number;

  confidence:
    | 'low'
    | 'medium'
    | 'high';

  coachNote: string;
}

export function blendProbabilities(
  current: ProbabilityEstimate,
  historical: HistoricalProbability,
): BlendedProbability {
  const historicalBias =
    historical.winRate;

  const currentBias =
    current.longProbability;

  const longProbability =
    Math.round(
      currentBias * 0.7 +
      historicalBias * 0.3,
    );

  const shortProbability =
    100 - longProbability;

  return {
    longProbability,
    shortProbability,
    confidence:
      historical.confidence,
    coachNote:
      'Probability blended using current context and historical outcomes.',
  };
}