'use client';

import React, { useState, useEffect } from 'react';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  previousClose: number;
}

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { symbol: 'QQQ', name: 'Nasdaq 100', price: 402.45, change: 2.15, changePercent: 0.54, volume: 45234567, high: 403.20, low: 400.10, previousClose: 400.30 },
    { symbol: 'SPY', name: 'S&P 500', price: 452.31, change: -1.23, changePercent: -0.27, volume: 78234567, high: 454.20, low: 451.10, previousClose: 453.54 },
    { symbol: 'DIA', name: 'Dow Jones', price: 352.67, change: 0.89, changePercent: 0.25, volume: 12234567, high: 353.40, low: 351.50, previousClose: 351.78 },
    { symbol: 'IWM', name: 'Russell 2000', price: 201.34, change: 3.45, changePercent: 1.74, volume: 34234567, high: 201.80, low: 197.90, previousClose: 197.89 },
    { symbol: 'VXX', name: 'Volatility', price: 15.23, change: -0.45, changePercent: -2.87, volume: 23234567, high: 15.80, low: 15.10, previousClose: 15.68 },
    { symbol: 'TLT', name: '20yr Treasury', price: 92.45, change: 0.23, changePercent: 0.25, volume: 8234567, high: 92.60, low: 92.10, previousClose: 92.22 },
    { symbol: 'GLD', name: 'Gold ETF', price: 189.34, change: 1.12, changePercent: 0.59, volume: 5234567, high: 189.50, low: 188.20, previousClose: 188.22 },
    { symbol: 'USO', name: 'Oil ETF', price: 78.45, change: -2.34, changePercent: -2.90, volume: 9234567, high: 81.20, low: 78.30, previousClose: 80.79 }
  ]);

  const [newSymbol, setNewSymbol] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'symbol' | 'change' | 'volume'>('symbol');
  const [filterMode, setFilterMode] = useState<'all' | 'gainers' | 'losers'>('all');

  // Add new symbol to watchlist
  const addSymbol = () => {
    if (newSymbol && !watchlist.find(item => item.symbol === newSymbol.toUpperCase())) {
      const newItem: WatchlistItem = {
        symbol: newSymbol.toUpperCase(),
        name: newSymbol.toUpperCase(),
        price: 100 + Math.random() * 400,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 50000000),
        high: 0,
        low: 0,
        previousClose: 100
      };
      newItem.high = newItem.price + Math.random() * 5;
      newItem.low = newItem.price - Math.random() * 5;
      setWatchlist([...watchlist, newItem]);
      setNewSymbol('');
    }
  };

  // Remove symbol from watchlist
  const removeSymbol = (symbol: string) => {
    setWatchlist(watchlist.filter(item => item.symbol !== symbol));
  };

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev => prev.map(item => {
        const priceChange = (Math.random() - 0.5) * 0.5;
        const newPrice = item.price + priceChange;
        const newChange = newPrice - item.previousClose;
        const newChangePercent = (newChange / item.previousClose) * 100;
        
        return {
          ...item,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          volume: item.volume + Math.floor(Math.random() * 10000),
          high: Math.max(item.high, newPrice),
          low: Math.min(item.low, newPrice)
        };
      }));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter and sort watchlist
  const displayList = watchlist
    .filter(item => {
      if (filterMode === 'gainers') return item.change > 0;
      if (filterMode === 'losers') return item.change < 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
      if (sortBy === 'change') return b.changePercent - a.changePercent;
      if (sortBy === 'volume') return b.volume - a.volume;
      return 0;
    });

  return (
    <div className='bg-gray-800 border border-gray-700 rounded-lg p-4 h-full'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-sm font-semibold text-gray-300'>📊 Watchlist</h3>
        <div className='flex gap-2'>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className='text-xs bg-gray-700 text-gray-300 rounded px-2 py-1'
          >
            <option value='all'>All</option>
            <option value='gainers'>Gainers</option>
            <option value='losers'>Losers</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className='text-xs bg-gray-700 text-gray-300 rounded px-2 py-1'
          >
            <option value='symbol'>Symbol</option>
            <option value='change'>Change %</option>
            <option value='volume'>Volume</option>
          </select>
        </div>
      </div>

      {/* Add Symbol */}
      <div className='flex gap-2 mb-3'>
        <input
          type='text'
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addSymbol()}
          placeholder='Add symbol...'
          className='flex-1 text-xs bg-gray-900 text-gray-300 rounded px-2 py-1 border border-gray-700 focus:outline-none focus:border-blue-500'
        />
        <button
          onClick={addSymbol}
          className='px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition'
        >
          Add
        </button>
      </div>

      {/* Watchlist Items */}
      <div className='space-y-1 max-h-96 overflow-y-auto'>
        {displayList.map((item) => (
          <div
            key={item.symbol}
            className={`p-2 bg-gray-900/50 rounded cursor-pointer transition-all hover:bg-gray-900 ${
              selectedSymbol === item.symbol ? 'ring-1 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedSymbol(item.symbol)}
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-bold text-white'>{item.symbol}</span>
                  <span className='text-xs text-gray-500'>{item.name}</span>
                </div>
                <div className='flex items-center gap-3 mt-1'>
                  <span className='text-sm font-medium text-gray-200'>
                    ${item.price.toFixed(2)}
                  </span>
                  <span className={`text-xs font-medium ${
                    item.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSymbol(item.symbol);
                }}
                className='text-gray-500 hover:text-red-400 text-xs'
              >
                ✕
              </button>
            </div>
            
            {selectedSymbol === item.symbol && (
              <div className='mt-2 pt-2 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs'>
                <div>
                  <span className='text-gray-500'>High:</span>
                  <span className='text-gray-300 ml-1'>${item.high.toFixed(2)}</span>
                </div>
                <div>
                  <span className='text-gray-500'>Low:</span>
                  <span className='text-gray-300 ml-1'>${item.low.toFixed(2)}</span>
                </div>
                <div>
                  <span className='text-gray-500'>Vol:</span>
                  <span className='text-gray-300 ml-1'>{(item.volume / 1000000).toFixed(1)}M</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className='mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs'>
        <div className='text-center'>
          <div className='text-green-400 font-semibold'>
            {watchlist.filter(i => i.change > 0).length}
          </div>
          <div className='text-gray-500'>Gainers</div>
        </div>
        <div className='text-center'>
          <div className='text-red-400 font-semibold'>
            {watchlist.filter(i => i.change < 0).length}
          </div>
          <div className='text-gray-500'>Losers</div>
        </div>
        <div className='text-center'>
          <div className='text-gray-300 font-semibold'>
            {watchlist.filter(i => i.change === 0).length}
          </div>
          <div className='text-gray-500'>Unchanged</div>
        </div>
      </div>
    </div>
  );
}