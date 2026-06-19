import {
  analyzeDeltaOrderFlow,
  type DeltaOrderFlowAnalysis,
} from './deltaOrderFlowEngine';

function buildSyntheticDeltaOrderFlowInput(
  symbol: string,
) {
  const seed =
    symbol
      .split('')
      .reduce(
        (sum, char) =>
          sum + char.charCodeAt(0),
        0,
      );

  const askVolume =
    1000 + seed * 3;

  const bidVolume =
    900 + seed * 2;

  return {
    symbol,

    bidVolume,
    askVolume,

    previousDelta:
      seed % 2 === 0
        ? 100
        : -100,

    currentDelta:
      askVolume -
      bidVolume,

    priceMovingUp:
      seed % 2 === 0,

    priceMovingDown:
      seed % 3 === 0,

    volumeIncreasing:
      seed % 5 !== 0,
  };
}

export function buildSyntheticDeltaOrderFlowAnalysis(
  symbol: string,
): DeltaOrderFlowAnalysis {
  return analyzeDeltaOrderFlow(
    buildSyntheticDeltaOrderFlowInput(
      symbol,
    ),
  );
}