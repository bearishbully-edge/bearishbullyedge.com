import {
  buildHistoricalOutcomeFromRecords,
} from './historicalOutcomeRepository';

import {
  calculateHistoricalProbability,
  type HistoricalProbability,
} from './historicalProbabilityEngine';

export function loadHistoricalProbability(
  contextFingerprint: string,
): HistoricalProbability | null {
  const historicalOutcome =
    buildHistoricalOutcomeFromRecords(
      contextFingerprint,
    );

  if (!historicalOutcome) {
    return null;
  }

  return calculateHistoricalProbability(
    historicalOutcome,
  );
}