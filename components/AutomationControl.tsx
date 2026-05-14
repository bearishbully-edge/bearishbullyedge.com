// components/AutomationControl.tsx
// @ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SignalAggregator } from '../lib/automation/signalAggregator';
import { IndicatorConnector } from '../lib/automation/indicatorConnector';
import { TradeExecutor } from '../lib/automation/tradeExecutor';
import { useGlobalState } from '../lib/automation/globalState';
import StrategyPresets from './StrategyPresets';

const strategyConfigs: Record<string, any> = {
  core_logic: {
    id: 'core_logic',
    name: 'CORE',
    trade_threshold: 0.45,
    confidence_threshold: 0.55,
    orderflow_required: false,
    max_daily_drawdown_pct: 0.02,
    single_trade_max_pct: 0.01,
  },
  core_plus: {
    id: 'core_plus',
    name: 'CORE+',
    trade_threshold: 0.42,
    confidence_threshold: 0.52,
    orderflow_required: true,
    max_daily_drawdown_pct: 0.02,
    single_trade_max_pct: 0.01,
  },
  foundation: {
    id: 'foundation',
    name: 'FOUNDATION',
    trade_threshold: 0.5,
    confidence_threshold: 0.6,
    orderflow_required: true,
    max_daily_drawdown_pct: 0.025,
    single_trade_max_pct: 0.012,
  },
  edge: {
    id: 'edge',
    name: 'EDGE',
    trade_threshold: 0.4,
    confidence_threshold: 0.5,
    orderflow_required: true,
    max_daily_drawdown_pct: 0.03,
    single_trade_max_pct: 0.015,
  },
  edge_pro: {
    id: 'edge_pro',
    name: 'EDGE PRO',
    trade_threshold: 0.38,
    confidence_threshold: 0.48,
    orderflow_required: true,
    max_daily_drawdown_pct: 0.035,
    single_trade_max_pct: 0.018,
  },
  apex: {
    id: 'apex',
    name: 'MASTER',
    trade_threshold: 0.35,
    confidence_threshold: 0.45,
    orderflow_required: true,
    max_daily_drawdown_pct: 0.04,
    single_trade_max_pct: 0.02,
  },
};

export default function AutomationControl() {
  // UI State
  const [enabled, setEnabled] = useState(false);
  const [tradingMode, setTradingMode] = useState<'paper' | 'live'>('paper');
  const [strategy, setStrategy] = useState('core_logic');
  const [market, setMarket] = useState('MNQ');

  // Engine State
  const [aggregator, setAggregator] = useState<any>(null);
  const [connector, setConnector] = useState<any>(null);
  const [executor, setExecutor] = useState<any>(null);

  const [localStatus, setLocalStatus] = useState<any>(null);
  const [localExecStats, setLocalExecStats] = useState<any>(null);
  const [localSignals, setLocalSignals] = useState<any[]>([]);

  // Global shared store
  const addSignal = useGlobalState((s) => s.addSignal);
  const setGlobalAggregatorStatus = useGlobalState(
    (s) => s.setAggregatorStatus
  );
  const setGlobalExecutorStats = useGlobalState(
    (s) => s.setExecutorStats
  );

  // Risk Modal
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  // ───────────────────────────────────────────────
  // CONFIG OBJECT
  // ───────────────────────────────────────────────
  const getCurrentConfig = useCallback(() => {
    const cfg = strategyConfigs[strategy] || strategyConfigs.core_logic;

    return {
      mode: tradingMode,
      orderflow_required: cfg.orderflow_required,
      veto_window_minutes: 30,
      base_cash: 100000,
      size_scaler: 1.0,
      trade_threshold: cfg.trade_threshold,
      confidence_threshold: cfg.confidence_threshold,
      max_daily_drawdown_pct: cfg.max_daily_drawdown_pct,
      single_trade_max_pct: cfg.single_trade_max_pct,
    };
  }, [strategy, tradingMode]);

  // ───────────────────────────────────────────────
  // INITIALIZE ENGINE v3
  // ───────────────────────────────────────────────
  const initializeAutomation = useCallback(() => {
    const config = getCurrentConfig();
    console.log('🚀 Initializing BearishBully Engine v3.1...', config);

    const agg = new SignalAggregator(config, []);
    agg.updateMarket(market);

    const conn = new IndicatorConnector(agg);

    const exec = new TradeExecutor({
      mode: tradingMode,
      max_slippage_pct: 0.1,
      retry_attempts: 3,
      retry_delay_ms: 1000,
      position_limits: {
        max_positions: 5,
        max_position_size_usd: 5000,
        max_daily_trades: 20,
      },
    });

    // ─── SIGNAL HANDLER ────────────────────────────
    agg.on('signal', async (signal: any) => {
      console.log('🚀 NEW SIGNAL:', signal);
      setLocalSignals((prev) => [signal, ...prev].slice(0, 25));
      addSignal(signal);
      await exec.executeSignal(signal);
    });

    // ─── SAFETY EVENTS ─────────────────────────────
    agg.on('veto', (v) => console.log('🚫 VETO:', v));
    agg.on('enabled_changed', (f) => console.log('⚙️ Aggregator enabled:', f));

    exec.on('order_filled', (p) => console.log('✅ Order filled:', p));
    exec.on('position_closed', (p) => console.log('💰 Position closed:', p));
    exec.on('execution_blocked', (p) =>
      console.log('🚫 Execution blocked:', p)
    );

    // Start indicator watchdog
    conn.startMonitoring();
    agg.setEnabled(true);

    setAggregator(agg);
    setConnector(conn);
    setExecutor(exec);

    return { agg, conn, exec };
  }, [getCurrentConfig, market, tradingMode, addSignal]);

  // ───────────────────────────────────────────────
  // ENGINE LIFECYCLE
  // ───────────────────────────────────────────────
  useEffect(() => {
    let refs: any = null;
    let interval: any = null;

    if (enabled) {
      refs = initializeAutomation();

      if (refs) {
        interval = setInterval(() => {
          try {
            const st = refs.agg.getSystemStatus();
            const stats = refs.exec.getStats();

            setLocalStatus(st);
            setLocalExecStats(stats);

            // sync to global dashboards
            setGlobalAggregatorStatus(st);
            setGlobalExecutorStats(stats);
          } catch (err) {
            console.warn('Status polling error:', err);
          }
        }, 1000);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
      if (refs?.conn) refs.conn.stopMonitoring();
      if (refs?.agg) refs.agg.setEnabled(false);

      setAggregator(null);
      setConnector(null);
      setExecutor(null);
      setLocalStatus(null);
      setLocalExecStats(null);
      setLocalSignals([]);
    };
  }, [enabled, initializeAutomation]);

  // ───────────────────────────────────────────────
  // HANDLERS
  // ───────────────────────────────────────────────
  const handleMarketChange = (m) => {
    if (enabled) return; // MODE LOCK
    setMarket(m);
  };

  const handleStrategySelect = (selected) => {
    if (enabled) return; // MODE LOCK
    if (!selected) return;
    setStrategy(selected.id);
  };

  const handleStartClick = () => {
    if (!enabled && !disclaimerAccepted) {
      setShowDisclaimer(true);
      return;
    }
    setEnabled((prev) => !prev);
  };

  // ONE CLICK — no debounce, no delay
  const testSignal = (type: 'bullish' | 'bearish') => {
    if (!connector) return;
    connector.simulateSignal(type);
  };

  const cfg = strategyConfigs[strategy];
  const scorePct = localStatus?.currentScore
    ? (localStatus.currentScore * 100).toFixed(1)
    : '0.0';

  // ───────────────────────────────────────────────
  // UI RENDER
  // ───────────────────────────────────────────────
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">
            🤖 BearishBully Edge – Automation
          </h3>
          <p className="text-[11px] text-gray-400">
            Strategy changes take effect immediately. Phase 2 features launching Q1 2026.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex rounded overflow-hidden border border-gray-600 text-xs">
            <button
              onClick={() => setTradingMode('paper')}
              disabled={enabled}
              className={`px-2 py-1 ${
                tradingMode === 'paper'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              Paper
            </button>
            <button
              onClick={() => setTradingMode('live')}
              disabled={enabled}
              className={`px-2 py-1 ${
                tradingMode === 'live'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              Live
            </button>
          </div>

          <button
            onClick={handleStartClick}
            className={`px-4 py-1.5 rounded text-xs font-semibold ${
              enabled ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
            }`}
          >
            {enabled ? 'STOP' : 'START'}
          </button>
        </div>
      </div>

      {/* STRATEGY + MARKET */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 opacity-100">
          <StrategyPresets
            disabled={enabled}           // MODE LOCK
            onStrategySelect={handleStrategySelect}
          />
        </div>

        <div className="w-40">
          <label className="block text-[11px] text-gray-400 mb-1">
            Market
          </label>
          <select
            disabled={enabled}          // MODE LOCK
            value={market}
            onChange={(e) => handleMarketChange(e.target.value)}
            className="w-full text-xs bg-gray-700 text-gray-200 rounded px-2 py-1.5 border border-gray-600"
          >
            <option value="MNQ">MNQ (Futures)</option>
            <option value="MES">MES (Futures)</option>
            <option value="QQQ">QQQ</option>
            <option value="SPY">SPY</option>
          </select>
        </div>
      </div>

      {/* STATUS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-gray-900/60 rounded p-2">
          <div className="text-gray-500">Strategy</div>
          <div className="text-gray-100 font-semibold">{cfg.name}</div>
        </div>

        <div className="bg-gray-900/60 rounded p-2">
          <div className="text-gray-500">Mode</div>
          <div
            className={
              tradingMode === 'live'
                ? 'text-red-400 font-semibold'
                : 'text-yellow-400 font-semibold'
            }
          >
            {tradingMode.toUpperCase()}
          </div>
        </div>

        <div className="bg-gray-900/60 rounded p-2">
          <div className="text-gray-500">Score</div>
          <div
            className={`font-semibold ${
              (localStatus?.currentScore || 0) >= cfg.trade_threshold
                ? 'text-green-400'
                : 'text-gray-300'
            }`}
          >
            {scorePct}%
          </div>
        </div>

        <div className="bg-gray-900/60 rounded p-2">
          <div className="text-gray-500">Open Positions</div>
          <div className="text-gray-100 font-semibold">
            {localExecStats?.openPositions || 0}
          </div>
        </div>
      </div>

      {/* TEST SIGNALS */}
      {enabled && (
        <div className="flex gap-2">
          <button
            onClick={() => testSignal('bullish')}
            className="flex-1 px-2 py-1.5 bg-green-600/20 border border-green-600 text-green-400 text-xs rounded"
          >
            📈 Test Bully
          </button>

          <button
            onClick={() => testSignal('bearish')}
            className="flex-1 px-2 py-1.5 bg-red-600/20 border border-red-600 text-red-400 text-xs rounded"
          >
            📉 Test Bearish
          </button>
        </div>
      )}

      {/* SIGNAL FEED */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400">Recent Signals</span>
          <span className="text-[10px] text-gray-500">
            {localSignals.length} total
          </span>
        </div>

        {localSignals.length === 0 ? (
          <div className="text-[11px] text-gray-500 border border-dashed border-gray-600 rounded p-2">
            No signals yet. When Bias + Delta (+ Orderflow for CORE+) align,
            trades will appear here.
          </div>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {localSignals.slice(0, 12).map((sig, i) => (
              <div
                key={sig.id || i}
                className="text-[11px] bg-gray-900/70 rounded p-2 flex justify-between items-center"
              >
                <div className="flex flex-col">
                  <span
                    className={
                      sig.side === 'long'
                        ? 'text-green-400'
                        : 'text-red-400'
                    }
                  >
                    {sig.side?.toUpperCase()} {sig.market}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {sig.reasons?.slice(0, 2).join(' · ')}
                  </span>
                </div>
                <div className="text-right text-[10px] text-gray-400">
                  <div>{((sig.confidence || 0) * 100).toFixed(0)}% conf</div>
                  <div>{(sig.score || 0).toFixed(2)} score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!enabled && (
        <div className="text-[11px] text-yellow-400">
          ⚡ Click <span className="font-semibold">START</span> to arm the engine.
        </div>
      )}

      {/* FULL LEGAL RISK DISCLOSURE */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-red-500 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-red-900/50 px-6 py-4 border-b border-red-500">
              <h2 className="text-xl font-bold text-red-400">
                ⚠️ MANDATORY RISK DISCLOSURE
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm text-gray-300">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-bold text-white mb-1">1. HIGH-RISK WARNING</h3>
                <p className="text-red-400 font-semibold">
                  Trading futures, options, and leveraged instruments involves
                  substantial risk of loss. Past performance is not indicative
                  of future results.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-bold text-white mb-1">2. EDUCATIONAL USE ONLY</h3>
                <p>
                  BearishBully Edge is for{" "}
                  <strong className="text-yellow-400">
                    EDUCATIONAL PURPOSES ONLY
                  </strong>
                  . No financial advice is provided.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-bold text-white mb-1">3. HYPOTHETICAL PERFORMANCE</h3>
                <p>
                  Simulated results do not represent actual trading and may
                  substantially understate or overstate actual performance.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-bold text-white mb-1">4. LIMITATION OF LIABILITY</h3>
                <p>
                  BearishBully Edge, its owners, and its developers assume{" "}
                  <strong className="text-red-400">NO LIABILITY</strong> for any
                  losses incurred while trading futures or derivatives.
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-white mb-1">5. USER RESPONSIBILITY</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>You are at least 18 years old.</li>
                  <li>You understand all trading risks.</li>
                  <li>You accept full responsibility for all trades.</li>
                  <li>You will only trade funds you can afford to lose.</li>
                </ul>
              </div>

              <div className="border-l-4 border-cyan-500 pl-4">
                <h3 className="font-bold text-white mb-1">6. GOVERNING LAW</h3>
                <p>
                  This agreement is governed by the laws of the State of Florida.
                  All disputes shall be resolved in Miami-Dade County.
                </p>
              </div>
            </div>

            <div className="bg-gray-800 px-6 py-4 border-t border-gray-700">
              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-xs text-gray-300">
                  I have read and accept all terms and risks.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDisclaimer(false);
                    setConfirmChecked(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (!confirmChecked) {
                      alert('Check the box first');
                      return;
                    }
                    setDisclaimerAccepted(true);
                    setShowDisclaimer(false);
                    setEnabled(true);
                  }}
                  disabled={!confirmChecked}
                  className="flex-1 px-4 py-3 bg-yellow-600 disabled:bg-gray-600 text-black font-bold rounded"
                >
                  I ACCEPT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
