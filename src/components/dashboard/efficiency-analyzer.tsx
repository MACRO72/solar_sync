"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { Activity, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EfficiencyAnalyzerProps {
  power: number;
  irradiance: number;
  dustDensity: number;
}

export function EfficiencyAnalyzer({ power, irradiance, dustDensity }: EfficiencyAnalyzerProps) {
  const { efficiency, status, color, explanation } = useMemo(() => {
    // theoreticalPower = lightIndex * panelConstant (using 0.35 per prompt)
    const panelConstant = 0.35;
    const theoreticalMax = irradiance * panelConstant;
    
    // Calculate efficiency
    let efficiencyValue = theoreticalMax > 0 ? (power / theoreticalMax) * 100 : 0;
    efficiencyValue = Math.min(Math.max(efficiencyValue, 0), 100);

    let statusString = "Optimal Performance";
    let colorHex = "#22C55E"; // Green
    let expl = "System is converting sunlight at peak performance.";

    if (efficiencyValue < 40) {
      statusString = "Critical Efficiency";
      colorHex = "#EF4444"; // Red
      expl = "Efficiency heavily reduced. Check for obstructions.";
    } else if (efficiencyValue < 70) {
      statusString = "Reduced Performance";
      colorHex = "#FACC15"; // Yellow
      expl = dustDensity > 100 
        ? "Efficiency slightly reduced due to dust levels." 
        : "Possible thermal throttling or non-optimal light angle.";
    }

    return { 
      efficiency: Math.round(efficiencyValue), 
      status: statusString, 
      color: colorHex,
      explanation: expl
    };
  }, [power, irradiance, dustDensity]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (efficiency / 100) * circumference;

  return (
    <GlassCard className="p-6 bg-[#0B1220]/50 border-white/5 flex flex-col items-center text-center">
      <div className="flex items-center gap-2 mb-6 self-start">
        <Activity className="h-5 w-5 text-[#22D3EE]" />
        <h3 className="text-white font-bold text-lg tracking-tight">Efficiency Analyzer</h3>
      </div>

      <div className="relative w-48 h-48 mb-6">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-white/5"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="96"
            cy="96"
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
            className="drop-shadow-[0_0_8px_rgba(0,255,0,0.3)]"
            style={{ filter: `drop-shadow(0 0 8px ${color}44)` }}
          />
        </svg>
        
        {/* Percentage Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-4xl font-black text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {efficiency}%
          </motion.span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Efficiency</span>
        </div>
      </div>

      <div className="w-full space-y-4">
        <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color }} />
            <span className="text-sm font-bold tracking-tight text-white">{status}</span>
        </div>
        
        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <p className="text-xs text-slate-400 leading-relaxed italic">
               "{explanation}"
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Theo. Max</span>
                <span className="text-sm font-medium text-white">{(irradiance * 0.35).toFixed(1)}W</span>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Actual</span>
                <span className="text-sm font-medium text-[#22D3EE]">{power.toFixed(1)}W</span>
            </div>
        </div>
      </div>
    </GlassCard>
  );
}
