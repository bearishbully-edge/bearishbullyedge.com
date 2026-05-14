// components/backtest/UploadCSV.tsx
'use client';

import React, { useState } from 'react';
import { parseCSVToCandles } from '../../lib/backtest/historicalFeed';
import type { BacktestCandle } from '../../lib/backtest/types';

interface UploadCSVProps {
  onDataLoaded: (candles: BacktestCandle[]) => void;
}

export default function UploadCSV({ onDataLoaded }: UploadCSVProps) {
  const [status, setStatus] = useState<string>('No file loaded');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus(`Loading ${file.name}...`);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result || '');
      try {
        const candles = parseCSVToCandles(text);
        if (candles.length === 0) {
          setStatus('No valid rows detected in CSV.');
        } else {
          setStatus(`Loaded ${candles.length} candles.`);
          onDataLoaded(candles);
        }
      } catch (err: any) {
        console.error(err);
        setStatus('Failed to parse CSV.');
      }
    };
    reader.onerror = () => {
      setStatus('Failed to read file.');
    };

    reader.readAsText(file);
  };

  return (
    <div className="border border-gray-700 rounded-lg p-3 bg-gray-900/70">
      <label className="block text-xs font-semibold text-gray-300 mb-2">
        Historical Data (CSV)
      </label>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleFileChange}
        className="block w-full text-xs text-gray-300 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
      />
      <p className="mt-2 text-[11px] text-gray-500">{status}</p>
      <p className="mt-1 text-[10px] text-gray-500">
        Expected columns: timestamp, open, high, low, close, [volume], [delta], [symbol]
      </p>
    </div>
  );
}
