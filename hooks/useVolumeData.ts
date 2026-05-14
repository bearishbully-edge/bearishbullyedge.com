import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { cacheService } from '../lib/cache';
import { VolumeStats, VolumeQueryParams, VolumeBar } from '../types/volume';

export const useVolumeData = (params: VolumeQueryParams) => {
  const [data, setData] = useState<VolumeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const getCacheKey = useCallback(() => {
    return `volume-${params.symbol}-${params.timeframe}-${params.timeRange}`;
  }, [params.symbol, params.timeframe, params.timeRange]);

  const getTimeCutoff = useCallback((): Date => {
    const now = Date.now();
    switch (params.timeRange) {
      case '1h': return new Date(now - 60 * 60 * 1000);
      case '24h': return new Date(now - 24 * 60 * 60 * 1000);
      case 'all': return new Date(0);
      default: return new Date(now - 60 * 60 * 1000);
    }
  }, [params.timeRange]);

  const processVolumeData = useCallback((volumeData: VolumeBar[]): VolumeStats => {
    if (!volumeData || volumeData.length === 0) {
      return {
        totalDelta: 0,
        avgDelta: 0,
        barCount: 0,
        lastUpdate: '',
        volumeHistory: [],
        timestamp: Date.now()
      };
    }

    const totalDelta = volumeData.reduce((sum, bar) => sum + bar.delta_volume, 0);
    const avgDelta = totalDelta / volumeData.length;
    const lastUpdate = volumeData[0]?.bar_time || '';

    const volumeHistory = volumeData
      .slice(0, 20)
      .reverse()
      .map(bar => ({
        timestamp: bar.bar_time,
        delta: bar.delta_volume
      }));

    return {
      totalDelta,
      avgDelta,
      barCount: volumeData.length,
      lastUpdate,
      volumeHistory,
      timestamp: Date.now()
    };
  }, []);

  const fetchVolumeData = useCallback(async (): Promise<VolumeStats> => {
    const cacheKey = getCacheKey();
    const cached = cacheService.get<VolumeStats>(cacheKey);
    
    if (cached && params.timeRange === '1h' && Date.now() - cached.timestamp < 30000) {
      return cached;
    }

    const timeCutoff = getTimeCutoff();
    let query = supabase
      .from('volume_data')
      .select('*')
      .eq('symbol', params.symbol)
      .eq('timeframe', params.timeframe)
      .order('bar_time', { ascending: false })
      .limit(50);

    if (params.timeRange !== 'all') {
      query = query.gte('bar_time', timeCutoff.toISOString());
    }

    const { data: volumeData, error: dbError } = await query;
    if (dbError) throw dbError;

    const processedData = processVolumeData(volumeData || []);
    const ttl = params.timeRange === '1h' ? 30000 : 5 * 60 * 1000;
    cacheService.set(cacheKey, processedData, ttl);

    return processedData;
  }, [getCacheKey, getTimeCutoff, params, processVolumeData]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const volumeStats = await fetchVolumeData();
        if (mounted) {
          setData(volumeStats);
          setIsLive(true);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Failed to fetch volume data');
          setIsLive(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { mounted = false; };
  }, [fetchVolumeData]);

  const refresh = useCallback(async () => {
    const cacheKey = getCacheKey();
    cacheService.delete(cacheKey);
    try {
      const newData = await fetchVolumeData();
      setData(newData);
    } catch (err: any) {
      setError(err.message || 'Refresh failed');
    }
  }, [getCacheKey, fetchVolumeData]);

  return { data, loading, error, isLive, refresh, params };
};