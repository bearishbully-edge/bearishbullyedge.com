// lib/automation/globalState.ts
'use client';
// @ts-nocheck

import { create } from 'zustand';
import type {
  AggregatorStatus,
  ExecutorStats,
  TradeSignal,
} from './types';

interface GlobalStore {
  signals: TradeSignal[];
  aggregatorStatus: AggregatorStatus | null;
  executorStats: ExecutorStats | null;
  lastUpdated: number | null;

  addSignal: (s: TradeSignal) => void;
  clearSignals: () => void;
  setAggregatorStatus: (st: AggregatorStatus | null) => void;
  setExecutorStats: (st: ExecutorStats | null) => void;
}

export const useGlobalState = create<GlobalStore>((set) => ({
  signals: [],
  aggregatorStatus: null,
  executorStats: null,
  lastUpdated: null,

  addSignal: (signal) =>
    set((state) => ({
      signals: [signal, ...state.signals].slice(0, 100),
      lastUpdated: Date.now(),
    })),

  clearSignals: () => set({ signals: [], lastUpdated: Date.now() }),

  setAggregatorStatus: (aggregatorStatus) =>
    set(() => ({ aggregatorStatus, lastUpdated: Date.now() })),

  setExecutorStats: (executorStats) =>
    set(() => ({ executorStats, lastUpdated: Date.now() })),
}));
