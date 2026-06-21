import {
  evaluateAccountState,
} from './accountStateEngine';

export async function loadTradovateAccount() {
  const account =
    evaluateAccountState({
      accountId:
        'paper-account',

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

  return account;
}