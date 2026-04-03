'use client';

import { useState, useEffect, useMemo } from 'react';

export function useDeviceStatus(lastSeen: string | undefined) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Tick every 5 seconds to recalculate status even if no new data arrives
    const interval = setInterval(() => {
      setNow(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const status = useMemo(() => {
    if (!lastSeen) return { isOnline: false, statusText: 'Disconnected', statusColor: 'text-destructive', bgColor: 'bg-destructive/10', borderColor: 'border-destructive/30' };

    let lastSeenDate: Date;
    if (lastSeen.includes('T') || lastSeen.includes('-')) {
        // ISO or standard date format
        lastSeenDate = new Date(lastSeen);
    } else if (lastSeen.includes(':')) {
        // Simple time format HH:mm:ss -> assume today
        const [h, m, s] = lastSeen.split(':').map(Number);
        lastSeenDate = new Date();
        lastSeenDate.setHours(h, m, s, 0);
    } else {
        lastSeenDate = new Date(); // Fallback
    }

    const diffInSeconds = (now.getTime() - lastSeenDate.getTime()) / 1000;
    const isOnline = diffInSeconds < 20; // 20-second threshold

    return {
      isOnline,
      statusText: isOnline ? 'Active' : 'Disconnected',
      statusColor: isOnline ? 'text-[#22C55E]' : 'text-destructive',
      bgColor: isOnline ? 'bg-[#22C55E]/10' : 'bg-destructive/10',
      borderColor: isOnline ? 'border-[#22C55E]/30' : 'border-destructive/30',
      lastSeenRelative: diffInSeconds < 60 ? `${Math.floor(diffInSeconds)}s ago` : lastSeenDate.toLocaleTimeString(),
    };
  }, [lastSeen, now]);

  return status;
}
