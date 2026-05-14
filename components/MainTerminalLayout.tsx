// components/MainTerminalLayout.tsx
// Professional trading terminal layout

'use client';

import { useState, useEffect } from 'react';
import VolumeWidget from './VolumeWidget';
import COTWidget from './COTWidget';

export default function MainTerminalLayout() {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | 'all'>('1h');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header Bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-400">BearishBully Edge</h1>
          <span className="text-xs text-gray-400">MNQ Volume Terminal v1.0</span>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '1h' | '24h' | 'all')}
            className="bg-gray-700 text-white text-xs rounded px-3 py-1 border border-gray-600"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="all">All Time</option>
          </select>
          {currentTime && (
            <span className="text-xs text-gray-400">{currentTime}</span>
          )}
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Watchlist</h2>
          <div className="space-y-2">
            {['MNQ', 'NQ', 'ES', 'MES'].map((symbol) => (
              <button
                key={symbol}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{symbol}</span>
                  <span className="text-xs text-gray-400">--</span>
                </div>
              </button>
            ))}
          </div>

          <h2 className="text-sm font-semibold mt-6 mb-3 text-gray-300">Quick Stats</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span className="text-gray-400">SPX:</span>
              <span className="text-white">--</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span className="text-gray-400">VIX:</span>
              <span className="text-white">--</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span className="text-gray-400">PCR:</span>
              <span className="text-white">--</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-gray-900">
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center space-x-4">
            <select className="bg-gray-700 text-white text-sm rounded px-3 py-1 border border-gray-600">
              <option>1m</option>
              <option>5m</option>
              <option>15m</option>
              <option>1h</option>
            </select>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                Candles
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                Line
              </button>
              <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors">
                Heikin Ashi
              </button>
            </div>
          </div>

          <div className="flex-1 bg-gray-900 relative">
            <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-700">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-sm">TradingView Lightweight Charts</p>
                <p className="text-gray-600 text-xs mt-2">Chart integration ready</p>
              </div>
            </div>
          </div>

          <div className="h-32 bg-gray-800 border-t border-gray-700 p-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-2">Volume Heatmap</h3>
            <div className="flex items-center justify-center h-full border border-dashed border-gray-700 rounded">
              <span className="text-gray-600 text-xs">Coming Soon: Volume Distribution Heatmap</span>
            </div>
          </div>
        </main>

        <aside className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Volume Analysis</h2>
          <VolumeWidget symbol="MNQ" timeframe="1m" timeRange={timeRange} />

          <div className="mt-4 bg-gray-700 border border-gray-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Directional Bias</h3>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">⚖️</div>
              <p className="text-gray-500 text-xs">Bias Engine Coming Soon</p>
            </div>
          </div>

          <div className="mt-4 bg-gray-700 border border-gray-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Economic Calendar</h3>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-gray-500 text-xs">Calendar Sync Coming Soon</p>
            </div>
          </div>

          <div className="mt-4">
            <COTWidget />
          </div>
        </aside>
      </div>

      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Database: Connected</span>
          <span>•</span>
          <span>API: Ready</span>
        </div>
        <div>BearishBully Edge © 2025</div>
      </footer>
    </div>
  );
}
