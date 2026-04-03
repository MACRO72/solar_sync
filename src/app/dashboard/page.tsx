'use client';
export const runtime = 'nodejs';

import React, { useState, useEffect, useCallback } from 'react';
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import { SolarEnergyLoader } from "@/components/dashboard/solar-energy-loader";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { useAppState } from '@/context/app-state-provider';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { Box, BarChart3, PanelTop, Wifi, Lightbulb, ShieldCheck, Server, Database, HardDrive, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { DevicesMap } from "@/components/dashboard/devices-map";
import { DevicesTable } from "@/components/dashboard/devices-table";
import { AIInsightsPanel } from '@/components/dashboard/ai-insights-panel';
import { SolarPredictionChart } from '@/components/dashboard/solar-prediction-chart';
import { EfficiencyAnalyzer } from '@/components/dashboard/efficiency-analyzer';
import { EnergyFlowVisualizer } from '@/components/dashboard/energy-flow-visualizer';
import { SolarDigitalTwin } from '@/components/dashboard/solar-digital-twin';
import { SystemSummaryBanner } from '@/components/dashboard/system-summary-banner';
import { SimNotificationStack } from '@/components/dashboard/sim-notification-stack';
import { useEventSimulation } from '@/hooks/use-event-simulation';
import { GlassCard } from '@/components/glass-card';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useScroll, useTransform } from 'framer-motion';

const PerformanceChart = dynamic(
  () => import('@/components/dashboard/performance-chart').then(mod => mod.PerformanceChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full bg-slate-800/50 rounded-2xl border border-white/5 animate-pulse" />
  }
);

export default function DashboardOverviewPage() {
  const { data: devices, loading: firebaseLoading } = useRealtimeData();
  const { shouldShowLoader, setShouldShowLoader, name: userName } = useAppState();
  const latestDevice = devices[0];

  // Analysis refresh key — incrementing it re-mounts AIInsightsPanel for a visual refresh
  const [analysisKey, setAnalysisKey] = useState(0);
  const handleAnalysis = useCallback(() => {
    setAnalysisKey((k) => k + 1);
  }, []);

  // ── Event simulation engine ────────────────────────────────────────────
  const sim = useEventSimulation();

  // Merge real sensor data with sim delta (pure frontend overlay)
  const simDevice = latestDevice ? {
    ...latestDevice,
    power:       Math.max(0, (latestDevice.power       || 0) * sim.delta.powerFactor),
    temperature: Math.max(0, (latestDevice.temperature || 0) + sim.delta.tempOffset),
    dustDensity: Math.max(0, (latestDevice.dustDensity || 0) + sim.delta.dustOffset),
    irradiance:  Math.max(0, (latestDevice.irradiance  || 0) * sim.delta.powerFactor),
  } : latestDevice;

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.15, 0.3, 0.3, 0.15]);

  useEffect(() => {
    if (shouldShowLoader) {
      // Instant transition once data is ready
      if (devices.length > 0 || !firebaseLoading) {
          setShouldShowLoader(false);
      }
    }
  }, [shouldShowLoader, setShouldShowLoader, devices.length, firebaseLoading]);

  // Section Component moved outside for zero-overhead memoization

  return (
    <AnimatePresence mode="popLayout">
      {/* Floating sim notifications — rendered outside scroll flow */}
      <SimNotificationStack
        notifications={sim.notifications}
        onDismiss={sim.dismissNotification}
      />
      {shouldShowLoader ? (
        <SolarEnergyLoader key="loader" />
      ) : (
        <div key="dashboard-main-content" className="relative min-h-screen">
          {/* Friction-less Scroll Progress */}
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
            style={{ scaleX: scrollYProgress, boxShadow: "0 0 15px hsla(var(--primary), 0.8)" }}
          />

          {/* Parallax Floor Layer — only transform+opacity animated (GPU composited) */}
          <motion.div
            className="fixed inset-0 pointer-events-none z-[-1]"
            style={{
              y: backgroundY,
              opacity: backgroundOpacity,
            }}
          >
            {/* Static background pattern — rendered once, no per-frame style recalc */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: [
                  'radial-gradient(circle at 50% 50%, hsla(var(--primary), 0.1) 0%, transparent 80%)',
                  'repeating-linear-gradient(hsla(var(--primary), 0.05) 0px, hsla(var(--primary), 0.05) 1px, transparent 1px, transparent 100px)',
                  'repeating-linear-gradient(90deg, hsla(var(--primary), 0.05) 0px, hsla(var(--primary), 0.05) 1px, transparent 1px, transparent 100px)',
                ].join(','),
                backgroundSize: '100% 100%, 100px 100px, 100px 100px',
              }}
            />
          </motion.div>

          <div className="flex flex-col gap-4 w-full px-4 md:px-8 max-w-[1600px] mx-auto pb-20 pt-4">
            {/* SECTION 1: OVERVIEW */}
            <ScrollSection id="overview" forceVisible={true} className="pt-0">
              {/* ── Smart system summary banner ── */}
              <SystemSummaryBanner
                userName={userName}
                data={simDevice ? {
                  power:       simDevice.power       || 0,
                  temperature: simDevice.temperature || 0,
                  irradiance:  simDevice.irradiance  || 0,
                  dustDensity: simDevice.dustDensity || 0,
                } : null}
                onAnalysis={handleAnalysis}
              />

              {/* ── Simulation toggle ── */}
              <div className="flex items-center justify-end">
                <motion.button
                  id="btn-sim-toggle"
                  onClick={sim.toggle}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all duration-300",
                    sim.active
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  )}
                >
                  {/* Live pulse dot */}
                  <span className="relative flex h-2 w-2">
                    {sim.active && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    )}
                    <span className={cn(
                      "relative inline-flex h-2 w-2 rounded-full",
                      sim.active ? "bg-rose-400" : "bg-emerald-400"
                    )} />
                  </span>
                  {sim.active ? "Stop Simulation" : "Start Simulation"}
                </motion.button>
              </div>

              <OverviewStats />
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 w-full">
                  <div className="lg:col-span-2 flex flex-col">
                      <PerformanceChart />
                  </div>
                  <div className="lg:col-span-1 flex flex-col">
                      <RecentAlerts />
                  </div>
              </div>
            </ScrollSection>

            {/* SECTION 2: ANALYTICS */}
            <ScrollSection id="analytics">
              <PerformanceChart fullHeight={true} defaultPeriod="7d" />
            </ScrollSection>

            {/* SECTION 4: DEVICES */}
            <ScrollSection id="devices">
              <DevicesTable />
              <DevicesMap />
            </ScrollSection>

            {/* SECTION 6: INSIGHTS */}
            <ScrollSection id="insights">
              {simDevice ? (
                <div className="flex flex-col gap-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <EfficiencyAnalyzer 
                      power={simDevice.power || 0}
                      irradiance={simDevice.irradiance || 0}
                      dustDensity={simDevice.dustDensity || 0}
                    />
                    <SystemHealthCard device={simDevice} />
                  </div>
                  <EnergyFlowVisualizer power={simDevice.power || 0} />
                  <SolarPredictionChart 
                    historicalData={devices}
                    currentIrradiance={simDevice.irradiance || 0}
                    currentTemp={simDevice.temperature || 0}
                    currentDust={simDevice.dustDensity || 0}
                  />
                  {/* key={analysisKey} re-mounts panel when AI Analysis runs */}
                  <AIInsightsPanel key={analysisKey} data={simDevice as any} />
                </div>
              ) : (
                  <div className="h-96 bg-white/5 animate-pulse rounded-3xl" />
              )}
            </ScrollSection>

            {/* SECTION 7: DIGITAL TWIN (Last) */}
            <ScrollSection id="digital-twin" className="pb-40">
              {latestDevice ? (
                <SolarDigitalTwin 
                  lightIndex={latestDevice.irradiance || 0}
                  voltage={latestDevice.voltage || 0}
                  power={latestDevice.power || 0}
                  temperature={latestDevice.temperature || 0}
                  dustIndex={latestDevice.dustDensity || 0}
                />
              ) : (
                <div className="w-full h-[600px] bg-[#0a0f19] rounded-3xl animate-pulse flex items-center justify-center border border-white/5" />
              )}
            </ScrollSection>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Optimized Scroll Section
const ScrollSection = React.memo(({ id, children, className, delay = 0, forceVisible = false }: any) => {
  const { setActiveSection } = useAppState();

  const variants = {
    hidden: { opacity: 0, y: 40, filter: 'blur(15px)', scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)', 
      scale: 1,
      transition: {
          duration: 0.2,
          staggerChildren: 0.05,
          delayChildren: 0.05,
          type: "spring",
          damping: 30,
          stiffness: 120,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
      <motion.section
      id={id}
      initial={forceVisible ? "visible" : "hidden"}
      whileInView={!forceVisible ? "visible" : undefined}
      onViewportEnter={() => setActiveSection(id)}
      viewport={{ amount: 0.15, once: true }}
      variants={variants}
      className={cn("w-full flex flex-col gap-10 py-10 scroll-mt-24 min-h-[50vh] justify-center", className)}
    >
      <motion.div variants={itemVariants} className="w-full h-full flex flex-col gap-10">
          {children}
      </motion.div>
    </motion.section>
  );
});
ScrollSection.displayName = 'ScrollSection';



const SystemHealthCard = React.memo(({ device }: { device: any }) => {
    const status = useDeviceStatus(device.lastSeen);
    
    const healthStatus = React.useMemo(() => {
        const sensorsActive = device.voltage > 0 || device.irradiance > 0;
        
        if (!status.isOnline) return { status: 'Critical', color: 'text-destructive', icon: XCircle };
        if (!sensorsActive) return { status: 'Warning', color: 'text-[#FACC15]', icon: AlertCircle };
        return { status: 'Healthy', color: 'text-[#22C55E]', icon: CheckCircle2 };
    }, [device, status]);

    const HealthItem = ({ icon: Icon, label, status, isHealthy }: any) => (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-slate-400 group-hover:text-[#22D3EE] transition-colors">
                    <Icon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-300">{label}</span>
            </div>
            <span className={cn("text-xs font-bold", isHealthy ? "text-[#22C55E]" : "text-destructive")}>{status}</span>
        </div>
    );

    return (
        <GlassCard className="p-6 bg-[#0B1220]/50 border-white/5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#22D3EE]" />
                    <h3 className="text-white font-bold text-lg tracking-tight">AI Health Monitor</h3>
                </div>
                <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10", healthStatus.color)}>
                    <healthStatus.icon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{healthStatus.status}</span>
                </div>
            </div>
            <div className="space-y-6">
                <HealthItem 
                    icon={Server} 
                    label="ESP32 Processing" 
                    status={status.isOnline ? 'Active Stream' : 'Link Failure'} 
                    isHealthy={status.isOnline} 
                />
                <HealthItem 
                    icon={Database} 
                    label="Cloud Logic Engine" 
                    status="Real-time Sync" 
                    isHealthy={true} 
                />
                <HealthItem 
                    icon={HardDrive} 
                    label="Photovoltaic State" 
                    status={device.voltage > 0.5 ? 'Generating' : 'Dormant (No Light)'} 
                    isHealthy={true} 
                />
                <HealthItem 
                    icon={Wifi} 
                    label="Telemetry Stream" 
                    status={status.isOnline ? 'Live Feed' : 'Stopped'} 
                    isHealthy={status.isOnline} 
                />
            </div>
        </GlassCard>
    );
});
SystemHealthCard.displayName = 'SystemHealthCard';
