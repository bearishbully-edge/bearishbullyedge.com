"use client";

import { useEffect, useState } from "react";

interface BiasData {
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  strength: number;
  signals: {
    spx: "UP" | "DOWN" | "NEUTRAL";
    ndx: "UP" | "DOWN" | "NEUTRAL";
    djia: "UP" | "DOWN" | "NEUTRAL";
    vix: "LOW" | "HIGH" | "NEUTRAL";
  };
  explanations: {
    overall: string;
    spx: string;
    ndx: string;
    djia: string;
    vix: string;
  };
}

export default function DirectionalBias() {
  const [bias, setBias] = useState<BiasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredSignal, setHoveredSignal] = useState<string | null>(null);

  useEffect(() => {
    calculateBias();
    const interval = setInterval(calculateBias, 60000);
    return () => clearInterval(interval);
  }, []);

  async function calculateBias() {
    const isBullish = Math.random() > 0.5;
    const strength = Math.floor(Math.random() * 40) + 60;

    const mockBias: BiasData = {
      direction: isBullish ? "BULLISH" : "BEARISH",
      strength: strength,
      signals: {
        spx: isBullish ? "UP" : "DOWN",
        ndx: Math.random() > 0.3 ? (isBullish ? "UP" : "DOWN") : "NEUTRAL",
        djia: Math.random() > 0.4 ? (isBullish ? "UP" : "DOWN") : "NEUTRAL",
        vix: isBullish ? "LOW" : "HIGH",
      },
      explanations: {
        overall: isBullish 
          ? `Market showing ${strength}% bullish momentum. Major indices trending upward with decreasing volatility. Risk-on sentiment dominates as institutional money flows into equities.`
          : `Market displaying ${strength}% bearish pressure. Indices under distribution with elevated VIX levels. Defensive positioning recommended as smart money rotates to safety.`,
        spx: isBullish
          ? "S&P 500 breaking above key resistance levels with strong breadth. Technology and growth sectors leading the advance with expanding volume."
          : "S&P 500 facing resistance at prior highs. Declining breadth suggests internal weakness despite headline stability. Watch for support breakdown.",
        ndx: isBullish
          ? "Nasdaq showing tech leadership with mega-caps driving momentum. Strong earnings and AI optimism fueling rally. RSI entering overbought but trend intact."
          : "Nasdaq underperforming as rotation out of tech accelerates. Rising rates pressuring growth stocks. Watch 15,000 support level.",
        djia: isBullish
          ? "Dow Jones confirming bullish trend with industrial strength. Value rotation supporting blue-chip advance. Dividend aristocrats outperforming."
          : "Dow Jones lagging with industrials showing weakness. Cyclical sectors under pressure amid economic concerns. Defensive names attracting flows.",
        vix: isBullish
          ? "VIX compression to sub-15 signals complacency and bullish confidence. Low volatility environment favors momentum strategies. Options pricing cheap."
          : "VIX spiking above 20 indicates rising fear and hedging demand. Elevated volatility suggests caution. Protective puts recommended for long positions.",
      },
    };

    setBias(mockBias);
    setLoading(false);
  }

  if (loading || !bias) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="h-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getBiasColor = (direction: string) => {
    switch (direction) {
      case "BULLISH":
        return "text-green-400 border-green-500 bg-green-500/20";
      case "BEARISH":
        return "text-red-400 border-red-500 bg-red-500/20";
      default:
        return "text-yellow-400 border-yellow-500 bg-yellow-500/20";
    }
  };

  const getSignalColor = (signal: string) => {
    if (signal === "UP" || signal === "LOW") return "text-green-400";
    if (signal === "DOWN" || signal === "HIGH") return "text-red-400";
    return "text-gray-400";
  };

  return (
    <div className="bg-gray-800 border border-green-500 rounded-lg p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300">Daily Bias</h3>
        <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
          LIVE
        </div>
      </div>

      {/* Main Bias Display with Hover */}
      <div 
        className="text-center mb-6 relative"
        onMouseEnter={() => setHoveredSignal('overall')}
        onMouseLeave={() => setHoveredSignal(null)}
      >
        <div
          className={`inline-block px-6 py-3 rounded-lg border-2 ${getBiasColor(
            bias.direction
          )} font-bold text-2xl mb-2 cursor-help transition-all hover:scale-105`}
        >
          {bias.direction}
        </div>
        <div className="text-sm text-gray-400">
          Strength: {bias.strength}%
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div
            className={`h-2 rounded-full transition-all ${
              bias.direction === "BULLISH" ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ width: `${bias.strength}%` }}
          />
        </div>

        {/* Tooltip for Overall Bias */}
        {hoveredSignal === 'overall' && (
          <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-gray-900 border border-gray-600 rounded-lg p-4 text-xs text-gray-300 shadow-xl">
            <div className="font-semibold text-white mb-2">Market Analysis:</div>
            {bias.explanations.overall}
          </div>
        )}
      </div>

      {/* Signal Breakdown with Hover */}
      <div className="space-y-2 relative">
        {[
          { key: 'spx', label: 'SPX', value: bias.signals.spx },
          { key: 'ndx', label: 'NDX', value: bias.signals.ndx },
          { key: 'djia', label: 'DJIA', value: bias.signals.djia },
          { key: 'vix', label: 'VIX', value: bias.signals.vix }
        ].map(({ key, label, value }) => (
          <div 
            key={key}
            className="relative"
            onMouseEnter={() => setHoveredSignal(key)}
            onMouseLeave={() => setHoveredSignal(null)}
          >
            <div className="flex justify-between text-sm cursor-help hover:bg-gray-700/50 p-2 rounded transition">
              <span className="text-gray-400">{label}:</span>
              <span className={`font-semibold ${getSignalColor(value)}`}>
                {value}
              </span>
            </div>

            {/* Individual Signal Tooltip */}
            {hoveredSignal === key && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 shadow-xl">
                <div className="font-semibold text-white mb-1">{label} Analysis:</div>
                {bias.explanations[key as keyof typeof bias.explanations]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          💡 Hover over signals for detailed analysis
        </p>
        <p className="text-xs text-gray-600 text-center mt-1">
          Updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}