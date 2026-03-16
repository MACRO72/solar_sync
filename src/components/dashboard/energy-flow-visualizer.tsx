"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Battery, Zap, LayoutPanelTop, ArrowRight, ArrowDown } from 'lucide-react';
import { GlassCard } from '@/components/glass-card';

interface EnergyFlowVisualizerProps {
  power: number;
}

export function EnergyFlowVisualizer({ power }: EnergyFlowVisualizerProps) {
  const maxPower = 10; // Normalizing for particle speed
  const particleSpeed = Math.max(0.5, (power / maxPower) * 3);
  const particleCount = Math.min(15, Math.max(3, Math.floor(power * 2)));

  const flowVariants = {
    animate: {
      x: [0, 100],
      opacity: [0, 1, 0],
      transition: {
        x: { repeat: Infinity, duration: 2 / particleSpeed, ease: "linear" },
        opacity: { repeat: Infinity, duration: 2 / particleSpeed, ease: "linear", times: [0, 0.5, 1] }
      }
    }
  };

  return (
    <GlassCard className="p-8 bg-[#0B1220]/50 border-white/5 w-full overflow-hidden">
      <div className="flex items-center gap-2 mb-10">
        <Zap className="h-5 w-5 text-[#22D3EE]" />
        <h3 className="text-white font-bold text-lg tracking-tight">Energy Flow Story</h3>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 max-w-4xl mx-auto py-10">
        
        {/* Step 1: Sunlight */}
        <div className="flex flex-col items-center gap-4 relative z-10 w-32">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: 360 }}
            transition={{ scale: { repeat: Infinity, duration: 3 }, rotate: { repeat: Infinity, duration: 20, ease: "linear" } }}
            className="p-4 bg-[#FACC15]/20 rounded-full border border-[#FACC15]/30 text-[#FACC15] shadow-[0_0_20px_rgba(250,204,21,0.2)]"
          >
            <Sun size={40} strokeWidth={1.5} />
          </motion.div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sunlight</span>
        </div>

        {/* Path 1: Sun to Panel */}
        <div className="flex-1 h-px md:h-0.5 bg-gradient-to-r from-[#FACC15]/20 to-[#22D3EE]/20 relative min-w-[60px] md:min-w-[100px]">
           {Array.from({ length: 4 }).map((_, i) => (
             <motion.div
               key={`sun-to-panel-${i}`}
               className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-[#FACC15] blur-[2px]"
               initial={{ x: 0, opacity: 0 }}
               animate={{ x: "100%", opacity: [0, 1, 0] }}
               transition={{ repeat: Infinity, duration: 2, delay: i * 0.5, ease: "linear" }}
             />
           ))}
        </div>

        {/* Step 2: Solar Panel */}
        <div className="flex flex-col items-center gap-4 relative z-10 w-32">
          <motion.div 
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="p-4 bg-[#22D3EE]/10 rounded-xl border border-[#22D3EE]/20 text-[#22D3EE] shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          >
            <LayoutPanelTop size={40} strokeWidth={1.5} />
          </motion.div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Solar Panel</span>
        </div>

        {/* Path 2: Panel to Battery */}
        <div className="flex-1 h-px md:h-0.5 bg-gradient-to-r from-[#22D3EE]/20 to-[#22C55E]/20 relative min-w-[60px] md:min-w-[100px]">
           {Array.from({ length: particleCount }).map((_, i) => (
             <motion.div
               key={`panel-to-battery-${i}`}
               className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-[#22D3EE] blur-[1px] shadow-[0_0_8px_#22D3EE]"
               initial={{ x: 0, opacity: 0 }}
               animate={{ x: "100%", opacity: [0, 1, 0] }}
               transition={{ repeat: Infinity, duration: 2 / particleSpeed, delay: i * (0.5 / particleSpeed), ease: "linear" }}
             />
           ))}
        </div>

        {/* Step 3: Battery */}
        <div className="flex flex-col items-center gap-4 relative z-10 w-32">
          <motion.div 
            animate={{ scale: power > 0 ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="p-4 bg-[#22C55E]/10 rounded-full border border-[#22C55E]/20 text-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.1)]"
          >
            <Battery size={40} strokeWidth={1.5} />
          </motion.div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Energy Generation</span>
        </div>

        {/* Path 3: Battery to Output */}
        <div className="flex-1 h-px md:h-0.5 bg-gradient-to-r from-[#22C55E]/20 to-transparent relative min-w-[60px] md:min-w-[100px]">
           {Array.from({ length: 3 }).map((_, i) => (
             <motion.div
               key={`battery-to-output-${i}`}
               className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-white/40 blur-[2px]"
               initial={{ x: 0, opacity: 0 }}
               animate={{ x: "100%", opacity: [0, 1, 0] }}
               transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5, ease: "linear" }}
             />
           ))}
        </div>

        {/* Step 4: System Output */}
        <div className="flex flex-col items-center gap-4 relative z-10 w-32">
           <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-white/40">
              <Zap size={40} strokeWidth={1.5} />
           </div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">System Output</span>
        </div>

      </div>

      <div className="mt-12 pt-6 border-t border-white/5 flex flex-wrap gap-8 justify-center">
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#FACC15] blur-[1px]"></div>
            <span className="text-xs text-slate-400">Photon Intensity</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#22D3EE] blur-[1px] shadow-[0_0_5px_#22D3EE]"></div>
            <span className="text-xs text-slate-400">Energy Electrons</span>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#22C55E] blur-[1px]"></div>
            <span className="text-xs text-slate-400">Captured Power</span>
        </div>
      </div>
    </GlassCard>
  );
}
