-- BearishBully Edge - Volume Data Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create volume_data table
CREATE TABLE IF NOT EXISTS volume_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL DEFAULT 'MNQ',
    related_symbol TEXT DEFAULT 'QQQ',
    bar_time TIMESTAMPTZ NOT NULL,
    open_volume NUMERIC NOT NULL CHECK (open_volume >= 0),
    close_volume NUMERIC NOT NULL CHECK (close_volume >= 0),
    delta_volume NUMERIC NOT NULL,
    timeframe TEXT NOT NULL DEFAULT '1m',
    source TEXT NOT NULL DEFAULT 'NinjaTrader',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_volume_data_symbol ON volume_data(symbol);
CREATE INDEX IF NOT EXISTS idx_volume_data_bar_time ON volume_data(bar_time DESC);
CREATE INDEX IF NOT EXISTS idx_volume_data_symbol_time ON volume_data(symbol, bar_time DESC);
CREATE INDEX IF NOT EXISTS idx_volume_data_timeframe ON volume_data(timeframe);

-- Enable Row Level Security
ALTER TABLE volume_data ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service role can do everything (for API inserts)
CREATE POLICY "Service role has full access"
    ON volume_data
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 2: Authenticated users can read all data
CREATE POLICY "Authenticated users can read volume data"
    ON volume_data
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy 3: Anonymous users can read data (optional - enable if you want public access)
CREATE POLICY "Anonymous users can read volume data"
    ON volume_data
    FOR SELECT
    TO anon
    USING (true);

-- Policy 4: No public inserts/updates/deletes (only service_role via API)
CREATE POLICY "Block public writes"
    ON volume_data
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (false);

-- Create view for latest volume delta aggregation
CREATE OR REPLACE VIEW latest_volume_summary AS
SELECT 
    symbol,
    timeframe,
    SUM(delta_volume) as total_delta,
    AVG(delta_volume) as avg_delta,
    COUNT(*) as bar_count,
    MAX(bar_time) as last_update
FROM volume_data
WHERE bar_time > NOW() - INTERVAL '1 hour'
GROUP BY symbol, timeframe;

-- Grant access to view
GRANT SELECT ON latest_volume_summary TO authenticated, anon;

-- Create function to clean old data (optional - keeps DB lean)
CREATE OR REPLACE FUNCTION cleanup_old_volume_data(days_to_keep INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM volume_data
    WHERE bar_time < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run this manually or via pg_cron if available)
-- SELECT cleanup_old_volume_data(30);

COMMENT ON TABLE volume_data IS 'Stores volume bar data from NinjaTrader for MNQ and related instruments';
COMMENT ON COLUMN volume_data.delta_volume IS 'Buy volume minus sell volume (positive = bullish, negative = bearish)';
COMMENT ON COLUMN volume_data.bar_time IS 'Timestamp of the bar close (UTC)';
