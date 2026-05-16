'use client';

import { useMemo, useState } from 'react';
import { useVolumeData } from '../../hooks/useVolumeData';
import { usePremiumFeatures } from '../../hooks/usePremiumFeatures';
import AffiliateOffers from '../revenue/AffiliateOffers';
import type { VolumeStats } from '../../types/volume';

type AdvancedVolumeStats = VolumeStats & {
  anomalyScore: number;
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  marketRegime: 'trending' | 'volatile' | 'sideways';
};

function buildAdvancedStats(data: VolumeStats | null): AdvancedVolumeStats | null {
  if (!data) return null;

  const absDelta = Math.abs(data.totalDelta);
  const absAvgDelta = Math.abs(data.avgDelta);

  const anomalyScore =
    data.barCount > 0 ? Math.min(absDelta / Math.max(absAvgDelta * data.barCount, 1), 5) : 0;

  const prediction =
    data.totalDelta > 0 ? 'bullish' : data.totalDelta < 0 ? 'bearish' : 'neutral';

  const confidence = Math.min(Math.round((absDelta / 3000) * 100), 100);

  const marketRegime =
    anomalyScore > 2 ? 'volatile' : confidence > 60 ? 'trending' : 'sideways';

  return {
    ...data,
    anomalyScore,
    prediction,
    confidence,
    marketRegime,
  };
}

export default function PremiumVolumeWidget() {
  const [symbol] = useState('MNQ');
  const [timeframe] = useState('1m');

  const { data, loading, error, isLive, refresh } = useVolumeData({
    symbol,
    timeframe,
    timeRange: '1h',
  });

  const { entitlement, loading: entitlementLoading, error: entitlementError, hasAccess } =
    usePremiumFeatures();

  const stats = useMemo(() => buildAdvancedStats(data), [data]);

  if (entitlementLoading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-300">
        Verifying premium access...
      </div>
    );
  }

  if (!hasAccess('advanced_volume')) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
        <h2 className="text-lg font-bold text-white mb-2">Premium Volume Analytics</h2>
        <p className="text-sm text-gray-400">
          Advanced volume analytics require an active premium entitlement.
        </p>
        {entitlementError && (
          <p className="text-sm text-red-400 mt-2">{entitlementError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Premium Volume Analytics</h2>
            <div className="text-xs text-gray-400">
              {symbol} • {timeframe}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLive && (
              <span className="text-green-400 text-xs font-semibold">LIVE</span>
            )}
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {entitlement.tier.toUpperCase()}
            </span>
            <button
              onClick={() => void refresh()}
              className="text-xs bg-gray-700 text-gray-200 px-3 py-1 rounded hover:bg-gray-600"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="text-gray-400 text-sm">Loading volume data...</div>}
        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Metric label="Total Delta" value={stats ? stats.totalDelta.toLocaleString() : '--'} />
          <Metric label="Anomaly Score" value={stats ? stats.anomalyScore.toFixed(2) : '--'} />
          <Metric label="Prediction" value={stats ? stats.prediction.toUpperCase() : '--'} />
          <Metric label="Confidence" value={stats ? `${stats.confidence}%` : '--'} />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Metric label="Market Regime" value={stats ? stats.marketRegime.toUpperCase() : '--'} />
          <Metric
            label="Last Update"
            value={stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : '--'}
          />
        </div>

        <AffiliateOffers hasAccess={hasAccess} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-700/50 rounded-lg p-3">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}