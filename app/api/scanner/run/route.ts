import { NextResponse } from 'next/server';

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

function scoreCandidate(symbol: string): ScanCandidate {
  const biasAligned = Math.random() > 0.2;
  const volatilityExpansion = Math.random() > 0.25;
  const liquidityMapped = Math.random() > 0.2;
  const cycleAligned = Math.random() > 0.3;
  const divergenceConfirmed = Math.random() > 0.35;
  const economicRiskClear = Math.random() > 0.15;

  let confidenceScore = 0;

  if (biasAligned) confidenceScore += 20;
  if (volatilityExpansion) confidenceScore += 22;
  if (liquidityMapped) confidenceScore += 18;
  if (cycleAligned) confidenceScore += 16;
  if (divergenceConfirmed) confidenceScore += 14;
  if (economicRiskClear) confidenceScore += 10;

  return {
    symbol,
    tradeSide: Math.random() > 0.5 ? 'long' : 'short',
    confidenceScore,
    setupGrade: gradeFromScore(confidenceScore),
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
          biasState: topCandidate.conditions.biasAligned
            ? 'aligned'
            : 'misaligned',
          volatilityState: topCandidate.conditions.volatilityExpansion
            ? 'expanding_after_compression'
            : 'compressed',
          liquidityState: topCandidate.conditions.liquidityMapped
            ? 'mapped'
            : 'not_mapped',
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