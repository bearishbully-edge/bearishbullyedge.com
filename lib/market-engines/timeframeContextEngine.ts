export type Timeframe =
  | '1m'
  | '5m'
  | '15m'
  | '30m'
  | '1h'
  | '4h'
  | 'daily';

export interface TimeframeContext {
  timeframe: Timeframe;

  averageConditionLifeBars: number;

  averageReactionDelayBars: number;

  averageTrendPersistenceBars: number;

  averageLiquidityPersistenceBars: number;

  averageDivergencePersistenceBars: number;

  averageStructurePersistenceBars: number;
}

export function getTimeframeContext(
  timeframe: Timeframe,
): TimeframeContext {
  const configs: Record<
    Timeframe,
    TimeframeContext
  > = {
    '1m': {
      timeframe: '1m',
      averageConditionLifeBars: 15,
      averageReactionDelayBars: 3,
      averageTrendPersistenceBars: 30,
      averageLiquidityPersistenceBars: 8,
      averageDivergencePersistenceBars: 6,
      averageStructurePersistenceBars: 20,
    },

    '5m': {
      timeframe: '5m',
      averageConditionLifeBars: 18,
      averageReactionDelayBars: 4,
      averageTrendPersistenceBars: 40,
      averageLiquidityPersistenceBars: 10,
      averageDivergencePersistenceBars: 8,
      averageStructurePersistenceBars: 25,
    },

    '15m': {
      timeframe: '15m',
      averageConditionLifeBars: 20,
      averageReactionDelayBars: 5,
      averageTrendPersistenceBars: 50,
      averageLiquidityPersistenceBars: 12,
      averageDivergencePersistenceBars: 10,
      averageStructurePersistenceBars: 30,
    },

    '30m': {
      timeframe: '30m',
      averageConditionLifeBars: 24,
      averageReactionDelayBars: 6,
      averageTrendPersistenceBars: 60,
      averageLiquidityPersistenceBars: 15,
      averageDivergencePersistenceBars: 12,
      averageStructurePersistenceBars: 35,
    },

    '1h': {
      timeframe: '1h',
      averageConditionLifeBars: 30,
      averageReactionDelayBars: 8,
      averageTrendPersistenceBars: 80,
      averageLiquidityPersistenceBars: 18,
      averageDivergencePersistenceBars: 15,
      averageStructurePersistenceBars: 45,
    },

    '4h': {
      timeframe: '4h',
      averageConditionLifeBars: 40,
      averageReactionDelayBars: 10,
      averageTrendPersistenceBars: 120,
      averageLiquidityPersistenceBars: 25,
      averageDivergencePersistenceBars: 20,
      averageStructurePersistenceBars: 60,
    },

    daily: {
      timeframe: 'daily',
      averageConditionLifeBars: 60,
      averageReactionDelayBars: 12,
      averageTrendPersistenceBars: 200,
      averageLiquidityPersistenceBars: 35,
      averageDivergencePersistenceBars: 30,
      averageStructurePersistenceBars: 90,
    },
  };

  return configs[timeframe];
}