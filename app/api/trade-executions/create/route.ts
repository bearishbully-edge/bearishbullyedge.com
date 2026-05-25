import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type CreateTradeExecutionBody = {
  userId?: unknown;
  executionSource?: unknown;
  brokerTradeId?: unknown;

  symbol?: unknown;
  tradeSide?: unknown;
  strategyName?: unknown;
  executionMode?: unknown;

  entryPrice?: unknown;
  stopPrice?: unknown;
  targetPrice?: unknown;
  exitPrice?: unknown;
  quantity?: unknown;
  pnl?: unknown;

  confidenceScore?: unknown;
  setupGrade?: unknown;

  biasState?: unknown;
  volatilityState?: unknown;
  liquidityState?: unknown;
  cycleState?: unknown;
  divergenceState?: unknown;
  economicRiskState?: unknown;

  status?: unknown;
};

function asString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  if (typeof value === 'string') {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      {
        ok: false,
        error: 'server_not_configured',
        message: 'Supabase server credentials are missing.',
      },
      { status: 503 },
    );
  }

  let body: CreateTradeExecutionBody;

  try {
    body = (await req.json()) as CreateTradeExecutionBody;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_json',
        message: 'Invalid request body.',
      },
      { status: 400 },
    );
  }

  const userId = asString(body.userId);
  const symbol = asString(body.symbol)?.toUpperCase();
  const tradeSide = asString(body.tradeSide)?.toLowerCase();

  if (!userId || !symbol || !tradeSide) {
    return NextResponse.json(
      {
        ok: false,
        error: 'missing_required_fields',
        message: 'userId, symbol, and tradeSide are required.',
      },
      { status: 400 },
    );
  }

  if (!['long', 'short', 'buy', 'sell'].includes(tradeSide)) {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_trade_side',
        message: 'tradeSide must be long, short, buy, or sell.',
      },
      { status: 400 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const executionPayload = {
    user_id: userId,
    execution_source: asString(body.executionSource) ?? 'paper',
    broker_trade_id: asString(body.brokerTradeId),

    symbol,
    trade_side: tradeSide,
    strategy_name: asString(body.strategyName),
    execution_mode: asString(body.executionMode) ?? 'paper',

    entry_price: asNumber(body.entryPrice),
    stop_price: asNumber(body.stopPrice),
    target_price: asNumber(body.targetPrice),
    exit_price: asNumber(body.exitPrice),
    quantity: asNumber(body.quantity),
    pnl: asNumber(body.pnl),

    confidence_score: asNumber(body.confidenceScore),
    setup_grade: asString(body.setupGrade),

    bias_state: asString(body.biasState),
    volatility_state: asString(body.volatilityState),
    liquidity_state: asString(body.liquidityState),
    cycle_state: asString(body.cycleState),
    divergence_state: asString(body.divergenceState),
    economic_risk_state: asString(body.economicRiskState),

    status: asString(body.status) ?? 'open',
  };

const shouldUseUpsert =
typeof executionPayload.broker_trade_id === 'string' &&
executionPayload.broker_trade_id.length > 0;

const executionQuery = shouldUseUpsert
? supabase
    .from('trade_executions')
    .upsert(executionPayload, {
        onConflict: 'user_id,execution_source,broker_trade_id',
    })
    .select('id')
    .single()
: supabase
    .from('trade_executions')
    .insert(executionPayload)
    .select('id')
    .single();

const { data: execution, error: executionError } = await executionQuery;

  if (executionError || !execution) {
    return NextResponse.json(
      {
        ok: false,
        error: 'execution_insert_failed',
        message: executionError?.message ?? 'Execution insert failed.',
      },
      { status: 500 },
    );
  }

  const journalNotes = [
    `Auto-created from execution ${execution.id}.`,
    `Execution source: ${executionPayload.execution_source}.`,
    `System confidence score: ${executionPayload.confidence_score ?? 'not scored'}.`,
    `System setup grade: ${executionPayload.setup_grade ?? 'not graded'}.`,
  ].join('\n\n');

const { data: existingJournalEntry, error: existingJournalError } =
  await supabase
    .from('trade_journal_entries')
    .select('id')
    .eq('execution_id', execution.id)
    .maybeSingle();

if (existingJournalError) {
  return NextResponse.json(
    {
      ok: false,
      error: 'journal_lookup_failed',
      message: existingJournalError.message,
      executionId: execution.id,
    },
    { status: 500 },
  );
}

if (existingJournalEntry) {
  return NextResponse.json({
    ok: true,
    executionId: execution.id,
    journalEntryId: existingJournalEntry.id,
    reused: true,
  });
}

const { data: journalEntry, error: journalError } = await supabase
  .from('trade_journal_entries')
  .insert({
    execution_id: execution.id,

    user_id: userId,
    symbol,
    trade_side: tradeSide,

    setup_name: executionPayload.strategy_name,
    entry_price: executionPayload.entry_price,
    stop_price: executionPayload.stop_price,
    target_price: executionPayload.target_price,
    exit_price: executionPayload.exit_price,
    pnl: executionPayload.pnl,

    bias_state: executionPayload.bias_state,
    volatility_state: executionPayload.volatility_state,
    liquidity_context: executionPayload.liquidity_state,
    cycle_context: executionPayload.cycle_state,
    divergence_context: executionPayload.divergence_state,
    economic_risk: executionPayload.economic_risk_state,

    rule_followed: null,
    emotional_state: null,
    lesson: null,
    notes: journalNotes,
  })
  .select('id')
  .single();

  if (journalError || !journalEntry) {
    return NextResponse.json(
      {
        ok: false,
        error: 'journal_insert_failed',
        message: journalError?.message ?? 'Journal draft insert failed.',
        executionId: execution.id,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    executionId: execution.id,
    journalEntryId: journalEntry.id,
  });
}