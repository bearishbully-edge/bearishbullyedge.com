export interface AccountState {
  accountId: string;

  accountBalance: number;

  buyingPower: number;

  dailyPnL: number;

  openPositions: number;

  maxPositionsAllowed: number;

  dailyLossLimit: number;

  dailyLossLocked: boolean;

  maxPositionsReached: boolean;
}

export function evaluateAccountState(
  account: AccountState,
): AccountState {
  return {
    ...account,

    dailyLossLocked:
      account.dailyPnL <=
      -Math.abs(
        account.dailyLossLimit,
      ),

    maxPositionsReached:
      account.openPositions >=
      account.maxPositionsAllowed,
  };
}