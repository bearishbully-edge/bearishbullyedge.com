// components/UpgradeModal.tsx
'use client';

import React from 'react';

export default function UpgradeModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 p-6 rounded-lg border border-blue-600 max-w-md text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          🔒 Upgrade Required
        </h2>
        <p className="text-gray-400 mb-6">
          This feature is available with <strong>Edge Pro</strong> or higher.
        </p>

        <button
          onClick={() => (window.location.href = '/pricing')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          View Plans
        </button>

        <button
          onClick={onClose}
          className="text-gray-400 text-sm mt-4 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
