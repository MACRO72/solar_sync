"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, CheckCircle, Info, Wind, Thermometer, Zap, Sun } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  recommendation: string;
  icon: any;
}

interface AIInsightsPanelProps {
  data: {
    voltage: number;
    current: number;
    power: number;
    temperature: number;
    irradiance: number;
    dustDensity: number;
  };
}

export function AIInsightsPanel({ data }: AIInsightsPanelProps) {
  const insights: Insight[] = React.useMemo(() => {
    const list: Insight[] = [];

    // 1. Dust Accumulation Logic
    if (data.dustDensity > 150) {
      list.push({
        id: 'dust-high',
        type: 'warning',
        title: 'Dust Accumulation Detected',
        description: `Current dust density is ${data.dustDensity.toFixed(1)} µg/m³, which is above the optimal threshold.`,
        recommendation: 'Panel cleaning recommended to restore efficiency.',
        icon: Wind
      });
    }

    // 2. Temperature Logic
    if (data.temperature > 45) {
      list.push({
        id: 'temp-high',
        type: 'critical',
        title: 'High Panel Temperature',
        description: `Panel temperature (${data.temperature.toFixed(1)}°C) is above the optimal range for silicon efficiency.`,
        recommendation: 'Consider cooling measures or check for abnormal shading hotspots.',
        icon: Thermometer
      });
    } else if (data.temperature > 15 && data.temperature < 35) {
        list.push({
            id: 'temp-optimal',
            type: 'success',
            title: 'Optimal Temperature',
            description: 'The panel is operating within the ideal temperature range for maximum energy conversion.',
            recommendation: 'System cooling is functioning perfectly.',
            icon: CheckCircle
        });
    }

    // 3. Efficiency Logic (Light high but power low)
    const theoreticalMax = data.irradiance * 0.01; // Mock theoretical max
    if (data.irradiance > 500 && data.power < theoreticalMax * 0.4) {
      list.push({
        id: 'efficiency-low',
        type: 'critical',
        title: 'Low Power Generation Alert',
        description: 'Sunlight levels are high, but power output is significantly below expected levels.',
        recommendation: 'Check for heavy shading, circuit disconnection, or panel damage.',
        icon: AlertTriangle
      });
    }

    // 4. Future Prediction Insight
    if (data.irradiance > 200) {
        list.push({
            id: 'prediction-info',
            type: 'info',
            title: 'Solar Generation Outlook',
            description: 'Current light trends suggest sustained generation for the next 2 hours.',
            recommendation: 'Energy storage may be optimized now.',
            icon: Sun
        });
    }

    // 5. System Health
    if (data.voltage > 0) {
        list.push({
            id: 'system-active',
            type: 'success',
            title: 'Active Power Flow',
            description: 'Live energy generation is being successfully pushed to the grid/storage.',
            recommendation: 'System is healthy and synchronized.',
            icon: Zap
        });
    }

    return list;
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-5 w-5 text-[#FACC15]" />
        <h2 className="text-xl font-bold text-white tracking-tight">AI Solar Insights</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, idx) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ delay: idx * 0.1, duration: 0.4, ease: "easeOut" }}
            >
              <GlassCard className={cn(
                "h-full transition-all duration-300 border-l-4",
                insight.type === 'critical' ? "border-l-destructive/80 bg-destructive/5" :
                insight.type === 'warning' ? "border-l-[#FACC15]/80 bg-[#FACC15]/5" :
                insight.type === 'success' ? "border-l-[#22C55E]/80 bg-[#22C55E]/5" :
                "border-l-[#22D3EE]/80 bg-[#22D3EE]/5"
              )}>
                <div className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      insight.type === 'critical' ? "bg-destructive/10 text-destructive" :
                      insight.type === 'warning' ? "bg-[#FACC15]/10 text-[#FACC15]" :
                      insight.type === 'success' ? "bg-[#22C55E]/10 text-[#22C55E]" :
                      "bg-[#22D3EE]/10 text-[#22D3EE]"
                    )}>
                      <insight.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[10px] uppercase tracking-wider px-1.5 py-0 border-none",
                      insight.type === 'critical' ? "text-destructive" :
                      insight.type === 'warning' ? "text-[#FACC15]" :
                      insight.type === 'success' ? "text-[#22C55E]" :
                      "text-[#22D3EE]"
                    )}>
                      {insight.type}
                    </Badge>
                  </div>
                  
                  <h3 className="text-white font-bold mb-1">{insight.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4 flex-grow">
                    {insight.description}
                  </p>
                  
                  <div className="mt-auto pt-3 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Recommendation
                    </p>
                    <p className="text-slate-300 text-xs font-medium">
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: string }) {
    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
            {children}
        </span>
    )
}
