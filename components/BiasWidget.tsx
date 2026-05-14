'use client';

import { useEffect, useState } from 'react';

interface BiasData {
  symbol: string;
  bias: string;
  confidence: number;
  timestamp: string;
  composite_score: number;
  vix_change?: number;
  volume_signal?: string;
  signal?: string;
  strength?: string;
  reasoning?: string;
}

export default function BiasWidget() {
  const [biasData, setBiasData] = useState<BiasData[]>([]);
  const [vixData, setVixData] = useState({ change: 2.75, level: 15.8 });
  const [loading, setLoading] = useState(true);
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  const [showVixTooltip, setShowVixTooltip] = useState(false);

  useEffect(() => {
    const mockData: BiasData[] = [
      {
        symbol: 'SPX',
        bias: 'Bearish',
        confidence: 5,
        composite_score: -0.114,
        vix_change: 2.75,
        volume_signal: 'below average',
        signal: 'GO SHORT (or stay out)',
        strength: 'VERY WEAK (5% confidence is basically "no conviction")',
        reasoning: 'VIX up 2.75%, volume below average',
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'NDX',
        bias: 'Neutral',
        confidence: 1,
        composite_score: -0.038,
        vix_change: 2.75,
        signal: 'STAY OUT',
        strength: 'NO CONVICTION (1% is noise)',
        reasoning: 'Mixed signals, no clear direction',
        timestamp: new Date().toISOString()
      },
      {
        symbol: 'DJIA',
        bias: 'Neutral',
        confidence: 0,
        composite_score: -0.001,
        vix_change: 2.75,
        signal: 'STAY OUT',
        strength: 'ZERO CONVICTION',
        reasoning: 'Market choppy, wait for clarity',
        timestamp: new Date().toISOString()
      }
    ];

    setBiasData(mockData);
    setLoading(false);
  }, []);

  const getBiasColor = (bias: string) => {
    if (bias === 'Bullish') return 'text-green-400';
    if (bias === 'Bearish') return 'text-red-400';
    return 'text-gray-400';
  };

  const getBiasEmoji = (bias: string) => {
    if (bias === 'Bullish') return '📈';
    if (bias === 'Bearish') return '📉';
    return '➡️';
  };

  const getVixColor = (change: number) => {
    if (change > 5) return 'text-red-500';
    if (change > 0) return 'text-orange-400';
    if (change < -5) return 'text-green-500';
    return 'text-green-400';
  };

  const getVixInterpretation = (level: number, change: number) => {
    let levelDesc = 'Normal';
    let meaning = 'Market calm';
    
    if (level > 30) {
      levelDesc = 'High Fear';
      meaning = 'Extreme volatility expected';
    } else if (level > 20) {
      levelDesc = 'Elevated';
      meaning = 'Increased uncertainty';
    } else if (level < 12) {
      levelDesc = 'Complacency';
      meaning = 'Market too confident';
    }

    let changeDesc = change > 5 ? 'Spiking' : change > 0 ? 'Rising' : change < -5 ? 'Collapsing' : 'Falling';
    
    return { levelDesc, meaning, changeDesc };
  };

  if (loading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-[280px] flex items-center justify-center">
        <div className="text-gray-400">Loading bias data...</div>
      </div>
    );
  }

  const vixInfo = getVixInterpretation(vixData.level, vixData.change);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-[280px] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">⚖️ Directional Bias</h3>
        <div className="text-xs text-gray-500">Live</div>
      </div>

      {/* VIX Indicator with Hover */}
      <div 
        className="bg-gray-900 border border-gray-600 rounded-lg p-2 mb-3 relative cursor-pointer hover:bg-gray-800 transition-colors"
        onMouseEnter={() => setShowVixTooltip(true)}
        onMouseLeave={() => setShowVixTooltip(false)}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">VIX:</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{vixData.level}</span>
            <span className={`text-xs font-semibold ${getVixColor(vixData.change)}`}>
              {vixData.change > 0 ? '+' : ''}{vixData.change.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* VIX Tooltip */}
        {showVixTooltip && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl z-50 text-xs">
            <div className="font-bold text-white mb-2">VIX Fear Index</div>
            <div className="space-y-1 text-gray-300">
              <div><span className="text-gray-500">• Level:</span> {vixData.level} ({vixInfo.levelDesc})</div>
              <div><span className="text-gray-500">• Change:</span> {vixInfo.changeDesc} ({vixData.change > 0 ? '+' : ''}{vixData.change.toFixed(2)}%)</div>
              <div><span className="text-gray-500">• Meaning:</span> {vixInfo.meaning}</div>
              <div className="pt-1 mt-1 border-t border-gray-700 text-gray-400">
                VIX rising = Fear increasing = Bearish signal
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {biasData.map((item) => (
          <div 
            key={item.symbol} 
            className="bg-gray-700 rounded-lg p-3 relative cursor-pointer hover:bg-gray-600 transition-colors"
            onMouseEnter={() => setHoveredSymbol(item.symbol)}
            onMouseLeave={() => setHoveredSymbol(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-white text-sm">{item.symbol}</span>
              <span className={`text-lg ${getBiasColor(item.bias)}`}>
                {getBiasEmoji(item.bias)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${getBiasColor(item.bias)}`}>
                {item.bias}
              </span>
              <span className="text-gray-400">
                {item.confidence}% conf
              </span>
            </div>

            {/* Tooltip on hover */}
            {hoveredSymbol === item.symbol && (
              <div className="absolute left-0 top-full mt-1 w-64 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl z-50 text-xs">
                <div className="font-bold text-white mb-2">{item.symbol}: {item.bias} ({item.confidence}% confidence)</div>
                <div className="space-y-1 text-gray-300">
                  <div><span className="text-gray-500">• Signal:</span> {item.signal}</div>
                  <div><span className="text-gray-500">• Strength:</span> {item.strength}</div>
                  <div><span className="text-gray-500">• Why:</span> {item.reasoning}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}