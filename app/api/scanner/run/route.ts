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
  buildContextFingerprint,
} from '@/lib/market-engines/contextFingerprintEngine';

import {
  probabilityRepository,
} from '@/lib/market-engines/probabilityRepository';

import {
  calculateHistoricalProbability,
} from '@/lib/market-engines/historicalProbabilityEngine';

import {
  blendProbabilities,
} from '@/lib/market-engines/probabilityBlendEngine';

import {
  buildCycleAnalysis,
} from '@/lib/market-engines/cycleBuilder';

import {
  resolveCyclePhase,
  type CyclePhaseResolution,
} from '@/lib/market-engines/cyclePhaseResolver';

import {
  forecastCycle,
  type CycleForecast,
} from '@/lib/market-engines/cycleForecastEngine';

import type {
  CycleAnalysis,
} from '@/lib/market-engines/cycleEngine';

import {
  analyzeMomentum,
  type MomentumAnalysis,
} from '@/lib/market-engines/momentumEngine';

import {
  loadHistoricalProbability,
} from '@/lib/market-engines/historicalProbabilityLoader';

import {
  buildTimeframeContext,
} from '@/lib/market-engines/timeframeContextBuilder';

import {
  analyzeTimeDecay,
  type TimeDecayAnalysis,
} from '@/lib/market-engines/timeDecayEngine';

import {
  analyzeLifecycle,
  type LifecycleAnalysis,
} from '@/lib/market-engines/conditionLifecycleEngine';

import {
  analyzeRegime,
  type RegimeAnalysis,
} from '@/lib/market-engines/regimeEngine';

import {
  selectStrategy,
  type StrategySelection,
} from '@/lib/market-engines/strategySelectionEngine';

import {
  analyzeTradeQuality,
  type TradeQualityAnalysis,
} from '@/lib/market-engines/tradeQualityEngine';

import {
  rankOpportunity,
  type OpportunityRanking,
} from '@/lib/market-engines/opportunityRankingEngine';

import {
  evaluateExecutionGate,
  type ExecutionGateAnalysis,
} from '@/lib/market-engines/executionGateEngine';

import {
  analyzeExpectancy,
  type ExpectancyAnalysis,
} from '@/lib/market-engines/expectancyEngine';

import {
  buildSyntheticMultiTimeframeAnalysis,
} from '@/lib/market-engines/multiTimeframeBuilder';

import {
  buildSyntheticDeltaOrderFlowAnalysis,
} from '@/lib/market-engines/deltaOrderFlowBuilder';

import type {
  DeltaOrderFlowAnalysis,
} from '@/lib/market-engines/deltaOrderFlowEngine';

import type {
  MultiTimeframeAnalysis,
} from '@/lib/market-engines/multiTimeframeEngine';

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

  historicalProbability:
    ReturnType<typeof calculateHistoricalProbability> | null;

  blendedProbability:
    ReturnType<typeof blendProbabilities> | null;

  finalProbabilityBias:
  | 'long'
  | 'short'
  | 'neutral';

  contextFingerprint: string;

  cycleAnalysis: CycleAnalysis;

  cyclePhaseResolution:
  CyclePhaseResolution;

  cycleForecast:
    CycleForecast;

  regimeAnalysis: RegimeAnalysis;

  strategySelection: StrategySelection;

  tradeQualityAnalysis: TradeQualityAnalysis;

  opportunityRanking: OpportunityRanking;

  executionGate:
    ExecutionGateAnalysis;

  expectancyAnalysis:
    ExpectancyAnalysis;

  multiTimeframeAnalysis:
  MultiTimeframeAnalysis;

  deltaOrderFlowAnalysis:
  DeltaOrderFlowAnalysis;
  
    timeDecayAnalysis:
    TimeDecayAnalysis;

  lifecycleAnalysis:
    LifecycleAnalysis;
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

const multiTimeframeAnalysis =
  buildSyntheticMultiTimeframeAnalysis(
    symbol,
  );

const deltaOrderFlowAnalysis =
  buildSyntheticDeltaOrderFlowAnalysis(
    symbol,
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

const timeframeContext =
  buildTimeframeContext('5m');

const syntheticConditionAgeBars =
  symbol.length + 2;

const timeDecayAnalysis =
  analyzeTimeDecay(
    syntheticConditionAgeBars,
    timeframeContext.averageConditionLifeBars,
  );

const lifecycleAnalysis =
  analyzeLifecycle(
    syntheticConditionAgeBars,
    timeframeContext.averageConditionLifeBars,
  );

const probabilityContext: ScannerProbabilityContext = {
  symbol,

  timeframe: 'synthetic',

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

const contextFingerprint =
  buildContextFingerprint(
    probabilityContext,
  );

const historicalProbability =
  loadHistoricalProbability(
    contextFingerprint,
  );

const expectancyAnalysis =
  analyzeExpectancy(
    historicalProbability,
  );

const blendedProbability =
  historicalProbability
    ? blendProbabilities(
        probabilityEstimate,
        historicalProbability,
      )
    : null;

  const cycleAnalysis =
  buildCycleAnalysis(
    trendAnalysis,
    momentumAnalysis,
    liquidityAnalysis,
    divergenceAnalysis,
    marketStructureAnalysis,
  );

const cyclePhaseResolution =
  resolveCyclePhase(
    cycleAnalysis,
  );

const cycleForecast =
  forecastCycle(
    cycleAnalysis,
    cyclePhaseResolution,
  );

  const regimeAnalysis =
  analyzeRegime({
    trend: trendAnalysis,
    momentum: momentumAnalysis,
    liquidity: liquidityAnalysis,
    structure: marketStructureAnalysis,
    cycle: cycleAnalysis,
  });

  const strategySelection =
  selectStrategy({
    regime: regimeAnalysis,
    cycle: cycleAnalysis,
    divergenceLocation:
      divergenceLocationAnalysis,
  });

  const tradeQualityAnalysis =
  analyzeTradeQuality({
    probability: probabilityEstimate,
    cycle: cycleAnalysis,
    regime: regimeAnalysis,
    strategy: strategySelection,
  });

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

if (
  probabilityEstimate.probabilityConfidence ===
  'high'
) {
  confidenceScore += 10;
}

if (
  probabilityEstimate.probabilityConfidence ===
  'medium'
) {
  confidenceScore += 5;
}

if (
  blendedProbability?.confidence ===
  'high'
) {
  confidenceScore += 5;
}

if (
  cycleAnalysis.continuationProbability >=
  80
) {
  confidenceScore += 5;
}

if (
  cyclePhaseResolution.exhaustionRisk
) {
  confidenceScore -= 10;
}

if (
  cycleForecast.transitionProbability >=
  70
) {
  confidenceScore -= 5;
}

if (
  timeDecayAnalysis.setupFresh
) {
  confidenceScore += 5;
}

if (
  timeDecayAnalysis.setupStale
) {
  confidenceScore -= 5;
}

if (
  timeDecayAnalysis.setupExpired
) {
  confidenceScore -= 15;
}

if (
  multiTimeframeAnalysis.alignmentScore >=
  80
) {
  confidenceScore += 10;
}

if (
  multiTimeframeAnalysis.alignment ===
  'conflicted'
) {
  confidenceScore -= 15;
}

if (
  expectancyAnalysis.expectancyGrade ===
  'elite'
) {
  confidenceScore += 10;
}

if (
  expectancyAnalysis.expectancyGrade ===
  'strong'
) {
  confidenceScore += 5;
}

if (
  !expectancyAnalysis.positiveExpectancy
) {
  confidenceScore -= 10;
}

if (
  regimeAnalysis.trendFriendly
) {
  confidenceScore += 5;
}

if (
  regimeAnalysis.cautionRequired
) {
  confidenceScore -= 5;
}

if (
  strategySelection.strategyConfidence ===
  'high'
) {
  confidenceScore += 5;
}

if (
  strategySelection.strategyType ===
  'stand_aside'
) {
  confidenceScore -= 20;
}

if (
  tradeQualityAnalysis.qualityGrade === 'A+' ||
  tradeQualityAnalysis.qualityGrade === 'A'
) {
  confidenceScore += 5;
}

if (
  tradeQualityAnalysis.qualityGrade === 'avoid'
) {
  confidenceScore -= 25;
}

  confidenceScore = Math.max(
  0,
  Math.min(100, confidenceScore),
  );

const opportunityRanking =
  rankOpportunity({
    confidenceScore,
    probability: probabilityEstimate,
    tradeQuality: tradeQualityAnalysis,
    cycleForecast,
    regime: regimeAnalysis,
  });

const executionGate =
  evaluateExecutionGate({
    opportunity:
      opportunityRanking,

    tradeQuality:
      tradeQualityAnalysis,

    strategy:
      strategySelection,

    probability:
      probabilityEstimate,
  });

const finalProbabilityBias =
  blendedProbability?.probabilityBias ??
  probabilityEstimate.probabilityBias;

let tradeSide: 'long' | 'short' =
  finalProbabilityBias === 'short'
    ? 'short'
    : 'long';

const deltaTradeSide:
  | 'long'
  | 'short'
  | 'neutral' =
  deltaOrderFlowAnalysis.deltaBias === 'bullish'
    ? 'long'
    : deltaOrderFlowAnalysis.deltaBias === 'bearish'
    ? 'short'
    : 'neutral';

  if (
    deltaTradeSide === tradeSide
  ) {
    confidenceScore += 8;
  }

  if (
    deltaOrderFlowAnalysis.absorptionWarning
  ) {
    confidenceScore -= 10;
  }

  if (
    deltaOrderFlowAnalysis.exhaustionWarning
  ) {
    confidenceScore -= 5;
  }

  return {
    symbol,
    tradeSide,
    confidenceScore,
    setupGrade: gradeFromScore(confidenceScore),
    liquidityAnalysis,
    trendAnalysis,
    multiTimeframeAnalysis,
    deltaOrderFlowAnalysis,
    marketStructureAnalysis,
    momentumAnalysis,
    divergenceAnalysis,
    conflictResolution,
    divergenceLocationAnalysis,
    probabilityEstimate,

    historicalProbability,
    blendedProbability,
    finalProbabilityBias,
    contextFingerprint,

    cycleAnalysis,
    cyclePhaseResolution,
    cycleForecast,

    timeDecayAnalysis,
    lifecycleAnalysis,
    regimeAnalysis,
    strategySelection,
    tradeQualityAnalysis,
    opportunityRanking,
    executionGate,
    expectancyAnalysis,

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
    .sort(
  (a, b) =>
    b.opportunityRanking.opportunityScore -
    a.opportunityRanking.opportunityScore,
  );

  const topCandidate = candidates[0];

  let executionResult: unknown = null;

  if (
  autoExecute &&
  topCandidate &&
  topCandidate.executionGate.approved
  ) {
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