import {
  probabilityRepository,
} from './probabilityRepository';

import type {
  HistoricalOutcome,
} from './historicalProbabilityEngine';

import {
  saveTradeContextOutcome,
} from './historicalOutcomeRepository';

export interface TradeOutcomeInput {
  contextFingerprint: string;

  symbol?: string;

  timeframe?: string;

  tradeSide?: 'long' | 'short';

  won: boolean;

  pnlR: number;
}

export function recordTradeOutcome(
  input: TradeOutcomeInput,
): HistoricalOutcome {
  saveTradeContextOutcome({
    contextFingerprint:
      input.contextFingerprint,

    symbol:
      input.symbol ?? 'UNKNOWN',

    timeframe:
      input.timeframe ?? 'unknown',

    tradeSide:
      input.tradeSide ?? 'long',

    won:
      input.won,

    pnlR:
      input.pnlR,
  });

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