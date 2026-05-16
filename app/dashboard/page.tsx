'use client';

import { useEffect, useState, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import VolumeWidget from '../../components/VolumeWidget';
import EconomicCalendar from '../../components/EconomicCalendar';
import DirectionalBias from '../../components/DirectionalBias';
import CorrelatedAssets from '../../components/CorrelatedAssets';
import COTOverlay from '../../components/widgets/COTOverlay';
import { MarketIntelligenceProvider } from '../../lib/marketIntelligence';
import AutomationControl from '../../components/AutomationControl';
import MonitoringDashboard from '../../components/MonitoringDashboard';
import Watchlist from '../../components/Watchlist';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState('QQQ');
  const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);  // ADD THIS LINE
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      router.push('/auth/login');
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const changeSymbol = (newSymbol: string) => {
    setSymbol(newSymbol);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <div className='text-gray-400'>Loading...</div>
      </div>
    );
  }

  const getSymbolName = (sym: string) => {
    const names: { [key: string]: string } = {
      'QQQ': 'Nasdaq 100 ETF (QQQ)',
      'SPY': 'S&P 500 ETF (SPY)',
      'DIA': 'Dow Jones ETF (DIA)',
      'IWM': 'Russell 2000 ETF (IWM)',
      'ES': 'E-mini S&P 500',
      'NQ': 'E-mini Nasdaq 100'
    };
    return names[sym] || sym;
  };

  return (
    <main className='min-h-screen bg-gray-900'>
      {/* Header - Mobile Responsive */}
      <div className='border-b border-gray-800 bg-gray-900'>
        <div className='max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <h1 className='text-xl sm:text-2xl font-bold text-white'>BearishBully Edge Terminal</h1>
            <div className='flex gap-2 sm:gap-4 items-center'>
              <a href='/pricing' className='px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm sm:text-base'>
                Upgrade
              </a>
              <button
                onClick={handleLogout}
                className='px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm sm:text-base'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-[1920px] mx-auto p-4 sm:p-6'>
        {/* Chart and Watchlist Grid */}
        <div className='mb-6'>
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
            {/* Watchlist - Collapsible */}
            {!watchlistCollapsed && (
              <div className='lg:col-span-1'>
                <Watchlist />
              </div>
            )}
            
            {/* TradingView Chart - Expands when watchlist collapsed */}
            <div className={watchlistCollapsed ? 'lg:col-span-5' : 'lg:col-span-4'} id='chart-container'>
              <div className='bg-gray-800 border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col'>
                <div className='bg-gray-900 p-3 sm:p-4 border-b border-gray-700'>
                  <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                    <h3 className='text-base sm:text-lg font-semibold text-gray-300'>{getSymbolName(symbol)}</h3>
                    
                    <div className='flex flex-wrap items-center gap-2 w-full sm:w-auto'>
                      {/* Collapse Watchlist Button */}
                      <button
                        onClick={() => setWatchlistCollapsed(!watchlistCollapsed)}
                        className='px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition'
                        title='Toggle Watchlist'
                      >
                        {watchlistCollapsed ? '◀ Show Watchlist' : '▶ Hide Watchlist'}
                      </button>
                      
                      {/* True Fullscreen Button */}
                      <button
                        onClick={() => {
                          const chartContainer = document.getElementById('chart-fullscreen');
                          if (chartContainer) {
                            if (!document.fullscreenElement) {
                              chartContainer.requestFullscreen().then(() => {
                                // Add styles for true fullscreen
                                chartContainer.style.height = '100vh';
                                chartContainer.style.display = 'flex';
                                chartContainer.style.flexDirection = 'column';
                              });
                            } else {
                              document.exitFullscreen().then(() => {
                                // Reset styles
                                chartContainer.style.height = '';
                                chartContainer.style.display = '';
                                chartContainer.style.flexDirection = '';
                              });
                            }
                          }
                        }}
                        className='px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition'
                        title='True Fullscreen'
                      >
                        ⛶ Fullscreen
                      </button>
                      
                      {/* Custom Symbol Input */}
                      <div className='flex items-center gap-2'>
                        <input
                          type='text'
                          placeholder='Enter any symbol...'
                          className='px-3 py-1 bg-gray-700 text-white rounded text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500'
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              changeSymbol(input.value.toUpperCase());
                              input.value = '';
                            }
                          }}
                        />
                      </div>
                      
                      {/* Quick Access */}
                      {['QQQ', 'SPY', 'ES', 'NQ'].map(item => (
                        <button key={item} onClick={() => changeSymbol(item)}
                          className={`px-3 py-1 rounded text-sm font-medium transition ${
                            symbol === item ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}>
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Chart iframe container with ID for fullscreen */}
                <div id='chart-fullscreen' className='flex-1 flex flex-col'>
                  <div className='relative flex-1' style={{ minHeight: watchlistCollapsed ? '800px' : '700px' }}>
                    <iframe 
                      key={symbol}
                      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_advanced_${symbol}&symbol=${encodeURIComponent(symbol)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%22study_templates%22%2C%22use_localstorage_for_settings%22%5D&disabled_features=%5B%22header_widget_dom_node%22%5D&locale=en&utm_source=localhost&utm_medium=widget_new&utm_campaign=chart&utm_term=${encodeURIComponent(symbol)}&hide_side_toolbar=0&allow_symbol_change=1&details=1&hotlist=1&calendar=1&studies=1&show_popup_button=1&popup_width=1000&popup_height=650`}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="clipboard-read; clipboard-write"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Flow - Mobile Responsive */}
        <div className='mb-6'>
          <div className='bg-gray-800 border-2 border-purple-500 rounded-lg p-4 sm:p-6'>
            <h3 className='text-base sm:text-lg font-semibold text-white mb-4'>⚡ Order Flow (NinjaTrader Integration)</h3>
            <div className='text-center py-6 sm:py-8'>
              <div className='text-3xl sm:text-4xl mb-2'>📊</div>
              <p className='text-sm sm:text-base text-gray-400'>Footprint Chart Integration Ready</p>
            </div>
          </div>
        </div>

        {/* Primary Indicators - Responsive Grid */}
        <MarketIntelligenceProvider>
          <div className='mb-6'>
            <h2 className='text-xl sm:text-2xl font-bold text-white mb-4'>Market Context</h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'>
              <DirectionalBias />
              <COTOverlay />
              <EconomicCalendar />
              <CorrelatedAssets />
              <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
                <h3 className='text-sm font-semibold text-gray-300 mb-2'>Volume Delta</h3>
                <div className='space-y-2'>
                  <VolumeWidget symbol='MNQ' timeframe='1m' timeRange='all' refreshInterval={300000} />
                </div>
              </div>
            </div>
          </div>
        </MarketIntelligenceProvider>

        {/* Automation & Monitoring - Stack on Mobile */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <AutomationControl />
          <MonitoringDashboard />
        </div>

        {/* Phase 3 Systems - Responsive */}
        <div className='mb-6'>
          <h2 className='text-xl sm:text-2xl font-bold text-white mb-4'>Technical Systems (Phase 3)</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6'>
            {[
              { name: 'Scanner', icon: '🔍', desc: 'Multi-Symbol' },
              { name: 'Cycles', icon: '🔄', desc: 'Expansion' },
              { name: 'Heatmap', icon: '🔥', desc: 'Smart Money' },
              { name: 'Divergence', icon: '📈', desc: 'RSI/MACD' },
              { name: 'Volatility', icon: '⚡', desc: 'ATR + Events' }
            ].map(item => (
              <div key={item.name} className='bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6'>
                <div className='flex flex-col items-center'>
                  <div className='text-2xl sm:text-3xl mb-2'>{item.icon}</div>
                  <h3 className='text-xs sm:text-sm font-semibold text-gray-300'>{item.name}</h3>
                  <p className='text-xs text-gray-500 text-center mt-1'>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}