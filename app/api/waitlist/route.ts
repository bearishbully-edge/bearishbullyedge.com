import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

type WaitlistRequestBody = {
  name?: unknown;
  email?: unknown;
  tradingFocus?: unknown;
  source?: unknown;
};

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
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
        error: 'waitlist_not_configured',
        message: 'Waitlist is not configured.',
      },
      { status: 503 },
    );
  }

  let body: WaitlistRequestBody;

  try {
    body = (await req.json()) as WaitlistRequestBody;
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

  const email = normalizeString(body.email)?.toLowerCase();
  const name = normalizeString(body.name);
  const tradingFocus = normalizeString(body.tradingFocus);
  const source = normalizeString(body.source) || 'bearishbullyedge';

  if (!email || !email.includes('@')) {
    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_email',
        message: 'A valid email is required.',
      },
      { status: 400 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { error } = await supabase.from('waitlist_signups').upsert(
    {
      email,
      name,
      trading_focus: tradingFocus,
      source,
      status: 'pending',
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'email',
    },
  );

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'waitlist_insert_failed',
        message: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'Waitlist request received.',
  });
}