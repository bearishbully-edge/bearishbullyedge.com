// components/MainTerminalLayout.tsx
// Professional trading terminal layout inspired by Thinkorswim

'use client';

import VolumeWidget from './VolumeWidget';

export default function MainTerminalLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header Bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-blue-400">BearishBully Edge</h1>
          <span className="text-xs text-gray-400">MNQ Volume Terminal v1.0</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400">
  Live Trading Session
</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Live"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Watchlist */}
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

        {/* Center Panel - Chart Area */}
        <main className="flex-1 flex flex-col bg-gray-900">
          {/* Chart Toolbar */}
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

          {/* Chart Container */}
          <div className="flex-1 bg-gray-900 relative">
            <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-700">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-500 text-sm">
                  TradingView Lightweight Charts
                </p>
                <p className="text-gray-600 text-xs mt-2">
                  Will be integrated in Phase 2
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Panel - Volume Heatmap Placeholder */}
          <div className="h-32 bg-gray-800 border-t border-gray-700 p-4">
            <h3 className="text-xs font-semibold text-gray-400 mb-2">Volume Heatmap</h3>
            <div className="flex items-center justify-center h-full border border-dashed border-gray-700 rounded">
              <span className="text-gray-600 text-xs">Coming Soon: Volume Distribution Heatmap</span>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Analysis Panels */}
        <aside className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Volume Analysis</h2>
          
          {/* Volume Delta Widget */}
          <VolumeWidget symbol="MNQ" timeframe="1m" />

          {/* Bias Panel */}
          <div className="mt-4 bg-gray-700 border border-gray-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Directional Bias</h3>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">⚖️</div>
              <p className="text-gray-500 text-xs">Bias Engine Coming Soon</p>
            </div>
          </div>

          {/* Economic Calendar */}
          <div className="mt-4 bg-gray-700 border border-gray-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Economic Calendar</h3>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-gray-500 text-xs">Calendar Sync Coming Soon</p>
            </div>
          </div>

          {/* COT Data */}
          <div className="mt-4 bg-gray-700 border border-gray-600 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-300">COT Positioning</h3>
            <div className="text-center py-6">
              <div className="text-3xl mb-2">📈</div>
              <p className="text-gray-500 text-xs">COT Overlay Coming Soon</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Status Bar */}
      <footer className="bg-gray-800 border-t border-gray-700 px-6 py-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center space-x-4">
          <span>Database: Connected</span>
          <span>•</span>
          <span>API: Ready</span>
        </div>
        <div>
          BearishBully Edge © 2025
        </div>
      </footer>
    </div>
  );
}
