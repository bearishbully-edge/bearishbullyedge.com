export type DeltaBias =
  | 'bullish'
  | 'bearish'
  | 'neutral';

export type DeltaState =
  | 'strong_buying'
  | 'buying'
  | 'balanced'
  | 'selling'
  | 'strong_selling';

export interface DeltaOrderFlowInput {
  symbol: string;

  bidVolume: number;
  askVolume: number;

  previousDelta: number;
  currentDelta: number;

  priceMovingUp: boolean;
  priceMovingDown: boolean;

  volumeIncreasing: boolean;
}

export interface DeltaOrderFlowAnalysis {
  delta: number;
  deltaChange: number;

  deltaBias: DeltaBias;
  deltaState: DeltaState;

  buyingAggression: number;
  sellingAggression: number;

  imbalanceScore: number;

  absorptionWarning: boolean;
  exhaustionWarning: boolean;

  coachNote: string;
}

export function analyzeDeltaOrderFlow(
  input: DeltaOrderFlowInput,
): DeltaOrderFlowAnalysis {
  const delta =
    input.askVolume -
    input.bidVolume;

  const totalVolume =
    input.askVolume +
    input.bidVolume;

  const deltaChange =
    input.currentDelta -
    input.previousDelta;

  const buyingAggression =
    totalVolume === 0
      ? 0
      : Math.round(
          (input.askVolume / totalVolume) *
            100,
        );

  const sellingAggression =
    totalVolume === 0
      ? 0
      : Math.round(
          (input.bidVolume / totalVolume) *
            100,
        );

  let deltaBias: DeltaBias = 'neutral';
  let deltaState: DeltaState = 'balanced';

  if (buyingAggression >= 70) {
    deltaBias = 'bullish';
    deltaState = 'strong_buying';
  } else if (buyingAggression >= 58) {
    deltaBias = 'bullish';
    deltaState = 'buying';
  }

  if (sellingAggression >= 70) {
    deltaBias = 'bearish';
    deltaState = 'strong_selling';
  } else if (sellingAggression >= 58) {
    deltaBias = 'bearish';
    deltaState = 'selling';
  }

  const imbalanceScore =
    Math.abs(
      buyingAggression -
        sellingAggression,
    );

  const absorptionWarning =
    (
      input.priceMovingUp &&
      delta < 0
    ) ||
    (
      input.priceMovingDown &&
      delta > 0
    );

  const exhaustionWarning =
    input.volumeIncreasing &&
    Math.abs(deltaChange) < 10;

  return {
    delta,
    deltaChange,

    deltaBias,
    deltaState,

    buyingAggression,
    sellingAggression,

    imbalanceScore,

    absorptionWarning,
    exhaustionWarning,

    coachNote:
      absorptionWarning
        ? 'Absorption warning detected. Price is moving against delta.'
        : exhaustionWarning
        ? 'Possible exhaustion. Volume increasing but delta is not expanding.'
        : `Delta order flow classified as ${deltaState}.`,
  };
}