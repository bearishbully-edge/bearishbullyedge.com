import {
  analyzePositions,
} from './positionStateEngine';

export async function loadTradovatePositions() {
  /*
   Tradovate positions endpoint will replace this synthetic fallback.
  */

  return analyzePositions([]);
}