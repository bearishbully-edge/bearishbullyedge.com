export interface TradovateCredentials {
  username: string;
  password: string;
  appId: string;
}

export async function authenticateTradovate(
  credentials: TradovateCredentials,
) {
  return {
    authenticated: false,
    message:
      'Tradovate API wiring pending.',
  };
}

export async function getAccounts() {
  return [];
}

export async function getPositions() {
  return [];
}

export async function placeOrder() {
  return {
    success: false,
  };
}

export async function cancelOrder() {
  return {
    success: false,
  };
}