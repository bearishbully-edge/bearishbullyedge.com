export type LiquidityBias =
  | 'bullish'
  | 'bearish'
  | 'neutral';

export type SweepDirection =
  | 'buy_side'
  | 'sell_side'
  | 'none';

export type TargetLiquidityZone =
  | 'above'
  | 'below'
  | 'both'
  | 'none';

export interface LiquidityInput {
  symbol: string;

  equalHighs: boolean;
  equalLows: boolean;

  buySideLiquidityPresent: boolean;
  sellSideLiquidityPresent: boolean;

  buySideSweepDetected: boolean;
  sellSideSweepDetected: boolean;

  reclaimConfirmed: boolean;

  compressionDetected: boolean;
}

export interface LiquidityAnalysis {
  liquidityScore: number;

  liquidityBias: LiquidityBias;

  sweepDetected: boolean;
  sweepDirection: SweepDirection;

  buySideLiquidityPresent: boolean;
  sellSideLiquidityPresent: boolean;

  reclaimConfirmed: boolean;

  targetLiquidityZone: TargetLiquidityZone;

  stopRunProbability: number;

  coachNote: string;
}

export function analyzeLiquidity(
  input: LiquidityInput,
): LiquidityAnalysis {
  let score = 0;

  if (input.equalHighs) score += 10;
  if (input.equalLows) score += 10;

  if (input.buySideLiquidityPresent) score += 15;
  if (input.sellSideLiquidityPresent) score += 15;

  if (input.buySideSweepDetected) score += 20;
  if (input.sellSideSweepDetected) score += 20;

  if (input.reclaimConfirmed) score += 20;

  if (input.compressionDetected) score += 10;

  score = Math.min(100, score);

  const sweepDetected =
    input.buySideSweepDetected ||
    input.sellSideSweepDetected;

  let sweepDirection: SweepDirection = 'none';

  if (input.buySideSweepDetected) {
    sweepDirection = 'buy_side';
  }

  if (input.sellSideSweepDetected) {
    sweepDirection = 'sell_side';
  }

  let liquidityBias: LiquidityBias = 'neutral';

  if (
    input.sellSideSweepDetected &&
    input.reclaimConfirmed
  ) {
    liquidityBias = 'bullish';
  }

  if (
    input.buySideSweepDetected &&
    input.reclaimConfirmed
  ) {
    liquidityBias = 'bearish';
  }

  let targetLiquidityZone: TargetLiquidityZone = 'none';

  if (
    input.buySideLiquidityPresent &&
    input.sellSideLiquidityPresent
  ) {
    targetLiquidityZone = 'both';
  } else if (input.buySideLiquidityPresent) {
    targetLiquidityZone = 'above';
  } else if (input.sellSideLiquidityPresent) {
    targetLiquidityZone = 'below';
  }

  const stopRunProbability = Math.min(
    100,
    score + (input.compressionDetected ? 10 : 0),
  );

  let coachNote =
    'No significant liquidity event detected.';

  if (
    liquidityBias === 'bullish'
  ) {
    coachNote =
      'Sell-side liquidity swept and reclaimed. Look for expansion higher.';
  }

  if (
    liquidityBias === 'bearish'
  ) {
    coachNote =
      'Buy-side liquidity swept and reclaimed. Look for expansion lower.';
  }

  return {
    liquidityScore: score,

    liquidityBias,

    sweepDetected,
    sweepDirection,

    buySideLiquidityPresent:
      input.buySideLiquidityPresent,

    sellSideLiquidityPresent:
      input.sellSideLiquidityPresent,

    reclaimConfirmed:
      input.reclaimConfirmed,

    targetLiquidityZone,

    stopRunProbability,

    coachNote,
  };
}