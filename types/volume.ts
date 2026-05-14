export interface VolumeBar {
  id: string;
  symbol: string;
  bar_time: string;
  open_volume: number;
  close_volume: number;
  delta_volume: number;
  timeframe: string;
  source: string;
  created_at: string;
}

export interface VolumeStats {
  totalDelta: number;
  avgDelta: number;
  barCount: number;
  lastUpdate: string;
  volumeHistory: VolumeData[];
  timestamp: number;
}

export interface VolumeData {
  timestamp: string;
  delta: number;
}

export type TimeRange = '1h' | '24h' | 'all';
export type UserTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface VolumeQueryParams {
  symbol: string;
  timeframe: string;
  timeRange: TimeRange;
  limit?: number;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}