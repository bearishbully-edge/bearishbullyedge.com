export interface TradovateAuthSession {
  accessToken: string;

  expiresAt: number;

  authenticated: boolean;
}