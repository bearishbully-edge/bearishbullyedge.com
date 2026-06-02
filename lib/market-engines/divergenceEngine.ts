export type DivergenceType =
  | 'regular_bullish'
  | 'regular_bearish'
  | 'hidden_bullish'
  | 'hidden_bearish'
  | 'volume_bullish'
  | 'volume_bearish'
  | 'delta_bullish'
  | 'delta_bearish'
  | 'none';

export type DivergenceBias =
  | 'bullish_reversal'
  | 'bearish_reversal'
  | 'bullish_continuation'
  | 'bearish_continuation'
  | 'neutral';

export interface DivergenceInput {
  symbol: string;

  priceMakingHigherHigh: boolean;
  priceMakingLowerLow: boolean;
  priceMakingHigherLow: boolean;
  priceMakingLowerHigh: boolean;

  momentumMakingHigherHigh: boolean;
  momentumMakingLowerLow: boolean;
  momentumMakingHigherLow: boolean;
  momentumMakingLowerHigh: boolean;

  volumeIncreasing: boolean;
  volumeDecreasing: boolean;

  deltaIncreasing: boolean;
  deltaDecreasing: boolean;
}

export interface DivergenceAnalysis {
  divergenceDetected: boolean;
  divergenceType: DivergenceType;
  divergenceBias: DivergenceBias;
  divergenceScore: number;
  reversalWarning: boolean;
  continuationSignal: boolean;
  coachNote: string;
}

export function analyzeDivergence(
  input: DivergenceInput,
): DivergenceAnalysis {
  let divergenceType: DivergenceType = 'none';
  let divergenceBias: DivergenceBias = 'neutral';
  let divergenceScore = 0;

  // Regular bearish divergence:
  // Price makes a higher high, but momentum does not confirm.
  if (
    input.priceMakingHigherHigh &&
    input.momentumMakingLowerHigh
  ) {
    divergenceType = 'regular_bearish';
    divergenceBias = 'bearish_reversal';
    divergenceScore = 85;
  }

  // Regular bullish divergence:
  // Price makes a lower low, but momentum does not confirm.
  if (
    input.priceMakingLowerLow &&
    input.momentumMakingHigherLow
  ) {
    divergenceType = 'regular_bullish';
    divergenceBias = 'bullish_reversal';
    divergenceScore = 85;
  }

  // Hidden bullish divergence:
  // Price makes a higher low, momentum makes a lower low.
  // Usually continuation in an uptrend.
  if (
    input.priceMakingHigherLow &&
    input.momentumMakingLowerLow
  ) {
    divergenceType = 'hidden_bullish';
    divergenceBias = 'bullish_continuation';
    divergenceScore = 75;
  }

  // Hidden bearish divergence:
  // Price makes a lower high, momentum makes a higher high.
  // Usually continuation in a downtrend.
  if (
    input.priceMakingLowerHigh &&
    input.momentumMakingHigherHigh
  ) {
    divergenceType = 'hidden_bearish';
    divergenceBias = 'bearish_continuation';
    divergenceScore = 75;
  }

  // Volume divergence overlays.
  if (
    divergenceType === 'none' &&
    input.priceMakingHigherHigh &&
    input.volumeDecreasing
  ) {
    divergenceType = 'volume_bearish';
    divergenceBias = 'bearish_reversal';
    divergenceScore = 65;
  }

  if (
    divergenceType === 'none' &&
    input.priceMakingLowerLow &&
    input.volumeDecreasing
  ) {
    divergenceType = 'volume_bullish';
    divergenceBias = 'bullish_reversal';
    divergenceScore = 65;
  }

  // Delta divergence overlays.
  if (
    divergenceType === 'none' &&
    input.priceMakingHigherHigh &&
    input.deltaDecreasing
  ) {
    divergenceType = 'delta_bearish';
    divergenceBias = 'bearish_reversal';
    divergenceScore = 70;
  }

  if (
    divergenceType === 'none' &&
    input.priceMakingLowerLow &&
    input.deltaIncreasing
  ) {
    divergenceType = 'delta_bullish';
    divergenceBias = 'bullish_reversal';
    divergenceScore = 70;
  }

  const divergenceDetected = divergenceType !== 'none';

  const reversalWarning =
    divergenceBias === 'bullish_reversal' ||
    divergenceBias === 'bearish_reversal';

  const continuationSignal =
    divergenceBias === 'bullish_continuation' ||
    divergenceBias === 'bearish_continuation';

  let coachNote = 'No meaningful divergence detected.';

  if (divergenceType === 'regular_bearish') {
    coachNote =
      'Regular bearish divergence detected. Price is making a higher high while momentum weakens. Watch for reversal risk.';
  }

  if (divergenceType === 'regular_bullish') {
    coachNote =
      'Regular bullish divergence detected. Price is making a lower low while momentum improves. Watch for reversal potential.';
  }

  if (divergenceType === 'hidden_bullish') {
    coachNote =
      'Hidden bullish divergence detected. Trend continuation may be favored if broader trend remains bullish.';
  }

  if (divergenceType === 'hidden_bearish') {
    coachNote =
      'Hidden bearish divergence detected. Trend continuation may be favored if broader trend remains bearish.';
  }

  if (divergenceType === 'volume_bearish') {
    coachNote =
      'Bearish volume divergence detected. Price is advancing with weakening participation.';
  }

  if (divergenceType === 'volume_bullish') {
    coachNote =
      'Bullish volume divergence detected. Price is declining with weakening selling participation.';
  }

  if (divergenceType === 'delta_bearish') {
    coachNote =
      'Bearish delta divergence detected. Price is advancing while aggressive buying weakens.';
  }

  if (divergenceType === 'delta_bullish') {
    coachNote =
      'Bullish delta divergence detected. Price is declining while aggressive selling weakens.';
  }

  return {
    divergenceDetected,
    divergenceType,
    divergenceBias,
    divergenceScore,
    reversalWarning,
    continuationSignal,
    coachNote,
  };
}