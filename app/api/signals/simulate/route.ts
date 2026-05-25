import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type SimulateSignalBody = {
  userId?: unknown;
  symbol?: unknown;
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

export async function POST(req: Request) {
  let body: SimulateSignalBody;

  try {
    body = (await req.json()) as SimulateSignalBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: 'invalid_json' },
      { status: 400 },
    );
  }

  const userId = asString(body.userId);
  const symbol = asString(body.symbol)?.toUpperCase() ?? 'MNQ';

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: 'missing_user_id' },
      { status: 400 },
    );
  }

  const biasAligned = Math.random() > 0.2;
  const volatilityExpansion = Math.random() > 0.25;
  const liquidityMapped = Math.random() > 0.2;
  const cycleAligned = Math.random() > 0.3;
  const economicRiskClear = Math.random() > 0.15;

  let confidenceScore = 0;

  if (biasAligned) confidenceScore += 22;
  if (volatilityExpansion) confidenceScore += 24;
  if (liquidityMapped) confidenceScore += 20;
  if (cycleAligned) confidenceScore += 18;
  if (economicRiskClear) confidenceScore += 16;

  const setupGrade = gradeFromScore(confidenceScore);
  const tradeSide = Math.random() > 0.5 ? 'long' : 'short';

  const entryPrice = 21450;
  const stopPrice = tradeSide === 'long' ? 21410 : 21490;
  const targetPrice = tradeSide === 'long' ? 21540 : 21360;
  const exitPrice = tradeSide === 'long' ? 21505 : 21395;
  const pnl = confidenceScore >= 75 ? 420 : -180;

  const executionResponse = await fetch(
    new URL('/api/trade-executions/create', req.url),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        executionSource: 'signal_simulator',
        brokerTradeId: `signal-sim-${symbol}-${Date.now()}`,
        symbol,
        tradeSide,
        strategyName: 'Signal Engine Simulation',
        executionMode: 'paper',
        entryPrice,
        stopPrice,
        targetPrice,
        exitPrice,
        quantity: 1,
        pnl,
        confidenceScore,
        setupGrade,
        biasState: biasAligned ? 'aligned' : 'misaligned',
        volatilityState: volatilityExpansion
          ? 'expanding_after_compression'
          : 'compressed',
        liquidityState: liquidityMapped ? 'mapped' : 'not_mapped',
        cycleState: cycleAligned ? 'aligned' : 'not_aligned',
        divergenceState: 'none',
        economicRiskState: economicRiskClear ? 'clear' : 'elevated',
        status: 'closed',
      }),
    },
  );

  const executionResult = await executionResponse.json();

  return NextResponse.json({
    ok: executionResponse.ok,
    signal: {
      symbol,
      tradeSide,
      confidenceScore,
      setupGrade,
      conditions: {
        biasAligned,
        volatilityExpansion,
        liquidityMapped,
        cycleAligned,
        economicRiskClear,
      },
    },
    execution: executionResult,
  });
}