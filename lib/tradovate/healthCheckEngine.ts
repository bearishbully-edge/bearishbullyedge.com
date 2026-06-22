export interface TradovateHealthReport {
  configured: boolean;

  authenticated: boolean;

  sessionActive: boolean;

  accountsLoaded: boolean;

  positionsLoaded: boolean;

  orderPlacementEnabled: boolean;

  messages: string[];
}