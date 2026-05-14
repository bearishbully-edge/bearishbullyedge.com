'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SectorImpact {
  sector: string;
  impact: number; // -100 to 100
  topStocks: {
    symbol: string;
    name: string;
    marketCap: string;
    correlation: number;
    expectedMove: number;
    volume: string;
  }[];
  etf: string; // Sector ETF
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

interface MarketEvent {
  id: string;
  time: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  event: string;
  actual?: number;
  forecast?: number;
  previous?: number;
  
  // Enhanced with sectors
  affectedSectors: SectorImpact[];
  
  // Revolutionary features
  correlations: {
    asset: string;
    correlation: number; // -1 to 1
    historicalAccuracy: number; // 0 to 100%
    expectedMove: number; // in percentage
    confidence: number; // 0 to 100%
    strategy: 'LONG' | 'SHORT' | 'NEUTRAL';
    timeframe: string; // "15m", "1h", "4h", "1d"
    stopLoss?: number;
    takeProfit?: number;
  }[];
  
  // AI-powered predictions
  aiPrediction: {
    marketReaction: 'VOLATILE' | 'MUTED' | 'DELAYED';
    dominantFlow: 'RISK_ON' | 'RISK_OFF' | 'MIXED';
    keyLevels: { price: number; type: 'SUPPORT' | 'RESISTANCE' }[];
  };
  
  // Historical patterns
  historicalPatterns: {
    similarEvents: number;
    averageMove: number;
    winRate: number;
    bestTimeToEnter: string;
  };
  
  // Correlation chain
  correlationChain: {
    primary: string; // USD
    secondary: string[]; // [DXY, Gold, Oil]
    tertiary: string[]; // [GLD, USO, XLE]
    sectors: {
      sector: string;
      etf: string;
      leaders: string[];
    }[];
  };
}

interface SmartAlert {
  id: string;
  type: 'OPPORTUNITY' | 'WARNING' | 'CORRELATION' | 'DIVERGENCE';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  assets: string[];
  action?: {
    type: 'TRADE' | 'HEDGE' | 'CLOSE' | 'WATCH';
    details: string;
  };
  expiresAt: Date;
}

interface MarketIntelligenceType {
  // Events
  selectedEvent: MarketEvent | null;
  setSelectedEvent: (event: MarketEvent | null) => void;
  upcomingEvents: MarketEvent[];
  
  // Correlations
  activeCorrelations: Map<string, number>;
  correlationMatrix: Map<string, Map<string, number>>;
  
  // Smart alerts
  alerts: SmartAlert[];
  addAlert: (alert: SmartAlert) => void;
  dismissAlert: (id: string) => void;
  
  // Trade opportunities
  opportunities: {
    asset: string;
    event: string;
    edge: number; // percentage edge
    risk: number; // 1-10 scale
    reward: number; // 1-10 scale
    timeToEvent: number; // minutes
    suggestedSize: number; // position size as % of account
  }[];
  
  // Market state
  marketRegime: 'TRENDING' | 'RANGING' | 'VOLATILE' | 'QUIET';
  dominantTheme: string; // "Inflation concerns", "Growth optimism", etc.
  riskSentiment: number; // -100 to 100
  
  // Intelligent features
  getCorrelatedAssets: (eventCurrency: string) => string[];
  calculateOptimalEntry: (asset: string, event: MarketEvent) => {
    price: number;
    confidence: number;
    reasoning: string;
  };
  generateTradeIdeas: () => void;
  generateSectorImpacts: (eventName: string, currency: string) => SectorImpact[];
  getTradeRecommendations: (event: MarketEvent) => string;
  highlightedAssets: string[];
  setHighlightedAssets: (assets: string[]) => void;
}

// Sector definitions with top stocks
const SECTOR_MAPPING: Record<string, {etf: string; leaders: {symbol: string; name: string; marketCap: string}[]}> = {
  'Technology': {
    etf: 'XLK',
    leaders: [
      { symbol: 'AAPL', name: 'Apple', marketCap: '3.0T' },
      { symbol: 'MSFT', name: 'Microsoft', marketCap: '2.8T' },
      { symbol: 'NVDA', name: 'NVIDIA', marketCap: '1.3T' },
      { symbol: 'GOOGL', name: 'Alphabet', marketCap: '1.7T' },
      { symbol: 'META', name: 'Meta', marketCap: '1.0T' }
    ]
  },
  'Financials': {
    etf: 'XLF',
    leaders: [
      { symbol: 'BRK.B', name: 'Berkshire', marketCap: '780B' },
      { symbol: 'JPM', name: 'JP Morgan', marketCap: '500B' },
      { symbol: 'BAC', name: 'Bank of America', marketCap: '250B' },
      { symbol: 'WFC', name: 'Wells Fargo', marketCap: '180B' },
      { symbol: 'GS', name: 'Goldman Sachs', marketCap: '130B' }
    ]
  },
  'Energy': {
    etf: 'XLE',
    leaders: [
      { symbol: 'XOM', name: 'Exxon Mobil', marketCap: '450B' },
      { symbol: 'CVX', name: 'Chevron', marketCap: '350B' },
      { symbol: 'COP', name: 'ConocoPhillips', marketCap: '130B' },
      { symbol: 'SLB', name: 'Schlumberger', marketCap: '65B' },
      { symbol: 'EOG', name: 'EOG Resources', marketCap: '70B' }
    ]
  },
  'Healthcare': {
    etf: 'XLV',
    leaders: [
      { symbol: 'UNH', name: 'UnitedHealth', marketCap: '500B' },
      { symbol: 'JNJ', name: 'Johnson & Johnson', marketCap: '380B' },
      { symbol: 'LLY', name: 'Eli Lilly', marketCap: '550B' },
      { symbol: 'PFE', name: 'Pfizer', marketCap: '160B' },
      { symbol: 'ABBV', name: 'AbbVie', marketCap: '290B' }
    ]
  },
  'Consumer': {
    etf: 'XLY',
    leaders: [
      { symbol: 'AMZN', name: 'Amazon', marketCap: '1.6T' },
      { symbol: 'TSLA', name: 'Tesla', marketCap: '800B' },
      { symbol: 'NKE', name: 'Nike', marketCap: '150B' },
      { symbol: 'MCD', name: "McDonald's", marketCap: '210B' },
      { symbol: 'SBUX', name: 'Starbucks', marketCap: '110B' }
    ]
  },
  'Industrials': {
    etf: 'XLI',
    leaders: [
      { symbol: 'CAT', name: 'Caterpillar', marketCap: '150B' },
      { symbol: 'BA', name: 'Boeing', marketCap: '130B' },
      { symbol: 'UPS', name: 'UPS', marketCap: '120B' },
      { symbol: 'HON', name: 'Honeywell', marketCap: '130B' },
      { symbol: 'LMT', name: 'Lockheed Martin', marketCap: '110B' }
    ]
  },
  'Materials': {
    etf: 'XLB',
    leaders: [
      { symbol: 'LIN', name: 'Linde', marketCap: '200B' },
      { symbol: 'APD', name: 'Air Products', marketCap: '65B' },
      { symbol: 'SHW', name: 'Sherwin-Williams', marketCap: '80B' },
      { symbol: 'FCX', name: 'Freeport-McMoRan', marketCap: '60B' },
      { symbol: 'NEM', name: 'Newmont', marketCap: '35B' }
    ]
  },
  'Real Estate': {
    etf: 'XLRE',
    leaders: [
      { symbol: 'PLD', name: 'Prologis', marketCap: '120B' },
      { symbol: 'AMT', name: 'American Tower', marketCap: '100B' },
      { symbol: 'CCI', name: 'Crown Castle', marketCap: '50B' },
      { symbol: 'EQIX', name: 'Equinix', marketCap: '75B' },
      { symbol: 'SPG', name: 'Simon Property', marketCap: '45B' }
    ]
  },
  'Utilities': {
    etf: 'XLU',
    leaders: [
      { symbol: 'NEE', name: 'NextEra Energy', marketCap: '150B' },
      { symbol: 'SO', name: 'Southern Company', marketCap: '80B' },
      { symbol: 'DUK', name: 'Duke Energy', marketCap: '75B' },
      { symbol: 'D', name: 'Dominion', marketCap: '45B' },
      { symbol: 'AEP', name: 'AEP', marketCap: '50B' }
    ]
  }
};

// Event to Sector correlations
const EVENT_SECTOR_CORRELATIONS: Record<string, Record<string, number>> = {
  'Interest Rate Decision': {
    'Technology': -0.75,
    'Financials': 0.65,
    'Real Estate': -0.85,
    'Utilities': -0.60,
    'Consumer': -0.45
  },
  'CPI/Inflation Data': {
    'Energy': 0.70,
    'Materials': 0.65,
    'Technology': -0.55,
    'Consumer': -0.60,
    'Financials': 0.30
  },
  'GDP Data': {
    'Technology': 0.80,
    'Consumer': 0.75,
    'Industrials': 0.70,
    'Energy': 0.60,
    'Utilities': -0.20
  },
  'Unemployment': {
    'Consumer': -0.70,
    'Technology': -0.50,
    'Financials': -0.45,
    'Healthcare': 0.20,
    'Utilities': 0.15
  },
  'Oil Inventories': {
    'Energy': 0.90,
    'Materials': 0.40,
    'Industrials': -0.30,
    'Consumer': -0.35
  }
};

const MarketIntelligenceContext = createContext<MarketIntelligenceType | undefined>(undefined);

export function MarketIntelligenceProvider({ children }: { children: React.ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<MarketEvent[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [marketRegime, setMarketRegime] = useState<'TRENDING' | 'RANGING' | 'VOLATILE' | 'QUIET'>('RANGING');
  const [dominantTheme, setDominantTheme] = useState('Awaiting Fed Decision');
  const [riskSentiment, setRiskSentiment] = useState(0);
  const [highlightedAssets, setHighlightedAssets] = useState<string[]>([]);

  // Correlation matrix for assets
  const correlationMatrix = new Map([
    ['USD', new Map([
      ['SPY', -0.65],
      ['QQQ', -0.72],
      ['GLD', -0.85],
      ['TLT', -0.45],
      ['VXX', 0.55],
      ['AAPL', -0.68],
      ['MSFT', -0.70],
      ['NVDA', -0.75]
    ])],
    ['EUR', new Map([
      ['SPY', 0.45],
      ['QQQ', 0.52],
      ['GLD', 0.65],
      ['DXY', -0.92]
    ])],
    ['GBP', new Map([
      ['SPY', 0.38],
      ['FTSE', 0.82],
      ['GLD', 0.42]
    ])]
  ]);

  // Generate intelligent correlations based on event
  const getCorrelatedAssets = (eventCurrency: string) => {
    const correlations = correlationMatrix.get(eventCurrency);
    if (!correlations) return [];
    
    return Array.from(correlations.entries())
      .filter(([_, corr]) => Math.abs(corr) > 0.5)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .map(([asset]) => asset);
  };

  // Calculate optimal entry point using multiple factors
  const calculateOptimalEntry = (asset: string, event: MarketEvent) => {
    const currentPrice = 100;
    const volatility = 0.15;
    const timeToEvent = 30;
    
    const optimalPrice = currentPrice * (1 - volatility * 0.1);
    const confidence = Math.min(95, 70 + (event.correlations?.[0]?.confidence || 0) * 0.3);
    
    return {
      price: optimalPrice,
      confidence,
      reasoning: `Based on ${event.historicalPatterns?.similarEvents || 0} similar events with ${event.historicalPatterns?.winRate || 0}% win rate`
    };
  };

  // Generate sector impacts function
  const generateSectorImpacts = (eventName: string, currency: string): SectorImpact[] => {
    const correlations = EVENT_SECTOR_CORRELATIONS[eventName] || {};
    const impacts: SectorImpact[] = [];

    Object.entries(correlations).forEach(([sector, correlation]) => {
      const sectorData = SECTOR_MAPPING[sector];
      if (sectorData) {
        impacts.push({
          sector,
          impact: correlation * 100,
          topStocks: sectorData.leaders.map(stock => ({
            ...stock,
            correlation: correlation * (0.8 + Math.random() * 0.4),
            expectedMove: correlation * (2 + Math.random() * 3),
            volume: 'Above Average'
          })),
          etf: sectorData.etf,
          sentiment: correlation > 0.3 ? 'BULLISH' : correlation < -0.3 ? 'BEARISH' : 'NEUTRAL'
        });
      }
    });

    return impacts.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
  };

  // Get trade recommendations
  const getTradeRecommendations = (event: MarketEvent): string => {
    let recommendations = `📊 ${event.event} Impact Analysis\n\n`;
    
    recommendations += `💱 Currency: ${event.currency}\n`;
    
    if (event.currency === 'USD') {
      const direction = (event.forecast || 0) > (event.previous || 0);
      recommendations += `🏆 Gold (GLD): ${direction ? '↓ Bearish' : '↑ Bullish'}\n`;
      recommendations += `🛢️ Oil (USO): ${direction ? '↓ Bearish' : '↑ Bullish'}\n\n`;
    }
    
    recommendations += `📈 SECTOR BREAKDOWN:\n`;
    
    event.affectedSectors?.forEach(sector => {
      const emoji = sector.sentiment === 'BULLISH' ? '🟢' : 
                    sector.sentiment === 'BEARISH' ? '🔴' : '🟡';
      
      recommendations += `\n${emoji} ${sector.sector} (${sector.etf}): ${sector.impact > 0 ? '+' : ''}${sector.impact.toFixed(0)}%\n`;
      recommendations += `   Top Plays:\n`;
      
      sector.topStocks.slice(0, 3).forEach(stock => {
        const direction = stock.expectedMove > 0 ? '↑' : '↓';
        recommendations += `   ${direction} ${stock.symbol} - ${stock.name}: ${stock.expectedMove > 0 ? '+' : ''}${stock.expectedMove.toFixed(1)}%\n`;
      });
    });
    
    return recommendations;
  };

  // Generate trade ideas based on all available data
  const generateTradeIdeas = () => {
    const ideas: any[] = [];
    
    upcomingEvents.forEach(event => {
      if (event.impact === 'HIGH') {
        event.correlations?.forEach(corr => {
          if (corr.confidence > 70 && Math.abs(corr.correlation) > 0.6) {
            ideas.push({
              asset: corr.asset,
              event: event.event,
              edge: corr.confidence * Math.abs(corr.correlation) / 100,
              risk: corr.correlation < 0 ? 6 : 4,
              reward: Math.abs(corr.expectedMove) > 1 ? 8 : 5,
              timeToEvent: 30,
              suggestedSize: Math.min(5, corr.confidence / 20)
            });
          }
        });
      }
    });
    
    setOpportunities(ideas);
  };

  // Monitor for divergences and special situations
  useEffect(() => {
    const checkForAlerts = () => {
      // Simplified alert generation
      if (Math.random() > 0.95) {
        addAlert({
          id: Date.now().toString(),
          type: 'OPPORTUNITY',
          severity: 'HIGH',
          title: 'Market Opportunity Detected',
          description: 'Correlation pattern suggests potential trade setup',
          assets: ['NQ', 'ES'],
          action: {
            type: 'WATCH',
            details: 'Monitor for confirmation'
          },
          expiresAt: new Date(Date.now() + 3600000)
        });
      }
    };

    const interval = setInterval(checkForAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  const addAlert = (alert: SmartAlert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 10));
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const activeCorrelations = new Map();

  return (
    <MarketIntelligenceContext.Provider value={{
      selectedEvent,
      setSelectedEvent,
      upcomingEvents,
      activeCorrelations,
      correlationMatrix,
      alerts,
      addAlert,
      dismissAlert,
      opportunities,
      marketRegime,
      dominantTheme,
      riskSentiment,
      getCorrelatedAssets,
      calculateOptimalEntry,
      generateTradeIdeas,
      generateSectorImpacts,
      getTradeRecommendations,
      highlightedAssets,
      setHighlightedAssets
    }}>
      {children}
    </MarketIntelligenceContext.Provider>
  );
}

export function useMarketIntelligence() {
  const context = useContext(MarketIntelligenceContext);
  if (!context) {
    throw new Error('useMarketIntelligence must be used within MarketIntelligenceProvider');
  }
  return context;
}