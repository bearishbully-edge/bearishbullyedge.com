export interface PositionSizingInput {
  accountBalance: number;

  riskPercent: number;

  riskPerUnit: number;
}

export interface PositionSizingAnalysis {
  maxRiskAmount: number;

  quantity: number;

  coachNote: string;
}

export function calculatePositionSize(
  input: PositionSizingInput,
): PositionSizingAnalysis {
  const maxRiskAmount =
    input.accountBalance *
    (
      input.riskPercent /
      100
    );

  const quantity =
    Math.max(
      1,
      Math.floor(
        maxRiskAmount /
          Math.max(
            0.01,
            input.riskPerUnit,
          ),
      ),
    );

  return {
    maxRiskAmount,

    quantity,

    coachNote:
      `Position size calculated at ${quantity} contracts.`,
  };
}