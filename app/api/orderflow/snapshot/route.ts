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
    
    const { data: user, error } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const snapshot = await request.json();

    const { error: insertError } = await supabase
      .from('orderflow_snapshots')
      .insert({
        user_id: user.user_id,
        instrument: snapshot.Instrument,
        timestamp: snapshot.Timestamp,
        current_price: snapshot.CurrentPrice,
        footprint: snapshot.Footprint,
        active_patterns: snapshot.ActivePatterns,
        large_orders: snapshot.LargeOrders,
        performance: snapshot.Performance,
        delta: snapshot.Delta
      });

    if (insertError) throw insertError;

    await supabase
      .from('orderflow_live')
      .upsert({
        user_id: user.user_id,
        instrument: snapshot.Instrument,
        data: snapshot,
        updated_at: new Date().toISOString()
      });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}