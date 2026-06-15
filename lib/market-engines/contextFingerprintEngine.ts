import type {
  ScannerProbabilityContext,
} from './probabilityContext';

export function buildContextFingerprint(
  context:
    ScannerProbabilityContext,
): string {
return [
    context.symbol,
    context.timeframe,
    context.trendState,

    context.momentumState,

    context.structureState,

    context.liquidityBias,

    context.sweepDirection,

    context.divergenceType,

    context.divergenceLocation,
  ].join('|');
}