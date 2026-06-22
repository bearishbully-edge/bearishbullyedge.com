import {
  tradovateConfig,
} from './config';

import type {
  TradovateAuthResponse,
} from './authSession';

import {
  getSession,
  setSession,
  sessionExpired,
} from './tokenManager';

export interface TradovateCredentials {
  username: string;
  password: string;
  appId: string;
}

function requireConfig() {
  const missing: string[] = [];

  if (!tradovateConfig.username) {
    missing.push('TRADOVATE_USERNAME');
  }

  if (!tradovateConfig.password) {
    missing.push('TRADOVATE_PASSWORD');
  }

  if (!tradovateConfig.clientId) {
    missing.push('TRADOVATE_CLIENT_ID');
  }

  if (!tradovateConfig.clientSecret) {
    missing.push('TRADOVATE_CLIENT_SECRET');
  }

  return missing;
}

export async function authenticateTradovate() {
  const missing = requireConfig();

  if (missing.length > 0) {
    return {
      authenticated: false,
      message:
        `Missing Tradovate env vars: ${missing.join(', ')}`,
    };
  }

  const response =
    await fetch(
      `${tradovateConfig.authBaseUrl}/auth/accesstokenrequest`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          name:
            tradovateConfig.username,

          password:
            tradovateConfig.password,

          appId:
            tradovateConfig.clientId,

          appVersion:
            '1.0',

          cid:
            tradovateConfig.clientId,

          sec:
            tradovateConfig.clientSecret,
        }),
      },
    );

  if (!response.ok) {
    return {
      authenticated: false,
      message:
        `Tradovate auth failed: ${response.status}`,
    };
  }

  const data =
    (await response.json()) as
      TradovateAuthResponse;

  const accessToken =
    data.accessToken ??
    data.token;

  if (!accessToken) {
    return {
      authenticated: false,
      message:
        'Tradovate auth response missing access token.',
    };
  }

  setSession({
    accessToken,
    authenticated: true,
    expiresAt:
      Date.now() + 50 * 60 * 1000,
  });

  return {
    authenticated: true,
    message:
      'Tradovate authenticated.',
  };
}

export async function getTradovateAccessToken() {
  if (
    !getSession() ||
    sessionExpired()
  ) {
    const auth =
      await authenticateTradovate();

    if (!auth.authenticated) {
      throw new Error(auth.message);
    }
  }

  const session = getSession();

  if (!session) {
    throw new Error(
      'Tradovate session unavailable.',
    );
  }

  return session.accessToken;
}

export async function tradovateRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    await getTradovateAccessToken();

  const response =
    await fetch(
      `${tradovateConfig.apiBaseUrl}${path}`,
      {
        ...options,
        headers: {
          Authorization:
            `Bearer ${token}`,
          'Content-Type':
            'application/json',
          ...(options.headers ?? {}),
        },
      },
    );

  if (!response.ok) {
    throw new Error(
      `Tradovate request failed ${response.status}: ${path}`,
    );
  }

  return response.json() as Promise<T>;
}

export async function getAccounts() {
  return tradovateRequest('/account/list');
}

export async function getPositions() {
  return tradovateRequest('/position/list');
}

export async function placeOrder() {
  return {
    success: false,
    message:
      'Live order placement intentionally disabled.',
  };
}

export async function cancelOrder() {
  return {
    success: false,
    message:
      'Live order cancellation intentionally disabled.',
  };
}