"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Server, Database, HardDrive, Wifi, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { AIInsightsPanel } from '@/components/dashboard/ai-insights-panel';
import { SolarPredictionChart } from '@/components/dashboard/solar-prediction-chart';
import { EfficiencyAnalyzer } from '@/components/dashboard/efficiency-analyzer';
import { EnergyFlowVisualizer } from '@/components/dashboard/energy-flow-visualizer';
import { GlassCard } from '@/components/glass-card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function InsightsPage() {
  const { data: devices, loading } = useRealtimeData();
  const latestDevice = devices[0];

  // System Health Logic
  const healthStatus = React.useMemo(() => {
    if (!latestDevice) return { status: 'Unknown', color: 'text-slate-500' };

    let issues = 0;
    // 1. Connection check (handled by PageHeader, but we'll repeat here for health card)
    const lastSeenDate = latestDevice.lastSeen?.includes('T') ? new Date(latestDevice.lastSeen) : new Date();
    const isConnected = (new Date().getTime() - lastSeenDate.getTime()) / 1000 < 30;
    
    // 2. Sensor sanity checks
    const sensorsActive = latestDevice.voltage > 0 || latestDevice.irradiance > 0;
    
    if (!isConnected) return { status: 'Critical', color: 'text-destructive', icon: XCircle };
    if (!sensorsActive) return { status: 'Warning', color: 'text-[#FACC15]', icon: AlertCircle };
    
    return { status: 'Healthy', color: 'text-[#22C55E]', icon: CheckCircle2 };
  }, [latestDevice]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="h-10 w-48 bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white/5 animate-pulse rounded-3xl" />
          <div className="h-80 bg-white/5 animate-pulse rounded-3xl" />
        </div>
        <div className="h-96 bg-white/5 animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!latestDevice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Connecting to AI Intelligence Engine...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-8 pb-20"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Solar Intelligence Hub</h1>
        <p className="text-slate-400">
          AI-driven diagnostics, predictive analytics, and performance insights.
        </p>
      </div>

      {/* Row 1: Efficiency & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EfficiencyAnalyzer 
          power={latestDevice.power || 0}
          irradiance={latestDevice.irradiance || 0}
          dustDensity={latestDevice.dustDensity || 0}
        />

        <GlassCard className="p-6 bg-[#0B1220]/50 border-white/5 flex flex-col">
           <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#22D3EE]" />
                    <h3 className="text-white font-bold text-lg tracking-tight">System Health</h3>
                </div>
                <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10", healthStatus.color)}>
                    <healthStatus.icon size={14} />
                    <span className="text-xs font-bold uppercase tracking-widest">{healthStatus.status}</span>
                </div>
           </div>

           <div className="space-y-6">
                <HealthItem 
                    icon={Server} 
                    label="ESP32 Unit" 
                    status={healthStatus.status === 'Critical' ? 'Offline' : 'Connected'} 
                    isHealthy={healthStatus.status !== 'Critical'} 
                />
                <HealthItem 
                    icon={Database} 
                    label="Database Sync" 
                    status="Live" 
                    isHealthy={true} 
                />
                <HealthItem 
                    icon={HardDrive} 
                    label="Sensors" 
                    status={latestDevice.voltage === 0 && latestDevice.current === 0 ? 'No Response' : 'Responding'} 
                    isHealthy={!(latestDevice.voltage === 0 && latestDevice.current === 0)} 
                />
                <HealthItem 
                    icon={Wifi} 
                    label="Connectivity" 
                    status="Steady" 
                    isHealthy={true} 
                />
           </div>

           <div className="mt-auto pt-6 border-t border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Last Analysis</p>
                <p className="text-slate-400 text-xs">{new Date().toLocaleTimeString()} - AI Engine fully operational.</p>
           </div>
        </GlassCard>
      </div>

      {/* Row 2: Energy Flow */}
      <EnergyFlowVisualizer power={latestDevice.power || 0} />

      {/* Row 3: Prediction Chart */}
      <SolarPredictionChart 
        historicalData={devices}
        currentIrradiance={latestDevice.irradiance || 0}
        currentTemp={latestDevice.temperature || 0}
        currentDust={latestDevice.dustDensity || 0}
      />

      {/* Row 4: AI Insights Feed */}
      <AIInsightsPanel data={latestDevice} />
    </motion.div>
  );
}

function HealthItem({ icon: Icon, label, status, isHealthy }: { icon: any, label: string, status: string, isHealthy: boolean }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-slate-400 group-hover:text-[#22D3EE] transition-colors">
                    <Icon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-300">{label}</span>
            </div>
            <span className={cn(
                "text-xs font-bold",
                isHealthy ? "text-[#22C55E]" : "text-destructive"
            )}>
                {status}
            </span>
        </div>
    )
}
