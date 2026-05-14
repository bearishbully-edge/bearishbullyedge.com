import VolumeWidget from '../components/VolumeWidget';
import TradingViewChart from '../components/TradingViewChart';
import BiasWidget from '../components/BiasWidget';
import COTWidget from '../components/COTWidget';
import COTOverlay from '@/components/widgets/COTOverlay';


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            BearishBully Edge Terminal
          </h1>
          <div className="flex gap-4">
            <a href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Login
            </a>
            <a href="/auth/signup" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Sign Up
            </a>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-6 h-[500px]">
            <TradingViewChart symbol="NASDAQ:QQQ" />
          </div>

          {/* Volume Analysis */}
          <div className="space-y-6">
            <VolumeWidget symbol="MNQ" timeframe="1m" timeRange="1h" />
            <VolumeWidget symbol="MNQ" timeframe="1m" timeRange="24h" />
            <VolumeWidget symbol="MNQ" timeframe="1m" timeRange="all" />
          </div>
        </div>

        {/* Secondary Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Directional Bias */}            <BiasWidget />
            {/* COT Positioning Signals */}
            <COTWidget />

          {/* COT Positioning */}
          {/* COT Positioning */}
<         div className="h-[280px]">
            <COTOverlay />
          </div>

          {/* Economic Calendar */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-[280px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">📅</div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Economic Calendar</h3>
              <p className="text-sm text-gray-500">Calendar Sync Coming Soon</p>
            </div>
          </div>

          {/* Volume Heatmap */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 h-[280px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">🔥</div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Volume Heatmap</h3>
              <p className="text-sm text-gray-500">Coming Soon: Volume Distribution Heatmap</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}