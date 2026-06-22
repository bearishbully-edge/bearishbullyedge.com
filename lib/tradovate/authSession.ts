export interface TradovateAuthSession {
  accessToken: string;
  expiresAt: number;
  authenticated: boolean;
}

export interface TradovateAuthResponse {
  accessToken?: string;
  token?: string;
  expirationTime?: string;
  mdAccessToken?: string;
}