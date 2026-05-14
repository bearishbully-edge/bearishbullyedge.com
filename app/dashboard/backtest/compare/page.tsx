'use client';

import React from 'react';
import CompareEnginesControl from '../../../../components/backtest/CompareEnginesControl';

export default function CompareEnginesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Engine Comparison</h1>
      <p className="text-gray-400 text-sm mb-4">
        Validate Backtest Engine accuracy vs Live Automation scoring.
      </p>

      <CompareEnginesControl />
    </div>
  );
}
