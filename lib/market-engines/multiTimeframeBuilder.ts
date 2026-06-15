import {
  analyzeTrend,
} from './trendEngine';

import {
  analyzeMultiTimeframe,
  type MultiTimeframeAnalysis,
  type TimeframeTrendSnapshot,
} from './multiTimeframeEngine';

function buildSyntheticTimeframeTrendInput(
  symbol: string,
  timeframe: string,
) {
  const seed =
    symbol
      .split('')
      .reduce(
        (sum, char) =>
          sum + char.charCodeAt(0),
        0,
      ) + timeframe.length;

  return {
    symbol,
    priceAbove10Sma: seed % 2 === 0,
    priceAbove20Ema: seed % 3 !== 0,
    priceAbove50Sma: seed % 5 !== 0,
    higherHighs: seed % 4 === 0,
    higherLows: seed % 6 !== 0,
    lowerHighs: seed % 7 === 0,
    lowerLows: seed % 5 === 0,
    rangeBound: seed % 11 === 0,
  };
}

export function buildSyntheticMultiTimeframeAnalysis(
  symbol: string,
): MultiTimeframeAnalysis {
  const timeframes = [
    '5m',
    '15m',
    '1h',
    '4h',
    'daily',
  ];

  const snapshots:
    TimeframeTrendSnapshot[] =
    timeframes.map((timeframe) => {
      const trend =
        analyzeTrend(
          buildSyntheticTimeframeTrendInput(
            symbol,
            timeframe,
          ),
        );

      return {
        timeframe,
        trendDirection:
          trend.trendDirection,
        trendState:
          trend.trendState,
        trendScore:
          trend.trendScore,
      };
    });

  return analyzeMultiTimeframe(
    snapshots,
  );
}