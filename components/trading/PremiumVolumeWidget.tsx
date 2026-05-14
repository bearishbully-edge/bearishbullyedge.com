'use client';

import { useState, useEffect } from 'react';
import { useVolumeData } from '../../hooks/useVolumeData';
import { usePremiumFeatures } from '../../hooks/usePremiumFeatures';
import AffiliateOffers from '../revenue/AffiliateOffers';
import { AdvancedVolumeStats } from '../../types/volume';

export default function PremiumVolumeWidget() {
  const [symbol, setSymbol] = useState('MNQ');
  const [timeframe, setTimeframe] = useState('1m');
  const { data, loading, error, isLive, refresh } = useVolumeData(
    { symbol, timeframe, timeRange: '1h' },
    true
  );
  
  const { userTier, setUserTier, hasAccess, upgradePrompt, subscriptionTiers } = usePremiumFeatures();

  const stats = data as AdvancedVolumeStats;

  const renderAdvancedSparkline = () => {
    if (!stats?.volumeHistory.length) return null;

    const width = 120;
    const height = 40;
    const padding = 2;

    const values = stats.volumeHistory.map(d => d.delta);
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);
    const range = Math.max(max - min, 1);

    const points = stats.volumeHistory.map((item, index) => {
      const x = (index / (stats.volumeHistory.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((item.delta - min) / range) * (height - 2 * padding) - padding;
      return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;
    const strokeColor = stats.totalDelta > 0 ? '#10b981' : '#ef4444';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 mb-2" preserveAspectRatio="none">
        <defs>
          <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <path d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`} fill="url(#volumeGradient)" />
        <path d={pathData} fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {stats.anomalyScore > 2 && (
          <circle cx={points[0].split(',')[0]} cy={points[0].split(',')[1]} r="3" fill="#f59e0b" stroke="#fff" strokeWidth="1.5" />
        )}
      </svg>
    );
  };

  if (!hasAccess('advanced-analytics')) {
    return upgradePrompt('advanced-analytics');
  }

  return (
    <div className="space-y-4">
      <AffiliateOffers />

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
              <span className="text-white text-lg">??</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Premium Volume Analytics</h2>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <span>{symbol}</span>
                <span>•</span>
                <span>{timeframe}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isLive && (
              <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-semibold">LIVE</span>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {userTier.toUpperCase()} TIER
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-gray-400 text-xs mb-1">Total Delta</div>
            <div className={`text-xl font-bold ${(stats?.totalDelta || 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats ? (stats.totalDelta > 0 ? '+' : '') + stats.totalDelta.toLocaleString() : '--'}
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-gray-400 text-xs mb-1">Anomaly Score</div>
            <div className={`text-xl font-bold ${(stats?.anomalyScore || 0) > 2 ? 'text-red-400' : (stats?.anomalyScore || 0) > 1 ? 'text-yellow-400' : 'text-green-400'}`}>
              {stats?.anomalyScore?.toFixed(2) || '--'}
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-gray-400 text-xs mb-1">Prediction</div>
            <div className={`text-xl font-bold ${stats?.prediction === 'bullish' ? 'text-green-400' : stats?.prediction === 'bearish' ? 'text-red-400' : 'text-gray-400'}`}>
              {stats?.prediction?.toUpperCase() || '--'}
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-gray-400 text-xs mb-1">Confidence</div>
            <div className="text-xl font-bold text-blue-400">
              {stats?.confidence ? Math.round(stats.confidence) + '%' : '--'}
            </div>
          </div>
        </div>

        <div className="mb-4">{renderAdvancedSparkline()}</div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Market Regime</div>
            <div className={`text-sm font-semibold ${stats?.marketRegime === 'trending' ? 'text-green-400' : stats?.marketRegime === 'volatile' ? 'text-yellow-400' : 'text-gray-400'}`}>
              {stats?.marketRegime?.toUpperCase() || '--'}
            </div>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs mb-1">Last Update</div>
            <div className="text-sm font-semibold text-gray-300">
              {stats ? new Date(stats.lastUpdate).toLocaleTimeString() : '--'}
            </div>
          </div>
        </div>

        {userTier !== 'pro' && userTier !== 'enterprise' && (
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 mb-4">
            <div className="text-white text-center">
              <div className="font-semibold mb-2 text-lg">?? Unlock Full Potential</div>
              <div className="text-sm opacity-90 mb-3">Get real-time data, advanced analytics, AI predictions, and priority support</div>
              <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105" onClick={() => setUserTier('pro')}>
                Upgrade to PRO - $29.99/month
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="text-yellow-400 font-semibold mb-2 flex items-center"><span className="mr-2">??</span>Recommended Broker</div>
            <div className="text-sm text-yellow-300 mb-3">Trade with low commissions and lightning-fast execution</div>
            <button className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold">Open Account - Get $500 Bonus</button>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="text-green-400 font-semibold mb-2 flex items-center"><span className="mr-2">??</span>Advanced Course</div>
            <div className="text-sm text-green-300 mb-3">Master volume analysis and institutional trading techniques</div>
            <button className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold">Enroll Now - 30% Commission</button>
          </div>
        </div>
      </div>
    </div>
  );
}
