import {
  getPositions,
} from './client';

import {
  analyzePositions,
  type PositionState,
} from './positionStateEngine';

type RawTradovatePosition = {
  contractName?: string;
  netPos?: number;
  netPrice?: number;
  realizedPnL?: number;
  unrealizedPnL?: number;
};

export async function loadTradovatePositions() {
  try {
    const positions =
      await getPositions() as
        RawTradovatePosition[];

    const mapped:
      PositionState[] =
      positions
        .filter(
          (position) =>
            (position.netPos ?? 0) !== 0,
        )
        .map((position) => {
          const quantity =
            Math.abs(
              position.netPos ?? 0,
            );

          return {
            symbol:
              position.contractName ??
              'UNKNOWN',

            side:
              (position.netPos ?? 0) > 0
                ? 'long'
                : 'short',

            quantity,

            averagePrice:
              position.netPrice ?? 0,

            unrealizedPnL:
              position.unrealizedPnL ?? 0,
          };
        });

    return analyzePositions(mapped);
  } catch {
    return analyzePositions([]);
  }
}