import type {
  HistoricalOutcome,
} from './historicalProbabilityEngine';

export interface ContextStatistics {
  contextKey: string;

  sampleSize: number;

  winRate: number;

  expectancy: number;

  averageWinner: number;
  averageLoser: number;

  profitable: boolean;
}

export function buildContextStatistics(
  outcome: HistoricalOutcome,
): ContextStatistics {
  const sampleSize =
    outcome.wins +
    outcome.losses;

  const winRate =
    sampleSize === 0
      ? 0
      : (
          outcome.wins /
          sampleSize
        ) *
        100;

  const expectancy =
    (
      (winRate / 100) *
      outcome.averageWinner
    ) -
    (
      ((100 - winRate) / 100) *
      outcome.averageLoser
    );

  return {
    contextKey:
      outcome.contextKey,

    sampleSize,

    winRate,

    expectancy,

    averageWinner:
      outcome.averageWinner,

    averageLoser:
      outcome.averageLoser,

    profitable:
      expectancy > 0,
  };
}