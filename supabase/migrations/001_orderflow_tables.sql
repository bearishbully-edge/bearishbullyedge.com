-- Create orderflow_snapshots table
CREATE TABLE orderflow_snapshots (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  instrument TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  current_price NUMERIC NOT NULL,
  footprint JSONB NOT NULL,
  active_patterns JSONB,
  large_orders JSONB,
  performance JSONB,
  delta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orderflow_user_time ON orderflow_snapshots(user_id, timestamp DESC);
CREATE INDEX idx_orderflow_instrument ON orderflow_snapshots(instrument);

-- Create orderflow_live table for realtime updates
CREATE TABLE orderflow_live (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  instrument TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create large_order_alerts table
CREATE TABLE large_order_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id BIGINT NOT NULL,
  price NUMERIC NOT NULL,
  volume BIGINT NOT NULL,
  direction TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_large_orders_user ON large_order_alerts(user_id, timestamp DESC);

-- Create pattern_alerts table
CREATE TABLE pattern_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  pattern_type TEXT NOT NULL,
  price_level NUMERIC NOT NULL,
  signal TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pattern_alerts_user ON pattern_alerts(user_id, timestamp DESC);

-- Create realtime_alerts table
CREATE TABLE realtime_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_realtime_alerts_user ON realtime_alerts(user_id, created_at DESC);

-- Create api_keys table
CREATE TABLE api_keys (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_key ON api_keys(key) WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE orderflow_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE orderflow_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE large_order_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE realtime_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own orderflow data" ON orderflow_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own live orderflow" ON orderflow_live FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own large orders" ON large_order_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own patterns" ON pattern_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own alerts" ON realtime_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own API keys" ON api_keys FOR ALL USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orderflow_live;
ALTER PUBLICATION supabase_realtime ADD TABLE realtime_alerts;