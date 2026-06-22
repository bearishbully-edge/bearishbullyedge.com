import {
  evaluateAccountState,
} from './accountStateEngine';

import {
  discoverAccounts,
} from './accountDiscovery';

export async function loadTradovateAccount() {
  const accounts =
    await discoverAccounts();

  const account =
    accounts.find(
      (item) => item.active,
    ) ?? accounts[0];

  return evaluateAccountState({
    accountId:
      account
        ? String(account.accountId)
        : 'tradovate-live',

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