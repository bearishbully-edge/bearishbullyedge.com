import {
  buildProbabilityContextKey,
  type ProbabilityEstimate,
  type ScannerProbabilityContext,
} from './probabilityContext';

export function estimateSetupProbability(
  context: ScannerProbabilityContext,
): ProbabilityEstimate {
  let longProbability = 50;
  let shortProbability = 50;

  if (context.trendDirection === 'bullish') {
    longProbability += 10;
    shortProbability -= 10;
  }

  if (context.trendDirection === 'bearish') {
    shortProbability += 10;
    longProbability -= 10;
  }

  if (
    context.momentumState === 'bullish' ||
    context.momentumState === 'strong_bullish'
  ) {
    longProbability += 8;
    shortProbability -= 8;
  }

  if (
    context.momentumState === 'bearish' ||
    context.momentumState === 'strong_bearish'
  ) {
    shortProbability += 8;
    longProbability -= 8;
  }

  if (
    context.structureState === 'breakout' ||
    context.structureState === 'uptrend'
  ) {
    longProbability += 8;
    shortProbability -= 8;
  }

  if (
    context.structureState === 'breakdown' ||
    context.structureState === 'downtrend'
  ) {
    shortProbability += 8;
    longProbability -= 8;
  }

  if (context.structureState === 'failed_breakout') {
    shortProbability += 12;
    longProbability -= 12;
  }

  if (context.structureState === 'failed_breakdown') {
    longProbability += 12;
    shortProbability -= 12;
  }

  if (context.liquidityBias === 'bullish') {
    longProbability += 10;
    shortProbability -= 10;
  }

  if (context.liquidityBias === 'bearish') {
    shortProbability += 10;
    longProbability -= 10;
  }

  if (context.divergenceBias === 'bullish_reversal') {
    longProbability += 10;
    shortProbability -= 10;
  }

  if (context.divergenceBias === 'bearish_reversal') {
    shortProbability += 10;
    longProbability -= 10;
  }

  if (context.divergenceBias === 'bullish_continuation') {
    longProbability += 7;
    shortProbability -= 7;
  }

  if (context.divergenceBias === 'bearish_continuation') {
    shortProbability += 7;
    longProbability -= 7;
  }

  if (
    context.divergenceLocation === 'breakout_high' &&
    context.divergenceBias === 'bearish_reversal'
  ) {
    shortProbability += 12;
    longProbability -= 12;
  }

  if (
    context.divergenceLocation === 'breakdown_low' &&
    context.divergenceBias === 'bullish_reversal'
  ) {
    longProbability += 12;
    shortProbability -= 12;
  }

  if (context.reversalQuality === 'high') {
    if (context.divergenceBias === 'bearish_reversal') {
      shortProbability += 8;
      longProbability -= 8;
    }

    if (context.divergenceBias === 'bullish_reversal') {
      longProbability += 8;
      shortProbability -= 8;
    }
  }

  longProbability = Math.max(5, Math.min(95, longProbability));
  shortProbability = Math.max(5, Math.min(95, shortProbability));

  const total = longProbability + shortProbability;

  longProbability = Math.round((longProbability / total) * 100);
  shortProbability = 100 - longProbability;

  let probabilityBias: ProbabilityEstimate['probabilityBias'] = 'neutral';

  if (longProbability >= shortProbability + 8) {
    probabilityBias = 'long';
  }

  if (shortProbability >= longProbability + 8) {
    probabilityBias = 'short';
  }

  const edge = Math.abs(longProbability - shortProbability);

  let probabilityConfidence: ProbabilityEstimate['probabilityConfidence'] =
    'low';

  if (edge >= 30) {
    probabilityConfidence = 'high';
  } else if (edge >= 16) {
    probabilityConfidence = 'medium';
  }

  return {
    longProbability,
    shortProbability,
    probabilityBias,
    probabilityConfidence,
    contextKey: buildProbabilityContextKey(context),
    coachNote:
      probabilityBias === 'neutral'
        ? 'Probability model is balanced. Wait for stronger edge.'
        : `Probability model favors ${probabilityBias} with ${probabilityConfidence} confidence.`,
  };
}