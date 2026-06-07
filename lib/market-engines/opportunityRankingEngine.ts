import type {
  TradeQualityAnalysis,
} from './tradeQualityEngine';

import type {
  ProbabilityEstimate,
} from './probabilityContext';

import type {
  CycleForecast,
} from './cycleForecastEngine';

import type {
  RegimeAnalysis,
} from './regimeEngine';

export interface OpportunityRankingInput {
  confidenceScore: number;
  probability: ProbabilityEstimate;
  tradeQuality: TradeQualityAnalysis;
  cycleForecast: CycleForecast;
  regime: RegimeAnalysis;
}

export interface OpportunityRanking {
  opportunityScore: number;
  opportunityGrade: 'elite' | 'strong' | 'qualified' | 'weak' | 'avoid';
  rankable: boolean;
  coachNote: string;
}

export function rankOpportunity(
  input: OpportunityRankingInput,
): OpportunityRanking {
  let opportunityScore = 0;

  opportunityScore += input.confidenceScore * 0.35;
  opportunityScore += input.tradeQuality.qualityScore * 0.35;

  if (
    input.probability.probabilityConfidence === 'high'
  ) {
    opportunityScore += 15;
  }

  if (
    input.probability.probabilityConfidence === 'medium'
  ) {
    opportunityScore += 8;
  }

  if (
    input.cycleForecast.marketPressure === 'active'
  ) {
    opportunityScore += 5;
  }

  if (
    input.cycleForecast.marketPressure === 'exhausting'
  ) {
    opportunityScore -= 8;
  }

  if (
    input.regime.cautionRequired
  ) {
    opportunityScore -= 10;
  }

  opportunityScore = Math.round(
    Math.max(
      0,
      Math.min(100, opportunityScore),
    ),
  );

  let opportunityGrade:
    OpportunityRanking['opportunityGrade'] =
    'avoid';

  if (opportunityScore >= 90) {
    opportunityGrade = 'elite';
  } else if (opportunityScore >= 80) {
    opportunityGrade = 'strong';
  } else if (opportunityScore >= 70) {
    opportunityGrade = 'qualified';
  } else if (opportunityScore >= 55) {
    opportunityGrade = 'weak';
  }

  return {
    opportunityScore,
    opportunityGrade,
    rankable:
      opportunityGrade !== 'avoid',
    coachNote:
      `Opportunity ranked ${opportunityGrade} with score ${opportunityScore}.`,
  };
}