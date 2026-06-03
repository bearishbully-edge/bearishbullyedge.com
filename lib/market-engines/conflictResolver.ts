import type { TrendAnalysis } from './trendEngine';
import type { MarketStructureAnalysis } from './marketStructureEngine';
import type { LiquidityAnalysis } from './liquidityEngine';
import type { DivergenceAnalysis } from './divergenceEngine';
import type { MomentumAnalysis } from './momentumEngine';

export interface ConflictResolution {
  conflictDetected: boolean;
  bullishVotes: number;
  bearishVotes: number;
  dominantBias: 'bullish' | 'bearish' | 'neutral';
  confidenceAdjustment: number;
  coachNote: string;
}

export function resolveConflicts(
  trend: TrendAnalysis,
  structure: MarketStructureAnalysis,
  liquidity: LiquidityAnalysis,
  divergence: DivergenceAnalysis,
  momentum: MomentumAnalysis,
): ConflictResolution {
  let bullishVotes = 0;
  let bearishVotes = 0;

  if (trend.trendDirection === 'bullish') bullishVotes++;
  if (trend.trendDirection === 'bearish') bearishVotes++;

  if (structure.bullishStructure) bullishVotes++;
  if (structure.bearishStructure) bearishVotes++;

  if (liquidity.liquidityBias === 'bullish') bullishVotes++;
  if (liquidity.liquidityBias === 'bearish') bearishVotes++;

  if (
    divergence.divergenceBias === 'bullish_reversal' ||
    divergence.divergenceBias === 'bullish_continuation'
  ) {
    bullishVotes++;
  }

  if (
    divergence.divergenceBias === 'bearish_reversal' ||
    divergence.divergenceBias === 'bearish_continuation'
  ) {
    bearishVotes++;
  }

  if (
    momentum.momentumState === 'bullish' ||
    momentum.momentumState === 'strong_bullish'
  ) {
    bullishVotes++;
  }

  if (
    momentum.momentumState === 'bearish' ||
    momentum.momentumState === 'strong_bearish'
  ) {
    bearishVotes++;
  }

  const voteSpread = Math.abs(bullishVotes - bearishVotes);
  const conflictDetected = voteSpread <= 1;

  let dominantBias: 'bullish' | 'bearish' | 'neutral' = 'neutral';

  if (bullishVotes > bearishVotes) dominantBias = 'bullish';
  if (bearishVotes > bullishVotes) dominantBias = 'bearish';

  let confidenceAdjustment = -25;

if (voteSpread >= 4) {
confidenceAdjustment = 12;
} else if (voteSpread >= 2) {
confidenceAdjustment = 4;
}

  return {
    conflictDetected,
    bullishVotes,
    bearishVotes,
    dominantBias,
    confidenceAdjustment,
    coachNote: conflictDetected
      ? 'Engine conflict detected. Reduce confidence.'
      : 'Engine alignment detected.',
  };
}