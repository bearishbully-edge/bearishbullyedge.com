// components/CandlestickChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface CandlestickChartProps {
  symbol?: string;
  height?: number;
}

export default function CandlestickChart({
  symbol = 'MNQ',
  height = 400
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1a1a2e' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2e39' },
        horzLines: { color: '#2a2e39' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    });

    const lineSeries = chart.addLineSeries({
      color: '#26a69a',
      lineWidth: 2,
    });

    const sampleData = [
      { time: '2024-01-01', value: 18550 },
      { time: '2024-01-02', value: 18620 },
      { time: '2024-01-03', value: 18680 },
      { time: '2024-01-04', value: 18590 },
      { time: '2024-01-05', value: 18720 },
    ];

    lineSeries.setData(sampleData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height]);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300">{symbol} Chart</h3>
        <div className="text-xs text-gray-500">1m Timeframe</div>
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
}