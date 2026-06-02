export type MomentumState =
  | 'strong_bullish'
  | 'bullish'
  | 'neutral'
  | 'bearish'
  | 'strong_bearish';

export interface MomentumInput {
  symbol: string;
  macdBullish: boolean;
  stochasticBullish: boolean;
  aboveZeroLine: boolean;
  momentumIncreasing: boolean;
  momentumDecreasing: boolean;
}

export interface MomentumAnalysis {
  momentumScore: number;
  momentumState: MomentumState;
  momentumAligned: boolean;
  coachNote: string;
}

export function analyzeMomentum(
  input: MomentumInput,
): MomentumAnalysis {
  let score = 50;

  if (input.macdBullish) score += 15;
  else score -= 15;

  if (input.stochasticBullish) score += 15;
  else score -= 15;

  if (input.aboveZeroLine) score += 10;
  else score -= 10;

  if (input.momentumIncreasing) score += 10;

  if (input.momentumDecreasing) score -= 10;

  score = Math.max(0, Math.min(100, score));

  let momentumState: MomentumState = 'neutral';

  if (score >= 80) {
    momentumState = 'strong_bullish';
  } else if (score >= 60) {
    momentumState = 'bullish';
  } else if (score <= 20) {
    momentumState = 'strong_bearish';
  } else if (score <= 40) {
    momentumState = 'bearish';
  }

  return {
    momentumScore: score,
    momentumState,
    momentumAligned: momentumState !== 'neutral',
    coachNote:
      momentumState === 'strong_bullish'
        ? 'Momentum strongly favors buyers.'
        : momentumState === 'bullish'
        ? 'Momentum favors buyers.'
        : momentumState === 'strong_bearish'
        ? 'Momentum strongly favors sellers.'
        : momentumState === 'bearish'
        ? 'Momentum favors sellers.'
        : 'Momentum is neutral.',
  };
}