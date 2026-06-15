import type {
  ProbabilityEstimate,
} from './probabilityContext';

import type {
  HistoricalProbability,
} from './historicalProbabilityEngine';

export interface BlendedProbability {
  longProbability: number;
  shortProbability: number;

  probabilityBias:
    | 'long'
    | 'short'
    | 'neutral';

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
  const historicalLongProbability =
    historical.winRate;

  const currentLongProbability =
    current.longProbability;

  const historicalWeight =
    historical.confidence === 'high'
      ? 0.55
      : historical.confidence === 'medium'
      ? 0.35
      : 0.15;

  const currentWeight =
    1 - historicalWeight;

  const longProbability =
    Math.round(
      currentLongProbability * currentWeight +
        historicalLongProbability * historicalWeight,
    );

  const shortProbability =
    100 - longProbability;

  let probabilityBias:
    | 'long'
    | 'short'
    | 'neutral' = 'neutral';

  if (longProbability >= shortProbability + 8) {
    probabilityBias = 'long';
  }

  if (shortProbability >= longProbability + 8) {
    probabilityBias = 'short';
  }

  return {
    longProbability,
    shortProbability,
    probabilityBias,
    confidence:
      historical.confidence,
    coachNote:
      `Blended probability uses current setup plus ${historical.sampleSize} historical samples.`,
  };
}