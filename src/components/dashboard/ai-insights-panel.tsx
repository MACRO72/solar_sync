"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Wind,
  Thermometer,
  Zap,
  Sun,
  TrendingUp,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/glass-card";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type InsightType = "critical" | "warning" | "success" | "info";

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  recommendation: string;
  icon: LucideIcon;
  /** 0‒100 severity score shown as a thin bar */
  severity: number;
}

interface AIInsightsPanelProps {
  data: {
    voltage?: number;
    current?: number;
    power?: number;
    temperature?: number;
    irradiance?: number;
    dustDensity?: number;
    [key: string]: unknown;
  };
}

// ─── Colour palette (one source of truth) ────────────────────────────────────

const palette: Record<
  InsightType,
  {
    border: string;
    bg: string;
    iconBg: string;
    iconText: string;
    badgeText: string;
    bar: string;
    glow: string;
    label: string;
  }
> = {
  critical: {
    border: "border-l-red-500/80",
    bg: "bg-red-500/5",
    iconBg: "bg-red-500/10",
    iconText: "text-red-400",
    badgeText: "text-red-400",
    bar: "bg-red-500",
    glow: "shadow-red-500/20",
    label: "Critical",
  },
  warning: {
    border: "border-l-yellow-400/80",
    bg: "bg-yellow-400/5",
    iconBg: "bg-yellow-400/10",
    iconText: "text-yellow-400",
    badgeText: "text-yellow-400",
    bar: "bg-yellow-400",
    glow: "shadow-yellow-400/20",
    label: "Warning",
  },
  success: {
    border: "border-l-emerald-400/80",
    bg: "bg-emerald-400/5",
    iconBg: "bg-emerald-400/10",
    iconText: "text-emerald-400",
    badgeText: "text-emerald-400",
    bar: "bg-emerald-400",
    glow: "shadow-emerald-400/20",
    label: "Good",
  },
  info: {
    border: "border-l-cyan-400/80",
    bg: "bg-cyan-400/5",
    iconBg: "bg-cyan-400/10",
    iconText: "text-cyan-400",
    badgeText: "text-cyan-400",
    bar: "bg-cyan-400",
    glow: "shadow-cyan-400/20",
    label: "Info",
  },
};

// ─── Insight logic ────────────────────────────────────────────────────────────

function generateInsights(data: AIInsightsPanelProps["data"]): Insight[] {
  const list: Insight[] = [];

  const voltage = data.voltage ?? 0;
  const power = data.power ?? 0;
  const temperature = data.temperature ?? 0;
  const irradiance = data.irradiance ?? 0;
  const dustDensity = data.dustDensity ?? 0;

  // 1 · Dust accumulation
  if (dustDensity > 200) {
    list.push({
      id: "dust-critical",
      type: "critical",
      title: "Severe Dust Accumulation",
      description: `Dust density at ${dustDensity.toFixed(1)} µg/m³ — far above safe limits. Panel output is critically affected.`,
      recommendation: "Immediate panel cleaning required.",
      icon: Wind,
      severity: Math.min(100, ((dustDensity - 200) / 200) * 100 + 70),
    });
  } else if (dustDensity > 150) {
    list.push({
      id: "dust-warning",
      type: "warning",
      title: "Dust Accumulation Detected",
      description: `Dust density is ${dustDensity.toFixed(1)} µg/m³, reducing light absorption efficiency.`,
      recommendation: "Schedule a panel cleaning within 24 hours.",
      icon: Wind,
      severity: Math.min(70, ((dustDensity - 150) / 50) * 40 + 30),
    });
  }

  // 2 · Temperature
  if (temperature > 55) {
    list.push({
      id: "temp-critical",
      type: "critical",
      title: "Panel Overheating Risk",
      description: `Temperature at ${temperature.toFixed(1)}°C exceeds the silicon efficiency ceiling (55°C). Thermal degradation risk is high.`,
      recommendation: "Activate cooling or temporarily reduce load.",
      icon: Thermometer,
      severity: Math.min(100, ((temperature - 55) / 20) * 100 + 70),
    });
  } else if (temperature > 45) {
    list.push({
      id: "temp-high",
      type: "warning",
      title: "Elevated Panel Temperature",
      description: `Panel at ${temperature.toFixed(1)}°C — above the optimal 15–45°C range.`,
      recommendation: "Monitor closely; consider shading analysis.",
      icon: Thermometer,
      severity: ((temperature - 45) / 10) * 40 + 30,
    });
  } else if (temperature >= 15 && temperature <= 35) {
    list.push({
      id: "temp-optimal",
      type: "success",
      title: "Optimal Temperature",
      description: `Panel operates at ${temperature.toFixed(1)}°C — ideal for maximum silicon efficiency.`,
      recommendation: "Thermal management is performing perfectly.",
      icon: CheckCircle2,
      severity: 15,
    });
  }

  // 3 · Low efficiency (high irradiance, low output)
  const theoreticalMax = irradiance * 0.01;
  if (irradiance > 500 && power < theoreticalMax * 0.4) {
    list.push({
      id: "efficiency-low",
      type: "critical",
      title: "Low Efficiency Alert",
      description:
        "Strong sunlight detected but power output is critically below expected levels.",
      recommendation: "Inspect for shading, wiring faults, or panel damage.",
      icon: AlertTriangle,
      severity: 90,
    });
  }

  // 4 · High output / optimal performance
  if (irradiance > 600 && power >= theoreticalMax * 0.75) {
    list.push({
      id: "output-high",
      type: "success",
      title: "Optimal Performance",
      description: `Generating at ${((power / theoreticalMax) * 100).toFixed(0)}% of theoretical capacity under strong irradiance.`,
      recommendation: "Excellent — maintain current configuration.",
      icon: TrendingUp,
      severity: 10,
    });
  }

  // 5 · Solar generation outlook
  if (irradiance > 200) {
    list.push({
      id: "prediction-info",
      type: "info",
      title: "Solar Generation Outlook",
      description:
        "Current irradiance trends suggest sustained generation for the next 2 hours.",
      recommendation: "Consider optimising energy storage now.",
      icon: Sun,
      severity: 20,
    });
  }

  // 6 · Active power flow
  if (voltage > 0) {
    list.push({
      id: "system-active",
      type: "success",
      title: "Active Power Flow",
      description:
        "Live energy generation is being successfully routed to the grid / storage.",
      recommendation: "System is healthy and synchronised.",
      icon: Zap,
      severity: 10,
    });
  }

  // 7 · No signal fallback
  if (list.length === 0) {
    list.push({
      id: "no-signal",
      type: "info",
      title: "Awaiting Sensor Data",
      description:
        "All sensor readings are at baseline. The AI engine will generate insights once telemetry arrives.",
      recommendation: "Ensure device is powered and connected.",
      icon: ShieldAlert,
      severity: 5,
    });
  }

  return list;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Pulsing ring around critical icons */
function PulseRing({ color }: { color: string }) {
  return (
    <span
      className={cn(
        "absolute inset-0 rounded-lg animate-ping opacity-30",
        color
      )}
      style={{ animationDuration: "1.8s" }}
    />
  );
}

/** Thin animated severity bar at the bottom of each card */
function SeverityBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-auto">
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
      />
    </div>
  );
}

/** Individual insight card */
function InsightCard({
  insight,
  index,
}: {
  insight: Insight;
  index: number;
}) {
  const p = palette[insight.type];
  const Icon = insight.icon;

  return (
    <motion.div
      key={insight.id}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
      className="h-full"
    >
      <GlassCard
        className={cn(
          "h-full border-l-4 transition-shadow duration-300",
          p.border,
          p.bg,
          insight.type === "critical" && `hover:shadow-lg ${p.glow}`
        )}
      >
        <div className="p-5 flex flex-col h-full gap-3">
          {/* Header row */}
          <div className="flex items-start justify-between">
            {/* Icon with conditional pulse */}
            <div className={cn("relative p-2 rounded-lg", p.iconBg)}>
              {insight.type === "critical" && (
                <PulseRing color={p.iconBg} />
              )}
              <Icon className={cn("h-5 w-5 relative z-10", p.iconText)} />
            </div>

            {/* Badge */}
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-current/30 bg-white/5",
                p.badgeText
              )}
            >
              {p.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white font-bold text-sm leading-snug">
            {insight.title}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-xs leading-relaxed flex-grow">
            {insight.description}
          </p>

          {/* Recommendation */}
          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
              <Info className="h-3 w-3" />
              Recommendation
            </p>
            <p className="text-slate-300 text-xs font-medium">
              {insight.recommendation}
            </p>
          </div>

          {/* Severity bar */}
          <SeverityBar value={insight.severity} color={p.bar} />
        </div>
      </GlassCard>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AIInsightsPanel({ data }: AIInsightsPanelProps) {
  const insights = React.useMemo(() => generateInsights(data), [data]);

  return (
    <div className="flex flex-col gap-6">
      {/* Panel header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-sm" />
          <Sparkles className="relative h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight leading-none">
            AI Solar Insights
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {insights.length} insight{insights.length !== 1 ? "s" : ""} detected
            · real-time analysis
          </p>
        </div>

        {/* Live dot */}
        <div className="ml-auto flex items-center gap-2 text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Live
          </span>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, idx) => (
            <InsightCard key={insight.id && insight.id !== "" ? insight.id : `insight-key-${idx}`} insight={insight} index={idx} />

          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
