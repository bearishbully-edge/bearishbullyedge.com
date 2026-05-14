-- ============================================
-- BearishBully Edge - Supabase Schema
-- Volume Data Table with Row Level Security
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing table if recreating
DROP TABLE IF EXISTS volume_data CASCADE;

-- Create volume_data table
CREATE TABLE volume_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol text NOT NULL DEFAULT 'MNQ',
    related_symbol text DEFAULT 'QQQ',
    bar_time timestamptz NOT NULL,
    open_volume numeric NOT NULL,
    close_volume numeric NOT NULL,
    delta_volume numeric NOT NULL,
    timeframe text NOT NULL DEFAULT '1m',
    source text DEFAULT 'NinjaTrader',
    created_at timestamptz DEFAULT now(),
    
    -- Constraints
    CONSTRAINT valid_timeframe CHECK (timeframe IN ('1m', '5m', '15m', '30m', '1h', '4h', '1d')),
    CONSTRAINT valid_volumes CHECK (open_volume >= 0 AND close_volume >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_volume_data_symbol ON volume_data(symbol);
CREATE INDEX idx_volume_data_bar_time ON volume_data(bar_time DESC);
CREATE INDEX idx_volume_data_symbol_time ON volume_data(symbol, bar_time DESC);
CREATE INDEX idx_volume_data_timeframe ON volume_data(timeframe);

-- Enable Row Level Security
ALTER TABLE volume_data ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Policy 1: Service role can INSERT (for API writes)
-- This allows the API to insert data using service_role key
CREATE POLICY "Service role can insert volume data"
ON volume_data
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy 2: Authenticated users can SELECT (read-only)
-- This allows logged-in users to read data
CREATE POLICY "Authenticated users can read volume data"
ON volume_data
FOR SELECT
TO authenticated
USING (true);

-- Policy 3: Anonymous users can SELECT (public read-only)
-- Enable this if you want public dashboard access without login
CREATE POLICY "Public read access to volume data"
ON volume_data
FOR SELECT
TO anon
USING (true);

-- Policy 4: Service role can SELECT (for admin queries)
CREATE POLICY "Service role can read volume data"
ON volume_data
FOR SELECT
TO service_role
USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get latest volume delta for a symbol
CREATE OR REPLACE FUNCTION get_latest_delta(p_symbol text, p_minutes integer DEFAULT 60)
RETURNS TABLE (
    total_delta numeric,
    avg_delta numeric,
    bar_count bigint,
    latest_time timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(delta_volume) as total_delta,
        AVG(delta_volume) as avg_delta,
        COUNT(*) as bar_count,
        MAX(bar_time) as latest_time
    FROM volume_data
    WHERE symbol = p_symbol
    AND bar_time >= NOW() - (p_minutes || ' minutes')::interval;
END;
$$ LANGUAGE plpgsql;

-- Function to get volume summary by timeframe
CREATE OR REPLACE FUNCTION get_volume_summary(p_symbol text, p_timeframe text DEFAULT '1m')
RETURNS TABLE (
    hour_of_day integer,
    avg_open_volume numeric,
    avg_close_volume numeric,
    avg_delta numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM bar_time)::integer as hour_of_day,
        AVG(open_volume) as avg_open_volume,
        AVG(close_volume) as avg_close_volume,
        AVG(delta_volume) as avg_delta
    FROM volume_data
    WHERE symbol = p_symbol
    AND timeframe = p_timeframe
    AND bar_time >= NOW() - interval '30 days'
    GROUP BY EXTRACT(HOUR FROM bar_time)
    ORDER BY hour_of_day;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO volume_data (symbol, related_symbol, bar_time, open_volume, close_volume, delta_volume, timeframe, source)
VALUES 
    ('MNQ', 'QQQ', NOW() - interval '5 minutes', 15420, 14230, 1190, '1m', 'NinjaTrader'),
    ('MNQ', 'QQQ', NOW() - interval '4 minutes', 16890, 15340, 1550, '1m', 'NinjaTrader'),
    ('MNQ', 'QQQ', NOW() - interval '3 minutes', 14560, 16230, -1670, '1m', 'NinjaTrader'),
    ('MNQ', 'QQQ', NOW() - interval '2 minutes', 17340, 15890, 1450, '1m', 'NinjaTrader'),
    ('MNQ', 'QQQ', NOW() - interval '1 minute', 15780, 14920, 860, '1m', 'NinjaTrader');
*/

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_latest_delta TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION get_volume_summary TO authenticated, anon, service_role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'volume_data';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'volume_data';

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
