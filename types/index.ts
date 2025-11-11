// ============================================
// BearishBully Edge - TypeScript Types
// ============================================

export interface VolumeBar {
  id?: string;
  symbol: string;
  related_symbol?: string;
  bar_time: string; // ISO 8601 timestamp
  open_volume: number;
  close_volume: number;
  delta_volume: number;
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
  source?: string;
  created_at?: string;
}

export interface VolumeBarInput {
  symbol: string;
  related_symbol?: string;
  bar_time: string;
  open_volume: number;
  close_volume: number;
  delta_volume: number;
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';
  source?: string;
}

export interface VolumeSummary {
  total_delta: number;
  avg_delta: number;
  bar_count: number;
  latest_time: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type BiasDirection = 'bullish' | 'bearish' | 'neutral';

export interface VolumeMetrics {
  symbol: string;
  current_delta: number;
  avg_delta_1h: number;
  avg_delta_4h: number;
  bias: BiasDirection;
  confidence: number; // 0-100
  last_updated: string;
}

export interface ChartDataPoint {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta?: number;
}

// Database response types
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: DatabaseError | null;
}

// Widget configuration types
export interface WidgetConfig {
  symbol: string;
  timeframe: string;
  refreshInterval: number; // milliseconds
  showSparkline: boolean;
}

export interface TerminalLayout {
  leftPanel: {
    width: string;
    visible: boolean;
  };
  rightPanel: {
    width: string;
    visible: boolean;
  };
  bottomPanel: {
    height: string;
    visible: boolean;
  };
}

// API request/response types
export interface VolumeApiRequest {
  bars: VolumeBarInput[];
}

export interface VolumeApiResponse {
  success: boolean;
  inserted: number;
  errors?: ValidationError[];
}

// Environment variable types
export interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  MNQ_DEFAULT_SYMBOL: string;
}
