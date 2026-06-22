import {
  getAccounts,
} from './client';

export interface TradovateAccount {
  accountId: number;
  name: string;
  active: boolean;
}

type RawTradovateAccount = {
  id?: number;
  name?: string;
  active?: boolean;
};

export async function discoverAccounts(): Promise<TradovateAccount[]> {
  try {
    const accounts =
      await getAccounts() as
        RawTradovateAccount[];

    return accounts.map(
      (account) => ({
        accountId:
          account.id ?? 0,

        name:
          account.name ??
          'Unknown Account',

        active:
          account.active ?? false,
      }),
    );
  } catch {
    return [];
  }
}