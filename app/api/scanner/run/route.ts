import { NextResponse } from 'next/server';
import {
  analyzeLiquidity,
  type LiquidityAnalysis,
} from '@/lib/market-engines/liquidityEngine';

import {
  analyzeTrend,
  type TrendAnalysis,
} from '@/lib/market-engines/trendEngine';

export const dynamic = 'force-dynamic';

type ScannerBody = {
  userId?: unknown;
  symbols?: unknown;
  autoExecute?: unknown;
};

type ScanCandidate = {
  symbol: string;
  tradeSide: 'long' | 'short';
  confidenceScore: number;
  setupGrade: string;
  liquidityAnalysis: LiquidityAnalysis;
  trendAnalysis: TrendAnalysis;
  conditions: {
    biasAligned: boolean;
    volatilityExpansion: boolean;
    liquidityMapped: boolean;
    cycleAligned: boolean;
    divergenceConfirmed: boolean;
    economicRiskClear: boolean;
  };
};

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function gradeFromScore(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';

  return 'D';
}

function buildSyntheticLiquidityInput(symbol: string) {
  const seed = symbol
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    symbol,

    equalHighs: seed % 2 === 0,
    equalLows: seed % 3 === 0,

    buySideLiquidityPresent: seed % 5 !== 0,
    sellSideLiquidityPresent: seed % 7 !== 0,

    buySideSweepDetected: seed % 4 === 0,
    sellSideSweepDetected: seed % 6 === 0,

    reclaimConfirmed: seed % 3 !== 1,

    compressionDetected: seed % 2 !== 0,
  };
}

function buildSyntheticTrendInput(symbol: string) {
  const seed = symbol
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    symbol,
    priceAbove10Sma: seed % 2 === 0,
    priceAbove20Ema: seed % 3 !== 0,
    priceAbove50Sma: seed % 5 !== 0,
    higherHighs: seed % 4 === 0,
    higherLows: seed % 6 !== 0,
    lowerHighs: seed % 7 === 0,
    lowerLows: seed % 5 === 0,
    rangeBound: seed % 11 === 0,
  };
}

function scoreCandidate(symbol: string): ScanCandidate {
const trendAnalysis = analyzeTrend(
  buildSyntheticTrendInput(symbol),
);
const biasAligned = trendAnalysis.trendAligned;
  const volatilityExpansion = Math.random() > 0.25;
  const cycleAligned = Math.random() > 0.3;
  const divergenceConfirmed = Math.random() > 0.35;
  const economicRiskClear = Math.random() > 0.15;

  const liquidityAnalysis = analyzeLiquidity(
    buildSyntheticLiquidityInput(symbol),
  );

  const liquidityMapped =
    liquidityAnalysis.liquidityScore >= 50 ||
    liquidityAnalysis.sweepDetected ||
    liquidityAnalysis.targetLiquidityZone !== 'none';

  let confidenceScore = 0;

  if (biasAligned) confidenceScore += 10;

  confidenceScore += Math.round(trendAnalysis.trendScore * 0.16);
  if (volatilityExpansion) confidenceScore += 20;
  if (liquidityMapped) confidenceScore += 10;
  if (cycleAligned) confidenceScore += 14;
  if (divergenceConfirmed) confidenceScore += 12;
  if (economicRiskClear) confidenceScore += 8;

  confidenceScore += Math.round(liquidityAnalysis.liquidityScore * 0.18);

  confidenceScore = Math.min(100, confidenceScore);

  let tradeSide: 'long' | 'short' =
    Math.random() > 0.5 ? 'long' : 'short';

  if (liquidityAnalysis.liquidityBias === 'bullish') {
    tradeSide = 'long';
  }

  if (liquidityAnalysis.liquidityBias === 'bearish') {
    tradeSide = 'short';
  }

  return {
    symbol,
    tradeSide,
    confidenceScore,
    setupGrade: gradeFromScore(confidenceScore),
    liquidityAnalysis,
    trendAnalysis,
    conditions: {
      biasAligned,
      volatilityExpansion,
      liquidityMapped,
      cycleAligned,
      divergenceConfirmed,
      economicRiskClear,
    },
  };
}

export async function POST(req: Request) {
  let body: ScannerBody;

  try {
    body = (await req.json()) as ScannerBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'invalid_json' },
      { status: 400 },
    );
  }

  const userId = asString(body.userId);

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'missing_user_id' },
      { status: 400 },
    );
  }

  const symbols = Array.isArray(body.symbols)
    ? body.symbols
        .map(asString)
        .filter((symbol): symbol is string => Boolean(symbol))
        .map((symbol) => symbol.toUpperCase())
    : ['MNQ', 'NQ', 'ES', 'SPY', 'QQQ'];

  const autoExecute = body.autoExecute === true;

  const candidates = symbols
    .map(scoreCandidate)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  const topCandidate = candidates[0];

  let executionResult: unknown = null;

  if (autoExecute && topCandidate && topCandidate.confidenceScore >= 80) {
    const response = await fetch(
      new URL('/api/trade-executions/create', req.url),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          executionSource: 'scanner',
          brokerTradeId: `scanner-${topCandidate.symbol}-${Date.now()}`,
          symbol: topCandidate.symbol,
          tradeSide: topCandidate.tradeSide,
          strategyName: 'Scanner Ranked Setup',
          executionMode: 'paper',
          entryPrice: 21450,
          stopPrice: topCandidate.tradeSide === 'long' ? 21410 : 21490,
          targetPrice: topCandidate.tradeSide === 'long' ? 21540 : 21360,
          exitPrice: topCandidate.tradeSide === 'long' ? 21505 : 21395,
          quantity: 1,
          pnl: topCandidate.confidenceScore >= 80 ? 420 : -180,
          confidenceScore: topCandidate.confidenceScore,
          setupGrade: topCandidate.setupGrade,
          biasState: `${topCandidate.trendAnalysis.trendDirection}:${topCandidate.trendAnalysis.trendState}`,
          volatilityState: topCandidate.conditions.volatilityExpansion
            ? 'expanding_after_compression'
            : 'compressed',
          liquidityState: `${topCandidate.liquidityAnalysis.liquidityBias}:${topCandidate.liquidityAnalysis.sweepDirection}:${topCandidate.liquidityAnalysis.targetLiquidityZone}`,
          cycleState: topCandidate.conditions.cycleAligned
            ? 'aligned'
            : 'not_aligned',
          divergenceState: topCandidate.conditions.divergenceConfirmed
            ? 'confirmed'
            : 'none',
          economicRiskState: topCandidate.conditions.economicRiskClear
            ? 'clear'
            : 'elevated',
          status: 'closed',
        }),
      },
    );

    executionResult = await response.json();
  }

  return NextResponse.json({
    ok: true,
    scannedAt: new Date().toISOString(),
    autoExecute,
    topCandidate,
    candidates,
    execution: executionResult,
  });
}