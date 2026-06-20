export interface ExecutionPlanInput {
  symbol: string;

  tradeSide:
    | 'long'
    | 'short';

  entryPrice: number;

  stopDistance: number;

  targetDistance: number;
}

export interface ExecutionPlan {
  entryPrice: number;

  stopPrice: number;

  targetPrice: number;

  riskPerUnit: number;

  rewardPerUnit: number;

  riskRewardRatio: number;

  coachNote: string;
}

export function buildExecutionPlan(
  input: ExecutionPlanInput,
): ExecutionPlan {
  const stopPrice =
    input.tradeSide === 'long'
      ? input.entryPrice -
        input.stopDistance
      : input.entryPrice +
        input.stopDistance;

  const targetPrice =
    input.tradeSide === 'long'
      ? input.entryPrice +
        input.targetDistance
      : input.entryPrice -
        input.targetDistance;

  const riskPerUnit =
    Math.abs(
      input.entryPrice -
        stopPrice,
    );

  const rewardPerUnit =
    Math.abs(
      targetPrice -
        input.entryPrice,
    );

  const riskRewardRatio =
    rewardPerUnit /
    Math.max(
      0.01,
      riskPerUnit,
    );

  return {
    entryPrice:
      input.entryPrice,

    stopPrice,

    targetPrice,

    riskPerUnit,

    rewardPerUnit,

    riskRewardRatio,

    coachNote:
      `Execution plan generated with ${riskRewardRatio.toFixed(
        2,
      )}:1 reward-to-risk.`,
  };
}