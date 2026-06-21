export interface PnLAnalysis {
  realizedPnL: number;

  unrealizedPnL: number;

  totalPnL: number;
}

export function analyzePnL(
  realized: number,
  unrealized: number,
): PnLAnalysis {
  return {
    realizedPnL:
      realized,

    unrealizedPnL:
      unrealized,

    totalPnL:
      realized + unrealized,
  };
}