export interface PositionState {
  symbol: string;

  side:
    | 'long'
    | 'short';

  quantity: number;

  averagePrice: number;

  unrealizedPnL: number;
}

export interface PositionIntelligence {
  openPositions: PositionState[];

  totalExposure: number;

  longExposure: number;

  shortExposure: number;

  coachNote: string;
}

export function analyzePositions(
  positions: PositionState[],
): PositionIntelligence {
  const longExposure =
    positions
      .filter(
        (p) => p.side === 'long',
      )
      .reduce(
        (sum, p) =>
          sum + p.quantity,
        0,
      );

  const shortExposure =
    positions
      .filter(
        (p) => p.side === 'short',
      )
      .reduce(
        (sum, p) =>
          sum + p.quantity,
        0,
      );

  return {
    openPositions:
      positions,

    totalExposure:
      longExposure +
      shortExposure,

    longExposure,

    shortExposure,

    coachNote:
      'Position intelligence generated.',
  };
}