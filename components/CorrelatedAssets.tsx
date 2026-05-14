'use client';

import React, { useEffect, useState } from 'react';
import { useMarketIntelligence } from '../lib/marketIntelligence';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  correlation: number;
}

export default function CorrelatedAssets() {
  const { selectedEvent, highlightedAssets } = useMarketIntelligence();
  const [showOverlay, setShowOverlay] = useState(false);
  
  const defaultAssets: Asset[] = [
    { symbol: 'SPY', name: 'S&P 500 ETF', price: 452.31, change: 0.45, correlation: 0.85 },
    { symbol: 'ES', name: 'E-mini S&P Futures', price: 4523.50, change: 0.52, correlation: 0.88 },
    { symbol: 'AAPL', name: 'Apple Inc', price: 185.92, change: 1.23, correlation: 0.87 },
    { symbol: 'MSFT', name: 'Microsoft', price: 378.91, change: 0.89, correlation: 0.85 },
    { symbol: 'NVDA', name: 'NVIDIA', price: 495.22, change: 2.15, correlation: 0.82 }
  ];

  const [affectedAssets, setAffectedAssets] = useState<Asset[]>([]);

  useEffect(() => {
    if (selectedEvent && selectedEvent.affectedSectors) {
      const affected: Asset[] = [];
      
      // Add currency and commodity impacts
      if (selectedEvent.currency === 'USD') {
        affected.push(
          { symbol: 'DXY', name: 'Dollar Index', price: 104.25, change: -0.3, correlation: 0.95 },
          { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0845, change: 0.4, correlation: -0.90 },
          { symbol: 'GLD', name: 'Gold ETF', price: 189.45, change: 0.8, correlation: -0.85 },
          { symbol: 'USO', name: 'Oil ETF', price: 78.32, change: -1.2, correlation: -0.65 },
          { symbol: 'TLT', name: '20yr Treasury', price: 92.45, change: 0.5, correlation: -0.75 }
        );
      }
      
      // Add ALL sector ETFs and their top stocks
      selectedEvent.affectedSectors.forEach(sector => {
        // Sector ETF
        affected.push({
          symbol: sector.etf,
          name: `${sector.sector} ETF`,
          price: 100 + Math.random() * 50,
          change: sector.impact / 10,
          correlation: sector.impact / 100
        });
        
        // All top stocks from each sector
        sector.topStocks.forEach(stock => {
          affected.push({
            symbol: stock.symbol,
            name: stock.name,
            price: 100 + Math.random() * 200,
            change: stock.expectedMove,
            correlation: stock.correlation
          });
        });
      });
      
      setAffectedAssets(affected);
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
      setAffectedAssets([]);
    }
  }, [selectedEvent]);

  // Separate positive and negative correlations
  const positiveCorrelations = affectedAssets.filter(a => a.correlation > 0);
  const negativeCorrelations = affectedAssets.filter(a => a.correlation < 0);

  // Use affected assets when overlay is shown, otherwise use default assets
  const displayAssets = showOverlay ? affectedAssets : defaultAssets;
  const displayPositive = showOverlay ? positiveCorrelations : defaultAssets.filter(a => a.correlation > 0);
  const displayNegative = showOverlay ? negativeCorrelations : [];

  return (
    <div className='bg-gray-800 border border-gray-700 rounded-lg p-4 h-full flex flex-col'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm font-semibold text-gray-300'>🔗 Correlated Assets</h3>
        <span className='text-xs text-gray-500'>(Market Correlations)</span>
      </div>

      {showOverlay && (
        <div className='text-xs text-blue-400 mb-2'>
          💡 {selectedEvent?.event} Impact
        </div>
      )}

      {/* This div takes remaining space and scrolls internally */}
      <div className='flex-1 overflow-y-auto'>
        <div className='space-y-3'>
          {/* Positive correlations */}
          <div>
            <div className='text-xs text-green-400 font-semibold mb-2'>↑ Positive Correlation</div>
            <div className='space-y-2'>
              {displayPositive.map((asset, index) => (
                <div key={index} className='flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-gray-300'>{asset.symbol}</span>
                    <span className='text-gray-500 text-xs'>{asset.name}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className={asset.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                    </span>
                    <span className='text-gray-500'>r={(asset.correlation).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Negative correlations - only show when in overlay mode */}
          {showOverlay && displayNegative.length > 0 && (
            <div>
              <div className='text-xs text-red-400 font-semibold mb-2'>↓ Inverse Correlation</div>
              <div className='space-y-2'>
                {displayNegative.map((asset, index) => (
                  <div key={index} className='flex items-center justify-between text-xs p-2 bg-gray-900/50 rounded'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-gray-300'>{asset.symbol}</span>
                      <span className='text-gray-500 text-xs'>{asset.name}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className={asset.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
                      </span>
                      <span className='text-gray-500'>r={(asset.correlation).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show correlation stats when in overlay mode */}
          {showOverlay && (
            <div className='pt-2 border-t border-gray-700'>
              <div className='text-xs text-gray-400 text-center'>
                📊 {displayPositive.length} positive | {displayNegative.length} inverse
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}