import type {
  OpportunityRanking,
} from './opportunityRankingEngine';

import type {
  TradeQualityAnalysis,
} from './tradeQualityEngine';

import type {
  StrategySelection,
} from './strategySelectionEngine';

import type {
  ProbabilityEstimate,
} from './probabilityContext';

export interface ExecutionGateAnalysis {
  approved: boolean;

  gateScore: number;

  rejectionReason?: string;

  coachNote: string;
}

export function evaluateExecutionGate({
  opportunity,
  tradeQuality,
  strategy,
  probability,
}: {
  opportunity: OpportunityRanking;

  tradeQuality: TradeQualityAnalysis;

  strategy: StrategySelection;

  probability: ProbabilityEstimate;
}): ExecutionGateAnalysis {
  let gateScore = 0;

  if (opportunity.rankable) {
    gateScore += 25;
  }

  if (
    tradeQuality.executionAllowed
  ) {
    gateScore += 25;
  }

  if (
    strategy.autoExecutionAllowed
  ) {
    gateScore += 25;
  }

  if (
    probability.probabilityConfidence ===
    'high'
  ) {
    gateScore += 25;
  } else if (
    probability.probabilityConfidence ===
    'medium'
  ) {
    gateScore += 15;
  }

  const approved =
    gateScore >= 70;

  return {
    approved,

    gateScore,

    rejectionReason:
      approved
        ? undefined
        : 'Execution gate not satisfied.',

    coachNote:
      approved
        ? 'Execution approved.'
        : 'Execution blocked.',
  };
}