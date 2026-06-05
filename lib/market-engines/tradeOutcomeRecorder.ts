import {
  probabilityRepository,
} from './probabilityRepository';

import type {
  HistoricalOutcome,
} from './historicalProbabilityEngine';

export interface TradeOutcomeInput {
  contextFingerprint: string;

  won: boolean;

  pnlR: number;
}

export function recordTradeOutcome(
  input: TradeOutcomeInput,
): HistoricalOutcome {
  const existing =
    probabilityRepository[
      input.contextFingerprint
    ];

  const outcome: HistoricalOutcome =
    existing ?? {
      contextKey:
        input.contextFingerprint,

      wins: 0,
      losses: 0,

      averageWinner: 0,
      averageLoser: 0,
    };

  if (input.won) {
    outcome.wins += 1;

    outcome.averageWinner =
      (
        outcome.averageWinner *
          (outcome.wins - 1) +
        Math.abs(input.pnlR)
      ) /
      outcome.wins;
  } else {
    outcome.losses += 1;

    outcome.averageLoser =
      (
        outcome.averageLoser *
          (outcome.losses - 1) +
        Math.abs(input.pnlR)
      ) /
      outcome.losses;
  }

  probabilityRepository[
    input.contextFingerprint
  ] = outcome;

  return outcome;
}