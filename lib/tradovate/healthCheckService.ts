import {
  tradovateConfig,
} from './config';

import {
  getSession,
} from './tokenManager';

import {
  discoverAccounts,
} from './accountDiscovery';

import {
  loadTradovatePositions,
} from './positionLoader';

import type {
  TradovateHealthReport,
} from './healthCheckEngine';

export async function runTradovateHealthCheck():
  Promise<TradovateHealthReport> {

  const messages: string[] = [];

  const configured =
    Boolean(
      tradovateConfig.clientId &&
      tradovateConfig.clientSecret &&
      tradovateConfig.username &&
      tradovateConfig.password,
    );

  if (!configured) {
    messages.push(
      'Tradovate environment variables missing.',
    );
  }

  const session =
    getSession();

  const sessionActive =
    Boolean(
      session?.authenticated,
    );

  if (!sessionActive) {
    messages.push(
      'No active Tradovate session.',
    );
  }

  let accountsLoaded =
    false;

  try {
    const accounts =
      await discoverAccounts();

    accountsLoaded =
      accounts.length >= 0;

    messages.push(
      `Accounts discovered: ${accounts.length}`,
    );
  } catch {
    messages.push(
      'Account discovery failed.',
    );
  }

  let positionsLoaded =
    false;

  try {
    await loadTradovatePositions();

    positionsLoaded =
      true;

    messages.push(
      'Position loader operational.',
    );
  } catch {
    messages.push(
      'Position loader failed.',
    );
  }

  return {
    configured,

    authenticated:
      sessionActive,

    sessionActive,

    accountsLoaded,

    positionsLoaded,

    orderPlacementEnabled:
      false,

    messages,
  };
}