import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);
    const { data: user } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const order = await request.json();

    await supabase.from('large_order_alerts').insert({
      user_id: user.user_id,
      order_id: order.Id,
      price: order.Price,
      volume: order.Volume,
      direction: order.Direction,
      confidence: order.Confidence,
      timestamp: order.Time
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}