// components/VolumeWidget.tsx
// Real-time volume delta display with sparkline

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface VolumeBar {
  bar_time: string;
  open_volume: number;
  close_volume: number;
  delta_volume: number;
  source: string;
}

interface VolumeStats {
  totalDelta: number;
  avgDelta: number;
  barCount: number;
  lastUpdate: string;
  sparklineData: number[];
  isLive: boolean;
  dataSource: string;
}

interface VolumeWidgetProps {
  symbol?: string;
  timeframe?: string;
  refreshInterval?: number;
  timeRange?: '1h' | '24h' | 'all';
}

export default function VolumeWidget({
  symbol = 'MNQ',
  timeframe = '1m',
  refreshInterval = 30000,
  timeRange = '1h'
}: VolumeWidgetProps) {
  const [stats, setStats] = useState<VolumeStats>({
    totalDelta: 0,
    avgDelta: 0,
    barCount: 0,
    lastUpdate: '',
    sparklineData: [],
    isLive: false,
    dataSource: 'unknown'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getTimeCutoff = (): string => {
    if (timeRange === 'all') return new Date(0).toISOString();
    const hours = timeRange === '1h' ? 1 : 24;
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  };

  const detectDataMode = (data: VolumeBar[]): { isLive: boolean; source: string } => {
    if (!data.length) return { isLive: false, source: 'no-data' };
    
    // Method 1: Check source field (most reliable)
    const sourceField = data[0].source?.toLowerCase() || '';
    if (sourceField.includes('playback') || sourceField.includes('historical')) {
      return { isLive: false, source: sourceField };
    }
    if (sourceField.includes('live') || sourceField.includes('realtime')) {
      return { isLive: true, source: sourceField };
    }
    
    // Method 2: Check timestamp age AND market hours
    const latestBar = new Date(data[0].bar_time).getTime();
    const now = Date.now();
    const timeDiff = now - latestBar;
    
    // Check if data is recent (within 5 minutes)
    const isRecent = timeDiff < 5 * 60 * 1000;
    
    // Check if it's market hours (Sunday 6pm - Friday 5pm ET, with daily break)
    const nowET = new Date(now);
    const dayOfWeek = nowET.getUTCDay();
    const hourET = nowET.getUTCHours() - 5; // Convert to ET (simplified)
    
    const isMarketHours = 
      (dayOfWeek === 0 && hourET >= 18) || // Sunday after 6pm
      (dayOfWeek >= 1 && dayOfWeek <= 4) || // Monday-Thursday
      (dayOfWeek === 5 && hourET < 17); // Friday before 5pm
    
    // Data is live if it's both recent AND during market hours
    const isLive = isRecent && isMarketHours;
    
    return { 
      isLive, 
      source: isLive ? 'live-detected' : 'playback-detected' 
    };
  };

  const calculateStats = (data: VolumeBar[]): VolumeStats => {
    if (!data.length) {
      return {
        totalDelta: 0,
        avgDelta: 0,
        barCount: 0,
        lastUpdate: '',
        sparklineData: [],
        isLive: false,
        dataSource: 'no-data'
      };
    }

    const { isLive, source } = detectDataMode(data);
    const totalDelta = data.reduce((sum, bar) => sum + bar.delta_volume, 0);
    const sparklineData = data.slice(0, 20).reverse().map(bar => bar.delta_volume);

    return {
      totalDelta,
      avgDelta: totalDelta / data.length,
      barCount: data.length,
      lastUpdate: data[0].bar_time,
      sparklineData,
      isLive,
      dataSource: source
    };
  };

  const fetchVolumeData = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('volume_data')
        .select('bar_time, open_volume, close_volume, delta_volume, source')
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .gte('bar_time', getTimeCutoff())
        .order('bar_time', { ascending: false });

      if (fetchError) throw fetchError;

      const calculatedStats = calculateStats(data || []);
      setStats(calculatedStats);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching volume data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchVolumeData();
    const interval = setInterval(fetchVolumeData, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, timeframe, timeRange]);

  const getSparklinePath = (): string => {
    if (stats.sparklineData.length === 0) return '';

    const width = 100;
    const height = 30;
    const padding = 2;
    const values = stats.sparklineData;
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const points = values.map((value, i) => {
      const x = (i / (values.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((value - min) / range) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const getBiasColor = (): string => {
    if (stats.totalDelta > 0) return 'text-green-400';
    if (stats.totalDelta < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getBiasBackground = (): string => {
    if (stats.totalDelta > 0) return 'bg-green-500/10 border-green-500/30';
    if (stats.totalDelta < 0) return 'bg-red-500/10 border-red-500/30';
    return 'bg-gray-500/10 border-gray-500/30';
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const formatTime = (timestamp: string): string => {
    if (!timestamp) return 'No data';
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDataSourceBadge = () => {
    if (!stats.isLive) {
      return (
        <div className="flex items-center space-x-1 text-xs">
          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
          <span className="text-yellow-400">Playback</span>
        </div>
      );
    }
    return (
      <div className="flex items-center space-x-1 text-xs">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-green-400">Live</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 border border-red-500/30 rounded-lg p-4">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  const showPlaybackWarning = !stats.isLive && timeRange !== 'all';

  return (
    <div className={`border rounded-lg p-4 ${getBiasBackground()}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">
          {symbol} Volume Delta
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{timeframe}</span>
          {getDataSourceBadge()}
        </div>
      </div>

      {showPlaybackWarning && (
        <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
          Warning: Historical data - Time filters show relative to playback session
        </div>
      )}

      <div className={`text-3xl font-bold mb-1 ${getBiasColor()}`}>
        {stats.totalDelta > 0 ? '+' : ''}{formatNumber(stats.totalDelta)}
      </div>

      <div className="text-xs text-gray-400 mb-3">
        Avg: {stats.avgDelta > 0 ? '+' : ''}{formatNumber(stats.avgDelta)} | Bars: {stats.barCount}
      </div>

      {stats.sparklineData.length > 0 && (
        <svg
          viewBox="0 0 100 30"
          className="w-full h-8 mb-2"
          preserveAspectRatio="none"
        >
          <path
            d={getSparklinePath()}
            fill="none"
            stroke={stats.totalDelta > 0 ? '#4ade80' : '#f87171'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>Last update: {formatTime(stats.lastUpdate)}</span>
        {!stats.isLive && (
          <span className="text-yellow-500 text-xs">({stats.dataSource})</span>
        )}
      </div>
    </div>
  );
}