export interface TradovateConfig {
  apiBaseUrl: string;
  authBaseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  environment: 'demo' | 'live';
}

export const tradovateConfig: TradovateConfig = {
  apiBaseUrl:
    process.env.TRADOVATE_API_URL ??
    'https://demo.tradovateapi.com/v1',

  authBaseUrl:
    process.env.TRADOVATE_AUTH_URL ??
    'https://demo.tradovateapi.com/v1',

  clientId:
    process.env.TRADOVATE_CLIENT_ID ?? '',

  clientSecret:
    process.env.TRADOVATE_CLIENT_SECRET ?? '',

  username:
    process.env.TRADOVATE_USERNAME ?? '',

  password:
    process.env.TRADOVATE_PASSWORD ?? '',

  environment:
    (process.env.TRADOVATE_ENV ?? 'demo') as
      | 'demo'
      | 'live',
};