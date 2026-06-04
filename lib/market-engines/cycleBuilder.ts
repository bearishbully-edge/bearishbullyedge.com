import {
  analyzeCycle,
  type CycleInput,
} from './cycleEngine';

import type {
  TrendAnalysis,
} from './trendEngine';

import type {
  MomentumAnalysis,
} from './momentumEngine';

import type {
  LiquidityAnalysis,
} from './liquidityEngine';

import type {
  DivergenceAnalysis,
} from './divergenceEngine';

import type {
  MarketStructureAnalysis,
} from './marketStructureEngine';

export function buildCycleInput(
  trend: TrendAnalysis,
  momentum: MomentumAnalysis,
  liquidity: LiquidityAnalysis,
  divergence: DivergenceAnalysis,
  structure: MarketStructureAnalysis,
): CycleInput {
  return {
    trendBullish:
      trend.trendDirection === 'bullish',

    trendBearish:
      trend.trendDirection === 'bearish',

    momentumStrong:
      momentum.momentumScore >= 60,

    momentumWeak:
      momentum.momentumScore < 60,

    liquidityBullish:
      liquidity.liquidityBias === 'bullish',

    liquidityBearish:
      liquidity.liquidityBias === 'bearish',

    breakoutDetected:
      structure.structureState ===
      'breakout',

    breakdownDetected:
      structure.structureState ===
      'breakdown',

    reversalWarning:
      divergence.reversalWarning,
  };
}

export function buildCycleAnalysis(
  trend: TrendAnalysis,
  momentum: MomentumAnalysis,
  liquidity: LiquidityAnalysis,
  divergence: DivergenceAnalysis,
  structure: MarketStructureAnalysis,
) {
  return analyzeCycle(
    buildCycleInput(
      trend,
      momentum,
      liquidity,
      divergence,
      structure,
    ),
  );
}