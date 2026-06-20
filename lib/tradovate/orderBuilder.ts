import type {
  ExecutionPlan,
} from '@/lib/market-engines/executionPlanEngine';

import type {
  PositionSizingAnalysis,
} from '@/lib/market-engines/positionSizingEngine';

export function buildTradovateOrder(
  executionPlan: ExecutionPlan,
  positionSizing:
    PositionSizingAnalysis,
  tradeSide:
    | 'long'
    | 'short',
) {
  return {
    action:
      tradeSide === 'long'
        ? 'Buy'
        : 'Sell',

    quantity:
      positionSizing.quantity,

    entryPrice:
      executionPlan.entryPrice,

    stopPrice:
      executionPlan.stopPrice,

    targetPrice:
      executionPlan.targetPrice,
  };
}