export type TrendDirection = 'bullish' | 'bearish' | 'neutral';

export type TrendState =
  | 'strong_uptrend'
  | 'weak_uptrend'
  | 'strong_downtrend'
  | 'weak_downtrend'
  | 'range';

export interface TrendInput {
  symbol: string;
  priceAbove10Sma: boolean;
  priceAbove20Ema: boolean;
  priceAbove50Sma: boolean;
  higherHighs: boolean;
  higherLows: boolean;
  lowerHighs: boolean;
  lowerLows: boolean;
  rangeBound: boolean;
}

export interface TrendAnalysis {
  trendScore: number;
  trendDirection: TrendDirection;
  trendState: TrendState;
  trendAligned: boolean;
  trendStrength: number;
  coachNote: string;
}

export function analyzeTrend(input: TrendInput): TrendAnalysis {
  let bullishScore = 0;
  let bearishScore = 0;

  if (input.priceAbove10Sma) bullishScore += 15;
  else bearishScore += 10;

  if (input.priceAbove20Ema) bullishScore += 15;
  else bearishScore += 10;

  if (input.priceAbove50Sma) bullishScore += 20;
  else bearishScore += 15;

  if (input.higherHighs) bullishScore += 15;
  if (input.higherLows) bullishScore += 15;

  if (input.lowerHighs) bearishScore += 15;
  if (input.lowerLows) bearishScore += 15;

  if (input.rangeBound) {
    bullishScore = Math.max(0, bullishScore - 20);
    bearishScore = Math.max(0, bearishScore - 20);
  }

  const rawScore = Math.max(bullishScore, bearishScore);
  const trendScore = Math.min(100, rawScore);

  let trendDirection: TrendDirection = 'neutral';

  if (bullishScore > bearishScore + 10) {
    trendDirection = 'bullish';
  }

  if (bearishScore > bullishScore + 10) {
    trendDirection = 'bearish';
  }

  let trendState: TrendState = 'range';

  if (trendDirection === 'bullish' && trendScore >= 70) {
    trendState = 'strong_uptrend';
  } else if (trendDirection === 'bullish') {
    trendState = 'weak_uptrend';
  } else if (trendDirection === 'bearish' && trendScore >= 70) {
    trendState = 'strong_downtrend';
  } else if (trendDirection === 'bearish') {
    trendState = 'weak_downtrend';
  }

  const trendAligned = trendDirection !== 'neutral';
  const trendStrength = trendScore;

  let coachNote =
    'Market is range-bound or unclear. Wait for stronger directional evidence.';

  if (trendState === 'strong_uptrend') {
    coachNote =
      'Strong uptrend detected. Favor long setups that align with trend continuation.';
  }

  if (trendState === 'weak_uptrend') {
    coachNote =
      'Weak uptrend detected. Long setups may qualify, but confirmation is required.';
  }

  if (trendState === 'strong_downtrend') {
    coachNote =
      'Strong downtrend detected. Favor short setups that align with trend continuation.';
  }

  if (trendState === 'weak_downtrend') {
    coachNote =
      'Weak downtrend detected. Short setups may qualify, but confirmation is required.';
  }

  return {
    trendScore,
    trendDirection,
    trendState,
    trendAligned,
    trendStrength,
    coachNote,
  };
}