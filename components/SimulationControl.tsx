'use client';

import React, { useState } from 'react';

interface SimulationSettings {
  startDate: string;
  endDate: string;
  speed: number; // 1x, 2x, 5x, 10x speed
  dataSource: 'historical' | 'simulated';
}

export default function SimulationControl({ onStart }: { onStart: (settings: SimulationSettings) => void }) {
  const [settings, setSettings] = useState<SimulationSettings>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    speed: 1,
    dataSource: 'simulated'
  });

  return (
    <div className='bg-gray-800 border border-gray-700 rounded-lg p-4'>
      <h3 className='text-sm font-semibold text-gray-300 mb-3'>⏱️ Simulation Control</h3>
      
      <div className='grid grid-cols-2 gap-3 mb-3'>
        <div>
          <label className='text-xs text-gray-400'>Start Date/Time</label>
          <input
            type='datetime-local'
            value={settings.startDate}
            onChange={(e) => setSettings({...settings, startDate: e.target.value})}
            className='w-full text-xs bg-gray-900 text-gray-300 rounded px-2 py-1 border border-gray-700'
          />
        </div>
        <div>
          <label className='text-xs text-gray-400'>End Date/Time</label>
          <input
            type='datetime-local'
            value={settings.endDate}
            onChange={(e) => setSettings({...settings, endDate: e.target.value})}
            className='w-full text-xs bg-gray-900 text-gray-300 rounded px-2 py-1 border border-gray-700'
          />
        </div>
      </div>

      <div className='flex gap-2 mb-3'>
        <label className='text-xs text-gray-400'>Speed:</label>
        {[1, 2, 5, 10].map(speed => (
          <button
            key={speed}
            onClick={() => setSettings({...settings, speed})}
            className={`px-2 py-1 text-xs rounded ${
              settings.speed === speed 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {speed}x
          </button>
        ))}
      </div>

      <button
        onClick={() => onStart(settings)}
        className='w-full px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition'
      >
        Start Simulation
      </button>
    </div>
  );
}