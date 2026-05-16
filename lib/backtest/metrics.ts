// lib/backtest/metrics.ts

import type {
  BacktestPosition,
  BacktestMetrics,
  EquityPoint,
} from './types';

export function buildEquityCurve(
  trades: BacktestPosition[],
  startingEquity: number,
): EquityPoint[] {
  const points: EquityPoint[] = [];
  let equity = startingEquity;

  const sorted = [...trades].sort(
    (a, b) => (a.closedAt || 0) - (b.closedAt || 0),
  );

  for (const t of sorted) {
    const pnl = t.pnl ?? 0;
    equity += pnl;
    points.push({
      timestamp: t.closedAt || t.openedAt,
      equity,
    });
  }

  if (points.length === 0) {
    points.push({ timestamp: Date.now(), equity: startingEquity });
  }

  return points;
}

export function computeMetrics(
  trades: BacktestPosition[],
  startingEquity: number,
): BacktestMetrics {
  const equityCurve = buildEquityCurve(trades, startingEquity);

  const endingEquity = equityCurve[equityCurve.length - 1].equity;
  const netPnl = endingEquity - startingEquity;

  // Drawdown
  let peak = startingEquity;
  let maxDD = 0;
  for (const p of equityCurve) {
    if (p.equity > peak) peak = p.equity;
    const dd = peak - p.equity;
    if (dd > maxDD) maxDD = dd;
  }
  const maxDrawdownPct =
    peak > 0 ? (maxDD / peak) * 100 : 0;

  // Trades stats
  const realized = trades.filter((t) => t.status === 'closed');
  const totalTrades = realized.length;

  let wins = 0;
  let losses = 0;
  let sumR = 0;
  let grossProfit = 0;
  let grossLoss = 0;

  for (const t of realized) {
    const riskPerTrade =
      t.signal.stopPrice && t.signal.entryPrice
        ? Math.abs(t.signal.entryPrice - t.signal.stopPrice)
        : t.signal.entryPrice * 0.005; // fallback 0.5%

    const pnl = t.pnl ?? 0;
    const r = riskPerTrade > 0 ? pnl / riskPerTrade : 0;
    sumR += r;

    if (pnl > 0) {
      wins++;
      grossProfit += pnl;
    } else if (pnl < 0) {
      losses++;
      grossLoss += Math.abs(pnl);
    }
  }

  const winRate =
    totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const avgR = totalTrades > 0 ? sumR / totalTrades : 0;
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  return {
    startingEquity,
    endingEquity,
    netPnl,
    maxDrawdown: maxDD,
    maxDrawdownPct,
    winRate,
    totalTrades,
    avgR,
    profitFactor,
  };
}
