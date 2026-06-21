import {
  evaluateAccountState,
} from './accountStateEngine';

export async function loadTradovateAccount() {
  /*
   Tradovate API account call will replace this synthetic fallback.
  */

  return evaluateAccountState({
    accountId:
      'tradovate-live',

    accountBalance:
      10000,

    buyingPower:
      50000,

    dailyPnL:
      0,

    openPositions:
      0,

    maxPositionsAllowed:
      3,

    dailyLossLimit:
      500,

    dailyLossLocked:
      false,

    maxPositionsReached:
      false,
  });
}