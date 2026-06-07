import type {
  ProbabilityEstimate,
} from './probabilityContext';

import type {
  CycleAnalysis,
} from './cycleEngine';

import type {
  RegimeAnalysis,
} from './regimeEngine';

import type {
  StrategySelection,
} from './strategySelectionEngine';

export type TradeQualityGrade =
  | 'A+'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'avoid';

export interface TradeQualityAnalysis {
  qualityScore: number;
  qualityGrade: TradeQualityGrade;
  executionAllowed: boolean;
  coachNote: string;
}

export function analyzeTradeQuality({
  probability,
  cycle,
  regime,
  strategy,
}: {
  probability: ProbabilityEstimate;
  cycle: CycleAnalysis;
  regime: RegimeAnalysis;
  strategy: StrategySelection;
}): TradeQualityAnalysis {
  let qualityScore = 50;

  if (
    probability.probabilityConfidence === 'high'
  ) {
    qualityScore += 20;
  }

  if (
    probability.probabilityConfidence === 'medium'
  ) {
    qualityScore += 10;
  }

  if (
    cycle.continuationProbability >= 75
  ) {
    qualityScore += 10;
  }

  if (
    regime.cautionRequired
  ) {
    qualityScore -= 15;
  }

  if (
    strategy.strategyConfidence === 'high'
  ) {
    qualityScore += 15;
  }

  if (
    strategy.strategyType === 'stand_aside'
  ) {
    qualityScore -= 35;
  }

  qualityScore = Math.max(
    0,
    Math.min(100, qualityScore),
  );

  let qualityGrade: TradeQualityGrade = 'D';

  if (qualityScore >= 90) qualityGrade = 'A+';
  else if (qualityScore >= 80) qualityGrade = 'A';
  else if (qualityScore >= 70) qualityGrade = 'B';
  else if (qualityScore >= 60) qualityGrade = 'C';

  if (qualityScore < 45) {
    qualityGrade = 'avoid';
  }

  return {
    qualityScore,
    qualityGrade,
    executionAllowed:
      qualityScore >= 70 &&
      strategy.autoExecutionAllowed,

    coachNote:
      `Trade quality graded ${qualityGrade} with score ${qualityScore}.`,
  };
}