import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'SPX';

    // Fetch latest bias for symbol
    const { data, error } = await supabase
      .from('daily_bias')
      .select('*')
      .eq('symbol', symbol)
      .order('computed_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bias data' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No bias data available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET all symbols latest bias
export async function POST(request: Request) {
  try {
    const { data, error } = await supabase
      .from('daily_bias')
      .select('*')
      .in('symbol', ['SPX', 'NDX', 'DJIA'])
      .order('computed_at', { ascending: false });

    if (error) throw error;

    // Group by symbol, take most recent
    const latest: { [key: string]: any } = {};
    data?.forEach((row) => {
      if (!latest[row.symbol]) {
        latest[row.symbol] = row;
      }
    });

    return NextResponse.json({
      success: true,
      data: Object.values(latest)
    });

  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}