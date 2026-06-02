import type {
  MarketStructureInput,
} from './marketStructureEngine';

export function buildSyntheticMarketStructureInput(
  symbol: string,
): MarketStructureInput {
  const seed = symbol
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    symbol,

    higherHigh: seed % 2 === 0,
    higherLow: seed % 3 !== 0,

    lowerHigh: seed % 5 === 0,
    lowerLow: seed % 7 === 0,

    breakoutAttempt: seed % 4 === 0,
    breakoutConfirmed: seed % 6 === 0,

    breakdownAttempt: seed % 8 === 0,
    breakdownConfirmed: seed % 10 === 0,

    rangeBound: seed % 11 === 0,
  };
}