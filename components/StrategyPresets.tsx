'use client';

import React, { useState } from 'react';
import { getUserLicense } from '../lib/auth/userLicense';

interface TradingStrategy {
  id: string;
  name: string;
  phase: 'Phase 1' | 'Phase 2';
  description: string;
  minPlan: string;
}

export default function StrategyPresets({
  onStrategySelect,
}: {
  onStrategySelect: (strategy: TradingStrategy) => void;
}) {
  const [selectedStrategy, setSelectedStrategy] =
    useState<string>('core_logic');

  // For now this uses the dev fallback in getUserLicense()
  // Later: pass the real user from Supabase into this component.
  const license = getUserLicense();

  const strategies: TradingStrategy[] = [
    // PHASE 1 — CURRENT ENGINE
    {
      id: 'core_logic',
      name: 'CORE',
      phase: 'Phase 1',
      description:
        'Bias + Delta + COT with conservative risk and econ filter.',
      minPlan: 'Edge Starter',
    },
    {
      id: 'core_plus',
      name: 'CORE+',
      phase: 'Phase 1',
      description:
        'CORE with Quantum Pro Order Flow precision entries.',
      minPlan: 'Edge Pro',
    },
    {
      id: 'foundation',
      name: 'FOUNDATION',
      phase: 'Phase 1',
      description:
        'Full technical stack: cycles, divergence, scanners and heatmap.',
      minPlan: 'Edge Institutional',
    },

    // PHASE 2 — POWER SYSTEMS
    {
      id: 'edge',
      name: 'EDGE',
      phase: 'Phase 2',
      description:
        'Institutional flow: OptionFlow, SmartFlow and manipulation filters.',
      minPlan: 'Edge Institutional',
    },
    {
      id: 'edge_pro',
      name: 'EDGE PRO',
      phase: 'Phase 2',
      description:
        'EDGE plus Dark Pool prints, short volume and Top 10 concentration.',
      minPlan: 'Signal Trader Bundle',
    },
    {
      id: 'apex',
      name: 'MASTER',
      phase: 'Phase 2',
      description:
        'MAX ALPHA: all systems plus BBSQ squeeze engine and pro scanners.',
      minPlan: 'ALL-ACCESS ULTIMATE',
    },
  ];

  const handleClick = (strategy: TradingStrategy) => {
    const isEnabled = license.enabledStrategies.includes(strategy.id);

    if (!isEnabled) {
      alert(
        `🚫 ${strategy.name} is locked.\nUpgrade to ${strategy.minPlan} to unlock this mode.`
      );
      return;
    }

    setSelectedStrategy(strategy.id);
    onStrategySelect(strategy);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-300">
          📋 Strategy Evolution
        </h3>
        <button className="text-xs text-blue-400 hover:text-blue-300">
          + Create Custom
        </button>
      </div>

      {/* Phase 1 */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 font-semibold mb-2">
          PHASE 1 – AVAILABLE NOW
        </div>
        <div className="space-y-2">
          {strategies
            .filter((s) => s.phase === 'Phase 1')
            .map((strategy) => {
              const isEnabled = license.enabledStrategies.includes(
                strategy.id
              );
              const isSelected = selectedStrategy === strategy.id;

              return (
                <div
                  key={strategy.id}
                  onClick={() => handleClick(strategy)}
                  className={`p-3 rounded cursor-pointer transition-all ${
                    !isEnabled
                      ? 'opacity-40 cursor-not-allowed bg-gray-900/40 border border-gray-700'
                      : isSelected
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-gray-900/50 border border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {strategy.name}
                        </span>
                        {strategy.id === 'core_logic' && (
                          <span className="text-xs px-1 py-0.5 bg-green-600/30 text-green-400 rounded">
                            Default
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          ({strategy.minPlan})
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {strategy.description}
                      </p>
                    </div>

                    {isSelected && isEnabled && (
                      <div className="text-green-400 text-xs">✓</div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Phase 2 */}
      <div>
        <div className="text-xs text-gray-500 font-semibold mb-2">
          PHASE 2 – COMING SOON
        </div>
        <div className="space-y-2">
          {strategies
            .filter((s) => s.phase === 'Phase 2')
            .map((strategy) => {
              const isEnabled = license.enabledStrategies.includes(
                strategy.id
              );

              return (
                <div
                  key={strategy.id}
                  onClick={() => handleClick(strategy)}
                  className={`p-3 rounded transition-all ${
                    isEnabled
                      ? 'bg-gray-900/60 border border-blue-600 cursor-pointer hover:border-blue-400'
                      : 'bg-gray-900/30 border border-gray-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isEnabled ? 'text-gray-100' : 'text-gray-500'
                          }`}
                        >
                          {strategy.name}
                        </span>
                        {strategy.id === 'apex' && (
                          <span className="text-xs px-1 py-0.5 bg-purple-600/30 text-purple-400 rounded">
                            Ultimate
                          </span>
                        )}
                        <span className="text-xs text-gray-600">
                          🔒 {strategy.minPlan}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {strategy.description}
                      </p>
                    </div>
                    <div className="text-gray-600 text-xs">🔒</div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-top border-gray-700">
        <p className="text-xs text-gray-500">
          Strategy changes take effect immediately. Phase 2 features launching
          Q1 2026.
        </p>
      </div>
    </div>
  );
}
