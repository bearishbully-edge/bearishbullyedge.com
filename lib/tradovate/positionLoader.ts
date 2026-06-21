import {
  analyzePositions,
} from './positionStateEngine';

export async function loadTradovatePositions() {
  return analyzePositions([
    {
      symbol: 'MNQ',

      side: 'long',

      quantity: 1,

      averagePrice:
        21400,

      unrealizedPnL:
        50,
    },
  ]);
}