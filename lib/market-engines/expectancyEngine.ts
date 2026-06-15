import type {
  HistoricalProbability,
} from './historicalProbabilityEngine';

export interface ExpectancyAnalysis {
  expectancyR: number;

  positiveExpectancy: boolean;

  expectancyGrade:
    | 'elite'
    | 'strong'
    | 'neutral'
    | 'poor';

  coachNote: string;
}

export function analyzeExpectancy(
  historical:
    | HistoricalProbability
    | null,
): ExpectancyAnalysis {
  if (!historical) {
    return {
      expectancyR: 0,
      positiveExpectancy: false,
      expectancyGrade: 'neutral',
      coachNote:
        'No historical expectancy available.',
    };
  }

  const expectancyR =
    historical.expectancy;

  let expectancyGrade:
    ExpectancyAnalysis['expectancyGrade'] =
    'poor';

  if (expectancyR >= 2) {
    expectancyGrade = 'elite';
  } else if (
    expectancyR >= 1
  ) {
    expectancyGrade = 'strong';
  } else if (
    expectancyR >= 0
  ) {
    expectancyGrade = 'neutral';
  }

  return {
    expectancyR,

    positiveExpectancy:
      expectancyR > 0,

    expectancyGrade,

    coachNote:
      `Historical expectancy ${expectancyR.toFixed(
        2,
      )}R`,
  };
}