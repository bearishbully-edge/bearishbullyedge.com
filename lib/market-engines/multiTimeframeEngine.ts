import type {
  TrendAnalysis,
} from './trendEngine';

export type MultiTimeframeAlignment =
  | 'fully_aligned_bullish'
  | 'fully_aligned_bearish'
  | 'partially_aligned'
  | 'conflicted'
  | 'unclear';

export interface TimeframeTrendSnapshot {
  timeframe: string;
  trendDirection: TrendAnalysis['trendDirection'];
  trendState: TrendAnalysis['trendState'];
  trendScore: number;
}

export interface MultiTimeframeAnalysis {
  alignment: MultiTimeframeAlignment;

  bullishTimeframes: number;
  bearishTimeframes: number;
  neutralTimeframes: number;

  higherTimeframeBias:
    | 'bullish'
    | 'bearish'
    | 'neutral';

  executionTimeframeAligned: boolean;

  alignmentScore: number;

  coachNote: string;
}

export function analyzeMultiTimeframe(
  snapshots: TimeframeTrendSnapshot[],
): MultiTimeframeAnalysis {
  const bullishTimeframes =
    snapshots.filter(
      (snapshot) =>
        snapshot.trendDirection === 'bullish',
    ).length;

  const bearishTimeframes =
    snapshots.filter(
      (snapshot) =>
        snapshot.trendDirection === 'bearish',
    ).length;

  const neutralTimeframes =
    snapshots.length -
    bullishTimeframes -
    bearishTimeframes;

  const higherTimeframes =
    snapshots.filter((snapshot) =>
      ['1h', '4h', 'daily', 'weekly'].includes(
        snapshot.timeframe,
      ),
    );

  const higherBullish =
    higherTimeframes.filter(
      (snapshot) =>
        snapshot.trendDirection === 'bullish',
    ).length;

  const higherBearish =
    higherTimeframes.filter(
      (snapshot) =>
        snapshot.trendDirection === 'bearish',
    ).length;

  let higherTimeframeBias:
    | 'bullish'
    | 'bearish'
    | 'neutral' =
    'neutral';

  if (higherBullish > higherBearish) {
    higherTimeframeBias = 'bullish';
  }

  if (higherBearish > higherBullish) {
    higherTimeframeBias = 'bearish';
  }

  const executionTimeframe =
    snapshots.find(
      (snapshot) =>
        snapshot.timeframe === '5m',
    ) ?? snapshots[0];

  const executionTimeframeAligned =
    Boolean(
      executionTimeframe &&
        executionTimeframe.trendDirection ===
          higherTimeframeBias,
    );

  let alignment: MultiTimeframeAlignment =
    'unclear';

  if (
    bullishTimeframes === snapshots.length
  ) {
    alignment = 'fully_aligned_bullish';
  } else if (
    bearishTimeframes === snapshots.length
  ) {
    alignment = 'fully_aligned_bearish';
  } else if (
    executionTimeframeAligned
  ) {
    alignment = 'partially_aligned';
  } else if (
    bullishTimeframes > 0 &&
    bearishTimeframes > 0
  ) {
    alignment = 'conflicted';
  }

  let alignmentScore = 50;

  if (
    alignment === 'fully_aligned_bullish' ||
    alignment === 'fully_aligned_bearish'
  ) {
    alignmentScore = 90;
  } else if (
    alignment === 'partially_aligned'
  ) {
    alignmentScore = 70;
  } else if (
    alignment === 'conflicted'
  ) {
    alignmentScore = 35;
  }

  return {
    alignment,

    bullishTimeframes,
    bearishTimeframes,
    neutralTimeframes,

    higherTimeframeBias,
    executionTimeframeAligned,

    alignmentScore,

    coachNote:
      `Multi-timeframe alignment classified as ${alignment}.`,
  };
}