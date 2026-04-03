"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Wind,
  Zap,
  Sparkles,
  RefreshCcw,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type SummaryLevel = "optimal" | "warning" | "critical" | "idle";

interface BannerData {
  power: number;
  temperature: number;
  irradiance: number;
  dustDensity: number;
  /** Raw efficiency 0–100 */
  efficiency?: number;
}

interface SystemSummaryBannerProps {
  data: BannerData | null | undefined;
  userName?: string;
  /** Called when "Run AI Analysis" action fires */
  onAnalysis?: () => void;
}

// ─── Summary logic (pure, no backend) ────────────────────────────────────────

function computeEfficiency(power: number, irradiance: number): number {
  const theoretical = irradiance * 0.35;
  if (theoretical <= 0) return 0;
  return Math.min((power / theoretical) * 100, 100);
}

interface Summary {
  level: SummaryLevel;
  headline: string;
  sub: string;
  Icon: React.FC<{ className?: string }>;
}

function buildSummary(d: BannerData): Summary {
  const eff =
    d.efficiency != null ? d.efficiency : computeEfficiency(d.power, d.irradiance);
  const isDust = d.dustDensity > 150;
  const isOverheat = d.temperature > 50;
  const isLowEff = eff < 45 && d.irradiance > 300;
  const isOptimal = eff >= 75 && !isDust && d.temperature < 45;
  const isIdle = d.power === 0 && d.irradiance < 50;

  if (isIdle) {
    return {
      level: "idle",
      headline: "System idle — awaiting sunlight.",
      sub: "No generation detected. Standby mode active.",
      Icon: Zap,
    };
  }
  if (isOverheat && isLowEff) {
    return {
      level: "critical",
      headline: `Critical: Overheating at ${d.temperature.toFixed(1)}°C and low output.`,
      sub: "Efficiency severely impacted. Immediate cooling + inspection required.",
      Icon: AlertTriangle,
    };
  }
  if (isOverheat) {
    return {
      level: "critical",
      headline: `High temperature detected — ${d.temperature.toFixed(1)}°C.`,
      sub: "Panel overheating risk. Efficiency may drop significantly.",
      Icon: Thermometer,
    };
  }
  if (isDust && isLowEff) {
    return {
      level: "warning",
      headline: `Dust accumulation detected. System at ${eff.toFixed(0)}% efficiency.`,
      sub: "Cleaning recommended soon to restore optimal output.",
      Icon: Wind,
    };
  }
  if (isLowEff) {
    return {
      level: "warning",
      headline: `Output below expected — running at ${eff.toFixed(0)}% efficiency.`,
      sub: "Check for shading, wiring faults, or panel obstruction.",
      Icon: AlertTriangle,
    };
  }
  if (isDust) {
    return {
      level: "warning",
      headline: "Dust accumulation detected. Cleaning recommended soon.",
      sub: `Dust density at ${d.dustDensity.toFixed(0)} µg/m³ — minor efficiency loss.`,
      Icon: Wind,
    };
  }
  if (isOptimal) {
    return {
      level: "optimal",
      headline: `Optimal conditions. System operating at ${eff.toFixed(0)}% efficiency.`,
      sub: "Output is stable. Environmental factors are within ideal range.",
      Icon: CheckCircle2,
    };
  }
  return {
    level: "optimal",
    headline: `System generating ${d.power.toFixed(1)} W — conditions are good.`,
    sub: `Efficiency ${eff.toFixed(0)}%. Monitor dust and temperature for best performance.`,
    Icon: TrendingUp,
  };
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const palette: Record<
  SummaryLevel,
  { border: string; glow: string; iconBg: string; iconText: string; badge: string }
> = {
  optimal: {
    border: "border-emerald-500/30",
    glow: "shadow-emerald-500/10",
    iconBg: "bg-emerald-500/10",
    iconText: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  warning: {
    border: "border-yellow-400/30",
    glow: "shadow-yellow-400/10",
    iconBg: "bg-yellow-400/10",
    iconText: "text-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  },
  critical: {
    border: "border-rose-500/30",
    glow: "shadow-rose-500/10",
    iconBg: "bg-rose-500/10",
    iconText: "text-rose-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
  idle: {
    border: "border-slate-600/30",
    glow: "shadow-slate-600/10",
    iconBg: "bg-slate-600/10",
    iconText: "text-slate-400",
    badge: "bg-slate-700/30 text-slate-400 border-slate-600/20",
  },
};

const levelLabel: Record<SummaryLevel, string> = {
  optimal: "All Systems Nominal",
  warning: "Attention Required",
  critical: "Action Required",
  idle: "System Idle",
};

// ─── Action button states ─────────────────────────────────────────────────────

type ActionState = "idle" | "loading" | "success";

interface ActionButtonProps {
  id: string;
  label: string;
  successLabel: string;
  icon: React.FC<{ className?: string }>;
  successIcon: React.FC<{ className?: string }>;
  state: ActionState;
  onClick: () => void;
  accent: string;
}

function ActionButton({
  id,
  label,
  successLabel,
  icon: Icon,
  successIcon: SuccessIcon,
  state,
  onClick,
  accent,
}: ActionButtonProps) {
  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <motion.button
      id={id}
      onClick={onClick}
      disabled={isLoading}
      whileHover={state === "idle" ? { scale: 1.04, y: -2 } : {}}
      whileTap={state === "idle" ? { scale: 0.96 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest",
        "border transition-all duration-300 overflow-hidden cursor-pointer",
        "disabled:cursor-not-allowed",
        accent
      )}
    >
      {/* Ripple shimmer on success */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          </motion.span>
        ) : isSuccess ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessIcon className="h-3.5 w-3.5" />
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Icon className="h-3.5 w-3.5" />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? "Working…" : isSuccess ? successLabel : label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export const SystemSummaryBanner = React.memo(function SystemSummaryBanner({
  data,
  userName,
  onAnalysis,
}: SystemSummaryBannerProps) {
  const [analysisState, setAnalysisState] = useState<ActionState>("idle");

  const summary = useMemo(
    () =>
      data
        ? buildSummary(data)
        : ({
            level: "idle",
            headline: "Awaiting sensor data…",
            sub: "Connect a device to see live system summary.",
            Icon: Zap,
          } satisfies Summary),
    [data]
  );

  const p = palette[summary.level];
  const SummaryIcon = summary.Icon;

  // ── Action handlers ──────────────────────────────────────────────────────

  const handleAnalysis = useCallback(() => {
    if (analysisState !== "idle") return;
    setAnalysisState("loading");
    const timeout = 1400 + Math.random() * 600; // 1.4–2 s
    setTimeout(() => {
      setAnalysisState("success");
      onAnalysis?.();
      setTimeout(() => setAnalysisState("idle"), 2500);
    }, timeout);
  }, [analysisState, onAnalysis]);

  return (
    <motion.div
      key={summary.level}
      initial={{ opacity: 0, y: -20, scaleY: 0.9 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 22 }}
      className={cn(
        "w-full rounded-2xl border backdrop-blur-md",
        "bg-[#0B1220]/80 shadow-2xl",
        p.border,
        p.glow,
        "shadow-lg"
      )}
      style={{
        boxShadow: `0 0 40px -8px var(--tw-shadow-color), 0 4px 24px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Gradient tint strip at top */}
      <div
        className={cn(
          "h-0.5 w-full rounded-t-2xl",
          summary.level === "optimal"
            ? "bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent"
            : summary.level === "warning"
            ? "bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"
            : summary.level === "critical"
            ? "bg-gradient-to-r from-transparent via-rose-500/60 to-transparent"
            : "bg-gradient-to-r from-transparent via-slate-500/30 to-transparent"
        )}
      />

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4">
        {/* User Greeting */}
        {userName && (
          <div className="flex flex-col shrink-0 border-r border-slate-700/50 pr-4 hidden lg:flex">
             <span className="text-[10px] font-black uppercase tracking-widest text-[#22D3EE]/70">Welcome back,</span>
             <span className="text-sm font-bold text-white truncate max-w-[120px]">{userName}</span>
          </div>
        )}

        {/* Icon + badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={cn("p-2.5 rounded-xl", p.iconBg)}>
            <SummaryIcon className={cn("h-5 w-5", p.iconText)} />
          </div>
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
              p.badge
            )}
          >
            {levelLabel[summary.level]}
          </span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={summary.headline}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold text-sm leading-snug truncate"
            >
              {summary.headline}
            </motion.p>
          </AnimatePresence>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed line-clamp-1">
            {summary.sub}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <ActionButton
            id="btn-run-ai-analysis"
            label="Run AI Analysis"
            successLabel="Analysis Done"
            icon={Sparkles}
            successIcon={CheckCircle2}
            state={analysisState}
            onClick={handleAnalysis}
            accent={cn(
              "bg-violet-500/10 border-violet-500/30 text-violet-300",
              "hover:bg-violet-500/20 hover:border-violet-400/50 hover:text-violet-200"
            )}
          />
        </div>
      </div>
    </motion.div>
  );
});
SystemSummaryBanner.displayName = "SystemSummaryBanner";
