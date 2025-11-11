// lib/supabaseAdmin.ts
// Server-side Supabase client with service_role key (for API routes only)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
}

// This client bypasses RLS - use ONLY in API routes for trusted operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Type definitions for volume data
export interface VolumeBar {
  id?: string;
  symbol: string;
  related_symbol?: string;
  bar_time: string; // ISO 8601 timestamp
  open_volume: number;
  close_volume: number;
  delta_volume: number;
  timeframe: string;
  source: string;
  created_at?: string;
}

export interface VolumeSummary {
  symbol: string;
  timeframe: string;
  total_delta: number;
  avg_delta: number;
  bar_count: number;
  last_update: string;
}
