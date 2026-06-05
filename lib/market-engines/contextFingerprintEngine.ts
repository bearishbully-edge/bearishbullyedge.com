import type {
  ScannerProbabilityContext,
} from './probabilityContext';

export function buildContextFingerprint(
  context:
    ScannerProbabilityContext,
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