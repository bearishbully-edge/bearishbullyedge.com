"use client"

import { useEffect, useState } from 'react'

interface COTSignal {
  id: number
  market_code: string
  signal: string
  zscore: number
  report_date: string
  confidence: number
}

export default function COTWidget() {
  const [signals, setSignals] = useState<COTSignal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cot/signals')
      .then(res => res.json())
      .then(data => {
        setSignals(data.signals || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('COT fetch error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">📊 COT Extreme Positioning</h3>
        <div className="text-slate-400 text-sm">Loading signals...</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span className="text-xl">📊</span>
        COT Extreme Positioning
      </h3>
      <div className="space-y-2">
        {signals.length === 0 ? (
          <div className="text-slate-400 text-xs">No extreme positioning detected</div>
        ) : (
          signals.map((signal) => (
            <div
              key={signal.id}
              className={`p-3 rounded-lg border ${
                signal.signal.includes('long')
                  ? 'bg-green-950/30 border-green-800/50'
                  : 'bg-red-950/30 border-red-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">{signal.market_code}</div>
                  <div className="text-xs text-slate-400">
                    Z-Score: {signal.zscore.toFixed(2)}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    signal.signal.includes('long')
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {signal.signal.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
