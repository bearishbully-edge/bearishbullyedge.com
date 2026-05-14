// lib/backtest/historicalFeed.ts

import type { BacktestCandle } from './types';

/**
 * Parse a CSV string into BacktestCandle[]
 * Expected headers (case-insensitive):
 * timestamp, open, high, low, close, volume, delta
 *
 * timestamp may be:
 *  - milliseconds since epoch
 *  - ISO date string
 */
export function parseCSVToCandles(csv: string): BacktestCandle[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const tsIdx = idx('timestamp');
  const oIdx = idx('open');
  const hIdx = idx('high');
  const lIdx = idx('low');
  const cIdx = idx('close');
  const vIdx = idx('volume');
  const dIdx = idx('delta');
  const symIdx = idx('symbol');

  const candles: BacktestCandle[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length < 5) continue;

    const rawTs = tsIdx >= 0 ? parts[tsIdx] : '';
    let timestamp = Date.now();
    if (/^\d+$/.test(rawTs)) {
      timestamp = Number(rawTs);
    } else if (rawTs) {
      const parsed = Date.parse(rawTs);
      if (!Number.isNaN(parsed)) timestamp = parsed;
    }

    const open = Number(parts[oIdx]);
    const high = Number(parts[hIdx]);
    const low = Number(parts[lIdx]);
    const close = Number(parts[cIdx]);

    if (
      [open, high, low, close].some(
        (v) => typeof v !== 'number' || Number.isNaN(v),
      )
    ) {
      continue;
    }

    const volume =
      vIdx >= 0 && parts[vIdx] ? Number(parts[vIdx]) : undefined;
    const delta =
      dIdx >= 0 && parts[dIdx] ? Number(parts[dIdx]) : undefined;
    const symbol = symIdx >= 0 ? parts[symIdx] : undefined;

    candles.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume,
      delta,
      symbol,
    });
  }

  // Sort by time just in case
  candles.sort((a, b) => a.timestamp - b.timestamp);
  return candles;
}
