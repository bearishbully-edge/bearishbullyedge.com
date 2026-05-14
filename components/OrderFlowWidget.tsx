"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface FootprintLevel {
  Price: number;
  BidVolume: number;
  AskVolume: number;
  TotalVolume: number;
  Delta: number;
  ImbalanceRatio: number;
}

interface OrderFlowData {
  Timestamp: string;
  Instrument: string;
  CurrentPrice: number;
  Footprint: FootprintLevel[];
  Delta: {
    CumulativeDelta: number;
    DeltaPercentage: number;
    MaxDelta: number;
    MinDelta: number;
  };
}

export default function OrderFlowWidget() {
  const [orderFlow, setOrderFlow] = useState<OrderFlowData | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    subscribeToOrderFlow();
  }, []);

  async function subscribeToOrderFlow() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subscribe to realtime updates
    const channel = supabase
      .channel('orderflow-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orderflow_live',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setOrderFlow(payload.new.data);
          setConnected(true);
        }
      )
      .subscribe();

    // Load initial data
    const { data } = await supabase
      .from('orderflow_live')
      .select('data')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setOrderFlow(data.data);
      setConnected(true);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const getDeltaColor = (delta: number) => {
    return delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-gray-400";
  };

  const getImbalanceColor = (ratio: number) => {
    if (ratio > 0.7) return "bg-yellow-500/20 border-yellow-500";
    return "bg-gray-700/20 border-gray-600";
  };

  if (!orderFlow) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">⚡ Order Flow</h3>
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
        </div>
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📊</div>
          <p>Waiting for NinjaTrader connection...</p>
          <p className="text-xs mt-2">Make sure indicator is running</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-purple-500 rounded-lg">
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              ⚡ Order Flow
              <span className="text-xs text-gray-400 font-normal">
                {orderFlow.Instrument}
              </span>
            </h3>
            <div className="text-2xl font-bold text-white mt-1">
              ${orderFlow.CurrentPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} mb-2`} />
            <div className="text-xs text-gray-500">
              {new Date(orderFlow.Timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Delta Metrics */}
      <div className="grid grid-cols-2 gap-4 p-4 border-b border-gray-700">
        <div>
          <div className="text-xs text-gray-500 mb-1">Cumulative Delta</div>
          <div className={`text-xl font-bold ${getDeltaColor(orderFlow.Delta.CumulativeDelta)}`}>
            {orderFlow.Delta.CumulativeDelta > 0 ? '+' : ''}
            {orderFlow.Delta.CumulativeDelta.toFixed(0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Delta %</div>
          <div className={`text-xl font-bold ${getDeltaColor(orderFlow.Delta.DeltaPercentage)}`}>
            {orderFlow.Delta.DeltaPercentage > 0 ? '+' : ''}
            {orderFlow.Delta.DeltaPercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Footprint */}
      <div className="p-4 max-h-[400px] overflow-y-auto">
        <div className="space-y-1">
          {orderFlow.Footprint.slice(0, 20).map((level, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-4 gap-2 p-2 rounded text-xs border ${getImbalanceColor(level.ImbalanceRatio)}`}
            >
              <div className="text-gray-400 font-mono">
                ${level.Price.toFixed(2)}
              </div>
              <div className="text-green-400 font-semibold text-right">
                {level.BidVolume.toLocaleString()}
              </div>
              <div className="text-red-400 font-semibold text-right">
                {level.AskVolume.toLocaleString()}
              </div>
              <div className={`font-bold text-right ${getDeltaColor(level.Delta)}`}>
                {level.Delta > 0 ? '+' : ''}
                {level.Delta.toFixed(0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-700 p-3 bg-gray-900">
        <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
          <div>Price</div>
          <div className="text-right">Bid</div>
          <div className="text-right">Ask</div>
          <div className="text-right">Delta</div>
        </div>
      </div>
    </div>
  );
}