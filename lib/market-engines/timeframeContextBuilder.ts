import {
  getTimeframeContext,
  type Timeframe,
} from './timeframeContextEngine';

export function buildTimeframeContext(
  timeframe: Timeframe,
) {
  return getTimeframeContext(
    timeframe,
  );
}