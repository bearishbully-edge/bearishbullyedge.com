import type {
  PositionIntelligence,
} from './positionStateEngine';

export interface PositionConflict {
  sameDirection:
    boolean;

  oppositeDirection:
    boolean;

  scaleInAllowed:
    boolean;

  coachNote: string;
}

export function evaluatePositionConflict(
  symbol: string,

  tradeSide:
    | 'long'
    | 'short',

  positions:
    PositionIntelligence,
): PositionConflict {
  const existing =
    positions.openPositions.find(
      (p) =>
        p.symbol === symbol,
    );

  if (!existing) {
    return {
      sameDirection:
        false,

      oppositeDirection:
        false,

      scaleInAllowed:
        true,

      coachNote:
        'No existing position.',
    };
  }

  const sameDirection =
    existing.side ===
    tradeSide;

  const oppositeDirection =
    existing.side !==
    tradeSide;

  return {
    sameDirection,

    oppositeDirection,

    scaleInAllowed:
      sameDirection,

    coachNote:
      oppositeDirection
        ? 'Opposite position detected.'
        : 'Scale-in eligible.',
  };
}