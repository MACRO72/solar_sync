"use client";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Digital Twin</h1>
        <p className="text-slate-400">
          Real-time 3D simulation of your solar energy system.
        </p>
      </div>

      {loading ? (
        <div className="w-full h-[600px] bg-[#0a0f19] rounded-3xl animate-pulse flex items-center justify-center border border-white/5">
           <div className="flex flex-col items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-48" />
           </div>
        </div>
      ) : latestDevice ? (
        <div className="w-full h-[600px] min-h-[500px]">
          <SolarDigitalTwin 
            lightIndex={latestDevice.irradiance || 0}
            voltage={latestDevice.voltage || 0}
            power={latestDevice.power || 0}
            temperature={latestDevice.temperature || 0}
            dustIndex={latestDevice.dustDensity || 0}
          />
        </div>
      ) : (
        <div className="w-full h-[400px] flex items-center justify-center bg-[#0a0f19] rounded-3xl border border-white/5">
          <p className="text-slate-500">Waiting for live sensor data...</p>
        </div>
      )}
    </motion.div>
  );
}
