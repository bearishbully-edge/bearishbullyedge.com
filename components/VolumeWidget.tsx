// components/VolumeWidget.tsx
// Real-time volume delta display with sparkline visualization

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface VolumeData {
  timestamp: string;
  delta: number;
}

interface VolumeWidgetProps {
  symbol?: string;
  timeframe?: string;
  refreshInterval?: number; // milliseconds
}

export default function VolumeWidget({
  symbol = 'MNQ',
  timeframe = '1m',
  refreshInterval = 30000 // 30 seconds
}: VolumeWidgetProps) {
  const [totalDelta, setTotalDelta] = useState<number>(0);
  const [avgDelta, setAvgDelta] = useState<number>(0);
  const [barCount, setBarCount] = useState<number>(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [volumeHistory, setVolumeHistory] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVolumeData = async () => {
    try {
      // First, try to fetch directly from volume_data table
      // This bypasses the view which might not be working
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: recentData, error: dataError } = await supabase
        .from('volume_data')
        .select('bar_time, delta_volume')
        .eq('symbol', symbol)
        .eq('timeframe', timeframe)
        .gte('bar_time', oneHourAgo)
        .order('bar_time', { ascending: false })
        .limit(20);

      if (dataError) {
        console.error('Database error:', dataError);
        setError('Database connection issue - check console');
        setLoading(false);
        return;
      }

      if (recentData && recentData.length > 0) {
        // Calculate summary from the data
        const deltas = recentData.map(item => Number(item.delta_volume));
        const total = deltas.reduce((sum, val) => sum + val, 0);
        const avg = total / deltas.length;
        
        setTotalDelta(total);
        setAvgDelta(avg);
        setBarCount(deltas.length);
        setLastUpdate(recentData[0].bar_time);

        // Set history for sparkline
        const history = recentData
          .reverse()
          .map(item => ({
            timestamp: item.bar_time,
            delta: Number(item.delta_volume)
          }));
        setVolumeHistory(history);
        setError(null);
      } else {
        // No data in last hour
        setTotalDelta(0);
        setAvgDelta(0);
        setBarCount(0);
        setLastUpdate('');
        setVolumeHistory([]);
        setError('No recent data (need data from last hour)');
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching volume data:', err);
      setError(err.message || 'Failed to fetch volume data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumeData();
    const interval = setInterval(fetchVolumeData, refreshInterval);
    return () => clearInterval(interval);
  }, [symbol, timeframe, refreshInterval]);

  // Calculate sparkline path
  const getSparklinePath = () => {
    if (volumeHistory.length === 0) return '';

    const width = 100;
    const height = 30;
    const padding = 2;

    const values = volumeHistory.map(d => d.delta);
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const points = volumeHistory.map((d, i) => {
      const x = (i / (volumeHistory.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((d.delta - min) / range) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  // Determine bias color
  const getBiasColor = () => {
    if (totalDelta > 0) return 'text-green-400';
    if (totalDelta < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getBiasBackground = () => {
    if (totalDelta > 0) return 'bg-green-500/10 border-green-500/30';
    if (totalDelta < 0) return 'bg-red-500/10 border-red-500/30';
    return 'bg-gray-500/10 border-gray-500/30';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'No data';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
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

  return (
    <div className={`border rounded-lg p-4 ${getBiasBackground()}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">
          {symbol} Volume Delta
        </h3>
        <span className="text-xs text-gray-500">{timeframe}</span>
      </div>

      <div className={`text-3xl font-bold mb-1 ${getBiasColor()}`}>
        {totalDelta > 0 ? '+' : ''}{formatNumber(totalDelta)}
      </div>

      <div className="text-xs text-gray-400 mb-3">
        Avg: {avgDelta > 0 ? '+' : ''}{formatNumber(avgDelta)} | Bars: {barCount}
      </div>

      {volumeHistory.length > 0 && (
        <svg
          viewBox="0 0 100 30"
          className="w-full h-8 mb-2"
          preserveAspectRatio="none"
        >
          <path
            d={getSparklinePath()}
            fill="none"
            stroke={totalDelta > 0 ? '#4ade80' : '#f87171'}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      <div className="text-xs text-gray-500">
        Last update: {formatTime(lastUpdate)}
      </div>
    </div>
  );
}
