"use client";
export const runtime = 'nodejs';

import React from 'react';
import { motion } from 'framer-motion';
import { SolarDigitalTwin } from '@/components/dashboard/solar-digital-twin';
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function DigitalTwinPage() {
  const { data: devices, loading } = useRealtimeData();
  const latestDevice = devices[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4 sm:gap-6 min-h-screen sm:min-h-0 h-[calc(100vh-120px)] sm:h-auto overflow-hidden sm:overflow-visible"
    >
      <div className="flex flex-col gap-1 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Digital Twin</h1>
        <p className="text-slate-400 text-sm">
          Real-time 3D simulation of your solar energy system.
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full rounded-3xl overflow-hidden relative border border-white/5 bg-[#0a0f19] touch-none overscroll-none">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-48" />
             </div>
          </div>
        ) : latestDevice ? (
          <SolarDigitalTwin 
            lightIndex={latestDevice.irradiance || 0}
            voltage={latestDevice.voltage || 0}
            power={latestDevice.power || 0}
            temperature={latestDevice.temperature || 0}
            dustIndex={latestDevice.dustDensity || 0}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-500">Waiting for live sensor data...</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
