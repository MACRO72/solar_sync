'use client';

// Triggering re-build to clear stale cache
import { useState, useEffect } from 'react';
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { SolarEnergyLoader } from "@/components/dashboard/solar-energy-loader";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';

const PerformanceChart = dynamic(
  () => import('@/components/dashboard/performance-chart').then(mod => mod.PerformanceChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />
  }
);


export default function DashboardOverviewPage() {
  const [timerRunning, setTimerRunning] = useState(true);
  const { data: devices, loading: firebaseLoading } = useRealtimeData();

  useEffect(() => {
    const timer = setTimeout(() => setTimerRunning(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Ensure the loader stays for at least 5 seconds, and until data is ready
  const showLoader = timerRunning || firebaseLoading || devices.length === 0;

  const getStatusText = () => {
    if (firebaseLoading) return "Connecting to Firebase...";
    if (devices.length === 0) return "Waiting for ESP32 Sensor Data...";
    if (timerRunning) return "Charging dashboard & Calculating efficiency...";
    return "Data Received. Ready.";
  };

  return (
    <AnimatePresence mode="wait">
      {showLoader ? (
        <SolarEnergyLoader key="loader" />
      ) : (
        <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
            <div className="lg:col-span-3">
                <OverviewStats />
            </div>
            <div className="lg:col-span-2">
                <PerformanceChart />
            </div>
            <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                <RecentAlerts />
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
