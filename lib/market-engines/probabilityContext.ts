import type { TrendAnalysis } from './trendEngine';
import type { MomentumAnalysis } from './momentumEngine';
import type { LiquidityAnalysis } from './liquidityEngine';
import type { DivergenceAnalysis } from './divergenceEngine';
import type { MarketStructureAnalysis } from './marketStructureEngine';
import type { DivergenceLocationAnalysis } from './divergenceLocationResolver';

export interface ScannerProbabilityContext {
  symbol: string;
  trendState: TrendAnalysis['trendState'];
  trendDirection: TrendAnalysis['trendDirection'];
  momentumState: MomentumAnalysis['momentumState'];
  structureState: MarketStructureAnalysis['structureState'];
  liquidityBias: LiquidityAnalysis['liquidityBias'];
  sweepDirection: LiquidityAnalysis['sweepDirection'];
  divergenceType: DivergenceAnalysis['divergenceType'];
  divergenceBias: DivergenceAnalysis['divergenceBias'];
  divergenceLocation: DivergenceLocationAnalysis['location'];
  reversalQuality: DivergenceLocationAnalysis['reversalQuality'];
  continuationQuality: DivergenceLocationAnalysis['continuationQuality'];
}

export interface ProbabilityEstimate {
  longProbability: number;
  shortProbability: number;
  probabilityBias: 'long' | 'short' | 'neutral';
  probabilityConfidence: 'high' | 'medium' | 'low';
  contextKey: string;
  coachNote: string;
}

export function buildProbabilityContextKey(
  context: ScannerProbabilityContext,
): string {
  return [
    context.trendState,
    context.momentumState,
    context.structureState,
    context.liquidityBias,
    context.sweepDirection,
    context.divergenceType,
    context.divergenceLocation,
  ].join('|');
}