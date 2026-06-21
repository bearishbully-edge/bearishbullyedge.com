export interface TradovateAccount {
  accountId: number;
  name: string;
  active: boolean;
}

export async function discoverAccounts(): Promise<TradovateAccount[]> {
  return [];
}