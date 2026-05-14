'use client';

import React, { useState } from 'react';
import { useMarketIntelligence } from '../lib/marketIntelligence';

interface EconomicEvent {
  time: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  event: string;
  forecast?: string;
  previous?: string;
  description: string;
  whyItMatters: string;
}

export default function EconomicCalendar() {
  const { setSelectedEvent, generateSectorImpacts, setHighlightedAssets } = useMarketIntelligence();
  const [hoveredEventIndex, setHoveredEventIndex] = useState<number | null>(null);

  const events: EconomicEvent[] = [
    { 
      time: '18h', 
      currency: 'USD', 
      impact: 'HIGH', 
      event: 'US Manufacturing PMI', 
      forecast: '48.8', 
      previous: '48.5',
      description: 'Manufacturing Purchasing Managers Index measures the health of the manufacturing sector. Above 50 = expansion, below 50 = contraction.',
      whyItMatters: 'Manufacturing drives GDP growth. A reading below 50 signals economic contraction, affecting tech orders, industrial production, and employment. Impacts: Technology stocks (AAPL, NVDA, MSFT), Industrial sector (CAT, BA, HON), USD strength, commodity prices.'
    },
    { 
      time: '1d', 
      currency: 'GBP', 
      impact: 'MEDIUM', 
      event: 'UK GDP (QoQ)', 
      forecast: '0.2%', 
      previous: '0.5%',
      description: 'Gross Domestic Product measures the total economic output and growth rate of the UK economy quarter-over-quarter.',
      whyItMatters: 'GDP directly impacts currency strength and equity markets. Slower growth leads to dovish central bank policy. Affects: GBP pairs, UK banks (HSBC, Barclays), FTSE 100 index, European equities.'
    },
    { 
      time: '3d', 
      currency: 'EUR', 
      impact: 'HIGH', 
      event: 'ECB President Lagarde Speaks',
      description: 'European Central Bank President discusses monetary policy, inflation outlook, and economic conditions in the Eurozone.',
      whyItMatters: 'Central bank guidance moves markets instantly. Hawks/doves tone affects interest rate expectations. Impacts: EUR pairs, European banks (DB, SAN), German DAX, US tech stocks (inverse correlation), bond yields.'
    },
    { 
      time: '5d', 
      currency: 'USD', 
      impact: 'MEDIUM', 
      event: 'US Durable Goods Orders', 
      forecast: '0.5%', 
      previous: '0.4%',
      description: 'Measures new orders for long-lasting manufactured goods like aircraft, machinery, and electronics. Key indicator of business investment.',
      whyItMatters: 'Leading indicator of manufacturing sector health and business investment. Affects: Boeing (BA), Caterpillar (CAT), Industrial sector ETF (XLI), transportation stocks, USD strength.'
    }
  ];

  const handleMouseEnter = (index: number, event: EconomicEvent) => {
    setHoveredEventIndex(index);
    
    const impacts = generateSectorImpacts(event.event, event.currency);
    const assets: string[] = [];
    
    // Add comprehensive asset list
    if (event.currency === 'USD') {
      assets.push('DXY', 'EURUSD', 'GBPUSD', 'USDJPY', 'GLD', 'USO', 'TLT', 'VXX');
    } else if (event.currency === 'GBP') {
      assets.push('GBPUSD', 'EURGBP', 'FTSE', 'HSBC', 'BP', 'BARC', 'LLOY');
    } else if (event.currency === 'EUR') {
      assets.push('EURUSD', 'DXY', 'DAX', 'CAC', 'DB', 'SAN', 'BNP');
    }
    
    // Add all affected sector assets
    impacts.forEach(sector => {
      assets.push(sector.etf);
      sector.topStocks.forEach(stock => {
        assets.push(stock.symbol);
      });
    });
    
    setHighlightedAssets(assets);
    
    setSelectedEvent({
      id: Date.now().toString(),
      time: event.time,
      currency: event.currency,
      impact: event.impact,
      event: event.event,
      forecast: parseFloat(event.forecast || '0'),
      previous: parseFloat(event.previous || '0'),
      affectedSectors: impacts,
      correlations: [],
      aiPrediction: {
        marketReaction: event.impact === 'HIGH' ? 'VOLATILE' : 
                       event.impact === 'MEDIUM' ? 'MUTED' : 'DELAYED',
        dominantFlow: event.impact === 'HIGH' ? 'RISK_OFF' : 
                     event.impact === 'MEDIUM' ? 'MIXED' : 'RISK_ON',
        keyLevels: []
      },
      historicalPatterns: {
        averageMove: event.impact === 'HIGH' ? 1.8 : 
                    event.impact === 'MEDIUM' ? 1.2 : 0.5,
        winRate: event.impact === 'HIGH' ? 0.72 : 
                event.impact === 'MEDIUM' ? 0.65 : 0.58,
        similarEvents: 25,
        bestTimeToEnter: event.impact === 'HIGH' ? '15 min after release' : '30 min after release'
      },
      correlationChain: {
        primary: event.currency,
        secondary: event.currency === 'USD' ? ['DXY', 'EURUSD', 'GBPUSD'] : 
                  event.currency === 'EUR' ? ['EURUSD', 'DAX', 'CAC'] :
                  ['GBPUSD', 'FTSE', 'EURGBP'],
        tertiary: event.currency === 'USD' ? ['SPY', 'QQQ', 'IWM'] : 
                 event.currency === 'EUR' ? ['EWG', 'EWQ', 'EWI'] :
                 ['EWU', 'FEZ', 'VGK'],
        sectors: impacts.map(s => ({
          sector: s.sector,
          etf: s.etf,
          leaders: s.topStocks.slice(0, 5).map(stock => stock.symbol)
        }))
      }
    });
  };

  const handleMouseLeave = () => {
    setHoveredEventIndex(null);
    setHighlightedAssets([]);
    setSelectedEvent(null);
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'HIGH': return 'bg-red-600 text-white';
      case 'MEDIUM': return 'bg-yellow-600 text-white';
      case 'LOW': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className='bg-gray-800 border border-gray-700 rounded-lg p-4 h-full'>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm font-semibold text-gray-300'>📅 Economic Calendar</h3>
        <span className='text-xs text-gray-500'>(Next 4 High-Impact Events)</span>
      </div>
      
      <div className='text-xs text-yellow-400 mb-3'>
        💡 Hover over events for volatility analysis
      </div>

      <div className='space-y-2'>
        {events.map((event, index) => (
          <div 
            key={index}
            className='relative'
            onMouseEnter={() => handleMouseEnter(index, event)}
            onMouseLeave={handleMouseLeave}
          >
            <div className={`p-2 bg-gray-900/50 rounded cursor-pointer transition-all ${
              hoveredEventIndex === index ? 'bg-gray-900 ring-1 ring-blue-500' : ''
            }`}>
              <div className='flex items-start justify-between mb-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-500'>{event.currency}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getImpactColor(event.impact)}`}>
                    {event.impact}
                  </span>
                </div>
                <span className='text-xs text-gray-400'>{event.time}</span>
              </div>
              
              <div className='text-xs text-gray-300 font-medium mb-1'>{event.event}</div>
              
              {(event.forecast || event.previous) && (
                <div className='text-xs text-gray-500'>
                  {event.forecast && <span>Forecast: {event.forecast}</span>}
                  {event.forecast && event.previous && <span> • </span>}
                  {event.previous && <span>Previous: {event.previous}</span>}
                </div>
              )}
            </div>

            {/* Complete tooltip with all information */}
            {hoveredEventIndex === index && (
              <div className='absolute z-20 bottom-full mb-2 left-0 right-0 bg-black border border-gray-600 rounded p-3 shadow-xl'>
                <div className='mb-2'>
                  <div className='text-xs font-semibold text-white mb-1'>{event.event}</div>
                  <div className='text-xs text-gray-300 mb-1'>{event.description}</div>
                  <div className='text-xs text-yellow-400'>{event.whyItMatters}</div>
                </div>
                
                <div className='border-t border-gray-700 pt-2 mt-2'>
                  <div className='text-xs text-blue-400 font-semibold mb-1'>Affected Assets:</div>
                  {generateSectorImpacts(event.event, event.currency).map((sector, i) => (
                    <div key={i} className='text-xs mb-1'>
                      <span className={`${
                        sector.sentiment === 'BULLISH' ? 'text-green-400' : 
                        sector.sentiment === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {sector.sentiment === 'BULLISH' ? '↑' : '↓'} {sector.sector} ({sector.etf}): {sector.impact > 0 ? '+' : ''}{sector.impact.toFixed(0)}%
                      </span>
                      <span className='text-gray-500 ml-2'>
                        {sector.topStocks.slice(0, 5).map(s => s.symbol).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}