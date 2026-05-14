'use client';

import React, { useEffect, useState } from 'react';

interface COTData {
  commercials: {
    long: number;
    short: number;
    net: number;
    index: number;
    weeklyChange: number;
  };
  largeFunds: {
    long: number;
    short: number;
    net: number;
    index: number;
    weeklyChange: number;
  };
  smallTraders: {
    long: number;
    short: number;
    net: number;
    index: number;
    weeklyChange: number;
  };
  openInterest: number;
  weeklyOIChange: number;
  lastUpdate: string;
  signal?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export default function COTOverlay() {
  const [cotData, setCotData] = useState<COTData | null>(null);
  const [historicalBars, setHistoricalBars] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const tooltips = {
    commercials: "Smart money - Commercial hedgers (producers/consumers). Low readings (<30%) often signal buying opportunities.",
    largeFunds: "Managed money - Hedge funds and large speculators. High readings (>70%) often indicate overbought conditions.",
    smallTraders: "Retail traders - Individual speculators. Often wrong at extremes.",
    openInterest: "Total number of outstanding contracts. Rising OI confirms trend strength.",
    chart: "52-week COT positioning history. Green bars = bullish extremes (>70%), Red = bearish extremes (<30%)"
  };

  useEffect(() => {
    // Initialize with test data
    setHistoricalBars(Array(52).fill(0).map((_, i) => {
      const value = 50 + Math.sin(i * 0.2) * 30 + Math.random() * 20;
      return Math.max(0, Math.min(100, value));
    }));

    setCotData({
      commercials: {
        long: 245678,
        short: 312456,
        net: -66778,
        index: 28,
        weeklyChange: -4.2
      },
      largeFunds: {
        long: 298456,
        short: 187234,
        net: 111222,
        index: 72,
        weeklyChange: 6.8
      },
      smallTraders: {
        long: 45678,
        short: 34567,
        net: 11111,
        index: 45,
        weeklyChange: 1.2
      },
      openInterest: 578901,
      weeklyOIChange: 2.3,
      lastUpdate: 'CFTC Weekly Report',
      signal: 'BULLISH'
    });

    setIsLoading(false);
  }, []);

  const formatNumber = (num: number) => {
    const absNum = Math.abs(num);
    if (absNum >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (absNum >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-300">COT Overlay</h3>
          <span className={`text-xs px-2 py-0.5 rounded ${
            cotData?.signal === 'BULLISH' ? 'bg-green-500/20 text-green-400' :
            cotData?.signal === 'BEARISH' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {cotData?.signal || 'NEUTRAL'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Chart Section with Tooltip */}
        <div 
          className="relative"
          onMouseEnter={() => setHoveredSection('chart')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="text-xs text-gray-500 mb-2">Institutional Positioning</div>
          <div className="h-16 flex items-end gap-[1px]">
            {historicalBars.map((value, index) => (
              <div
                key={index}
                className={`flex-1 transition-all cursor-pointer ${
                  value > 70 ? 'bg-green-500/60 hover:bg-green-500' : 
                  value < 30 ? 'bg-red-500/60 hover:bg-red-500' : 
                  'bg-gray-600/60 hover:bg-gray-500'
                } rounded-t-sm`}
                style={{ height: `${value}%` }}
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-gray-600">
            <span>52W</span>
            <span>26W</span>
            <span>Now</span>
          </div>
          {hoveredSection === 'chart' && (
            <div className="absolute z-10 bg-black/90 border border-gray-600 rounded p-2 text-xs text-gray-300 -top-10 left-0 right-0">
              {tooltips.chart}
            </div>
          )}
        </div>

        {/* Commercials with Tooltip */}
        <div 
          className="bg-gray-900/50 rounded p-2 relative cursor-help transition-all hover:bg-gray-900/70"
          onMouseEnter={() => setHoveredSection('commercials')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Commercials</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${cotData!.commercials.index < 30 ? 'text-red-400' : 'text-gray-400'}`}>
                {cotData!.commercials.index}%
              </span>
              <span className={`text-[10px] ${cotData!.commercials.weeklyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cotData!.commercials.weeklyChange > 0 ? '↑' : '↓'} {Math.abs(cotData!.commercials.weeklyChange)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="text-gray-600">Long:</span>
              <span className="text-gray-300 ml-1">{formatNumber(cotData!.commercials.long)}</span>
            </div>
            <div>
              <span className="text-gray-600">Short:</span>
              <span className="text-gray-300 ml-1">{formatNumber(cotData!.commercials.short)}</span>
            </div>
            <div>
              <span className="text-gray-600">Net:</span>
              <span className={`ml-1 ${cotData!.commercials.net > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatNumber(cotData!.commercials.net)}
              </span>
            </div>
          </div>
          {hoveredSection === 'commercials' && (
            <div className="absolute z-10 bg-black/90 border border-gray-600 rounded p-2 text-xs text-gray-300 -top-14 left-0 right-0">
              {tooltips.commercials}
            </div>
          )}
        </div>

        {/* Large Funds with Tooltip */}
        <div 
          className="bg-gray-900/50 rounded p-2 relative cursor-help transition-all hover:bg-gray-900/70"
          onMouseEnter={() => setHoveredSection('largeFunds')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Large Funds</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium ${cotData!.largeFunds.index > 70 ? 'text-green-400' : 'text-gray-400'}`}>
                {cotData!.largeFunds.index}%
              </span>
              <span className={`text-[10px] ${cotData!.largeFunds.weeklyChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cotData!.largeFunds.weeklyChange > 0 ? '↑' : '↓'} {Math.abs(cotData!.largeFunds.weeklyChange)}%
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="text-gray-600">Long:</span>
              <span className="text-gray-300 ml-1">{formatNumber(cotData!.largeFunds.long)}</span>
            </div>
            <div>
              <span className="text-gray-600">Short:</span>
              <span className="text-gray-300 ml-1">{formatNumber(cotData!.largeFunds.short)}</span>
            </div>
            <div>
              <span className="text-gray-600">Net:</span>
              <span className={`ml-1 ${cotData!.largeFunds.net > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatNumber(cotData!.largeFunds.net)}
              </span>
            </div>
          </div>
          {hoveredSection === 'largeFunds' && (
            <div className="absolute z-10 bg-black/90 border border-gray-600 rounded p-2 text-xs text-gray-300 -top-14 left-0 right-0">
              {tooltips.largeFunds}
            </div>
          )}
        </div>

        {/* Open Interest with Tooltip */}
        <div 
          className="pt-2 border-t border-gray-700 relative cursor-help"
          onMouseEnter={() => setHoveredSection('openInterest')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Open Interest</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">{formatNumber(cotData!.openInterest)}</span>
              <span className={`text-[10px] ${cotData!.weeklyOIChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {cotData!.weeklyOIChange > 0 ? '↑' : '↓'} {Math.abs(cotData!.weeklyOIChange)}%
              </span>
            </div>
          </div>
          {hoveredSection === 'openInterest' && (
            <div className="absolute z-10 bg-black/90 border border-gray-600 rounded p-2 text-xs text-gray-300 -top-16 left-0 right-0">
              {tooltips.openInterest}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}