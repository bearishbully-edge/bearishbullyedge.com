import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { symbol, related_symbol, bar_time, open_volume, close_volume, delta_volume, timeframe, source } = req.body;

    const { error } = await supabase
      .from('volume_data')
      .insert({
        symbol: symbol || 'MNQ',
        related_symbol: related_symbol || 'QQQ',
        bar_time,
        open_volume,
        close_volume,
        delta_volume,
        timeframe: timeframe || '1m',
        source: source || 'NinjaTrader'
      });

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}