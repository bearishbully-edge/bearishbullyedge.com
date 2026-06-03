import { NextResponse } from 'next/server';
import {
  analyzeLiquidity,
  type LiquidityAnalysis,
} from '@/lib/market-engines/liquidityEngine';

import {
  analyzeTrend,
  type TrendAnalysis,
} from '@/lib/market-engines/trendEngine';

import {
  analyzeDivergence,
  type DivergenceAnalysis,
} from '@/lib/market-engines/divergenceEngine';

import {
  analyzeMarketStructure,
  type MarketStructureAnalysis,
} from '@/lib/market-engines/marketStructureEngine';

import {
  buildSyntheticMarketStructureInput,
} from '@/lib/market-engines/marketStructureBuilder';

import {
  resolveConflicts,
  type ConflictResolution,
} from '@/lib/market-engines/conflictResolver';

import {
  resolveDivergenceLocation,
  type DivergenceLocationAnalysis,
} from '@/lib/market-engines/divergenceLocationResolver';

import {
  type ScannerProbabilityContext,
  type ProbabilityEstimate,
} from '@/lib/market-engines/probabilityContext';

import {
  estimateSetupProbability,
} from '@/lib/market-engines/probabilityEngine';

import {
  analyzeMomentum,
  type MomentumAnalysis,
} from '@/lib/market-engines/momentumEngine';

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
  divergenceAnalysis: DivergenceAnalysis;
  momentumAnalysis: MomentumAnalysis;
  marketStructureAnalysis: MarketStructureAnalysis;
  conflictResolution: ConflictResolution;
  divergenceLocationAnalysis: DivergenceLocationAnalysis;
  probabilityEstimate: ProbabilityEstimate;
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

function buildSyntheticDivergenceInput(symbol: string) {
  const seed = symbol
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    symbol,

    priceMakingHigherHigh: seed % 2 === 0,
    priceMakingLowerLow: seed % 3 === 0,

    priceMakingHigherLow: seed % 5 === 0,
    priceMakingLowerHigh: seed % 7 === 0,

    momentumMakingHigherHigh: seed % 11 === 0,
    momentumMakingLowerLow: seed % 13 === 0,

    momentumMakingHigherLow: seed % 17 === 0,
    momentumMakingLowerHigh: seed % 19 === 0,

    volumeIncreasing: seed % 2 === 0,
    volumeDecreasing: seed % 3 === 0,

    deltaIncreasing: seed % 5 === 0,
    deltaDecreasing: seed % 7 === 0,
  };
}

function buildSyntheticMomentumInput(symbol: string) {
  const seed = symbol
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    symbol,
    macdBullish: seed % 2 === 0,
    stochasticBullish: seed % 3 !== 0,
    aboveZeroLine: seed % 5 !== 0,
    momentumIncreasing: seed % 4 === 0,
    momentumDecreasing: seed % 7 === 0,
  };
}

function scoreCandidate(symbol: string): ScanCandidate {
const trendAnalysis = analyzeTrend(
  buildSyntheticTrendInput(symbol),
);

const marketStructureAnalysis =
  analyzeMarketStructure(
    buildSyntheticMarketStructureInput(symbol),
  );
const momentumAnalysis = analyzeMomentum(
  buildSyntheticMomentumInput(symbol),
);  
const biasAligned = trendAnalysis.trendAligned;
  const volatilityExpansion = Math.random() > 0.25;
  const cycleAligned = Math.random() > 0.3;
  const divergenceAnalysis = analyzeDivergence(
    buildSyntheticDivergenceInput(symbol),
  );

const divergenceConfirmed =
  divergenceAnalysis.divergenceDetected;

const trendBullish =
  trendAnalysis.trendDirection === 'bullish';

const trendBearish =
  trendAnalysis.trendDirection === 'bearish';

const divergenceBullish =
  divergenceAnalysis.divergenceBias ===
    'bullish_reversal' ||
  divergenceAnalysis.divergenceBias ===
    'bullish_continuation';

const divergenceBearish =
  divergenceAnalysis.divergenceBias ===
    'bearish_reversal' ||
  divergenceAnalysis.divergenceBias ===
    'bearish_continuation';

const trendConflict =
  (trendBullish && divergenceBearish) ||
  (trendBearish && divergenceBullish);
  const economicRiskClear = Math.random() > 0.15;

  const liquidityAnalysis = analyzeLiquidity(
    buildSyntheticLiquidityInput(symbol),
  );

const divergenceLocationAnalysis =
  resolveDivergenceLocation(
    divergenceAnalysis,
    marketStructureAnalysis,
  );

const conflictResolution = resolveConflicts(
  trendAnalysis,
  marketStructureAnalysis,
  liquidityAnalysis,
  divergenceAnalysis,
  momentumAnalysis,
);

const probabilityContext: ScannerProbabilityContext = {
  symbol,

  trendState: trendAnalysis.trendState,
  trendDirection: trendAnalysis.trendDirection,

  momentumState: momentumAnalysis.momentumState,

  structureState:
    marketStructureAnalysis.structureState,

  liquidityBias:
    liquidityAnalysis.liquidityBias,

  sweepDirection:
    liquidityAnalysis.sweepDirection,

  divergenceType:
    divergenceAnalysis.divergenceType,

  divergenceBias:
    divergenceAnalysis.divergenceBias,

  divergenceLocation:
    divergenceLocationAnalysis.location,

  reversalQuality:
    divergenceLocationAnalysis.reversalQuality,

  continuationQuality:
    divergenceLocationAnalysis.continuationQuality,
};

const probabilityEstimate =
  estimateSetupProbability(
    probabilityContext,
  );

  const liquidityMapped =
    liquidityAnalysis.liquidityScore >= 50 ||
    liquidityAnalysis.sweepDetected ||
    liquidityAnalysis.targetLiquidityZone !== 'none';

  let confidenceScore = 0;

  confidenceScore += Math.round(
  marketStructureAnalysis.structureScore * 0.15,
  );

  if (biasAligned) confidenceScore += 10;

  confidenceScore += Math.round(trendAnalysis.trendScore * 0.16);
  confidenceScore += Math.round(
  momentumAnalysis.momentumScore * 0.12,
  );
  if (volatilityExpansion) confidenceScore += 20;
  if (liquidityMapped) confidenceScore += 10;
  if (
  marketStructureAnalysis.continuationBias
  ) {
  confidenceScore += 14;
  }
  if (divergenceConfirmed) confidenceScore += 5;

  confidenceScore += Math.round(
    divergenceAnalysis.divergenceScore * 0.10,
  );
  if (economicRiskClear) confidenceScore += 8;

  confidenceScore += Math.round(liquidityAnalysis.liquidityScore * 0.18);

  if (trendConflict) {
  confidenceScore -= 10;
  }

  confidenceScore += conflictResolution.confidenceAdjustment;

  confidenceScore = Math.max(
  0,
  Math.min(100, confidenceScore),
  );

let tradeSide: 'long' | 'short' =
  probabilityEstimate.probabilityBias === 'short'
    ? 'short'
    : 'long';

  return {
    symbol,
    tradeSide,
    confidenceScore,
    setupGrade: gradeFromScore(confidenceScore),
    liquidityAnalysis,
    trendAnalysis,
    marketStructureAnalysis,
    momentumAnalysis,
    divergenceAnalysis,
    conflictResolution,
    divergenceLocationAnalysis,
    probabilityEstimate,
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
          cycleState:
            topCandidate.marketStructureAnalysis.structureState,
          divergenceState:
            `${topCandidate.divergenceAnalysis.divergenceType}:${topCandidate.divergenceAnalysis.divergenceBias}`,
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