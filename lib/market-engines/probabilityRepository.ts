import type {
  HistoricalOutcome,
} from './historicalProbabilityEngine';

export const probabilityRepository:
  Record<
    string,
    HistoricalOutcome
  > = {};