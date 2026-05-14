// components/LaunchCountdown.tsx
'use client';

import React, { useEffect, useState } from 'react';

export default function LaunchCountdown() {
  const launchDate = new Date('2025-01-01T00:00:00-05:00').getTime();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = launchDate - now;

      if (distance <= 0) {
        setTimeLeft('Expired');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-blue-900 text-white text-center p-3 rounded mb-6 text-sm">
      🎉 <span className="font-bold">Launch Pricing</span> ends in {timeLeft}
    </div>
  );
}
