-- BearishBully Directional Bias Engine - Database Setup

-- Create table
CREATE TABLE IF NOT EXISTS public.daily_bias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  bias TEXT NOT NULL CHECK (bias IN ('Bullish', 'Bearish', 'Neutral')),
  confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  score_raw NUMERIC NOT NULL,
  components JSONB NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_daily_bias_symbol_time ON public.daily_bias (symbol, computed_at DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_bias ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "insert_service_only" ON public.daily_bias;
DROP POLICY IF EXISTS "select_authenticated" ON public.daily_bias;
DROP POLICY IF EXISTS "select_public" ON public.daily_bias;

-- Policy: Server-side inserts only (via service role key)
CREATE POLICY "insert_service_only" ON public.daily_bias
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Authenticated users can read
CREATE POLICY "select_authenticated" ON public.daily_bias
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Allow public reads (for Terminal with anon key)
CREATE POLICY "select_public" ON public.daily_bias
  FOR SELECT
  USING (true);

-- Verify table creation
SELECT 'daily_bias table created successfully' AS status;