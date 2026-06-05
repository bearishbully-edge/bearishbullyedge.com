export interface HistoricalOutcome {
  contextKey: string;

  wins: number;
  losses: number;

  averageWinner: number;
  averageLoser: number;
}

export interface HistoricalProbability {
  contextKey: string;

  sampleSize: number;

  winRate: number;
  lossRate: number;

  expectancy: number;

  confidence: 'low' | 'medium' | 'high';

  coachNote: string;
}

export function calculateHistoricalProbability(
  outcome: HistoricalOutcome,
): HistoricalProbability {
  const sampleSize =
    outcome.wins + outcome.losses;

  const winRate =
    sampleSize === 0
      ? 50
      : Math.round(
          (outcome.wins / sampleSize) *
            100,
        );

  const lossRate =
    100 - winRate;

  const expectancy =
    (
      (winRate / 100) *
      outcome.averageWinner
    ) -
    (
      (lossRate / 100) *
      outcome.averageLoser
    );

  let confidence:
    | 'low'
    | 'medium'
    | 'high' = 'low';

  if (sampleSize >= 100) {
    confidence = 'high';
  } else if (
    sampleSize >= 30
  ) {
    confidence = 'medium';
  }

  return {
    contextKey:
      outcome.contextKey,

    sampleSize,

    winRate,

    lossRate,

    expectancy,

    confidence,

    coachNote:
      `Historical win rate ${winRate}% across ${sampleSize} samples.`,
  };
}