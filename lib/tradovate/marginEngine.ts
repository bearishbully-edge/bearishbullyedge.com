export interface MarginAnalysis {
  marginRequired: number;

  marginAvailable: number;

  marginApproved: boolean;
}

export function evaluateMargin(
  required: number,
  available: number,
): MarginAnalysis {
  return {
    marginRequired:
      required,

    marginAvailable:
      available,

    marginApproved:
      available >= required,
  };
}