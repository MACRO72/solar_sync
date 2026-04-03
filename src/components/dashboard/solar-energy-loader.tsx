"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

export function SolarEnergyLoader() {
  const [time, setTime] = useState(0);
  const duration = 3000;

  const statusMessages = [
    "Connecting to Solar Sensors...",
    "Initializing AI Intelligence...",
    "Synchronizing Grid Data...",
    "Optimizing Energy Insights...",
    "System Ready"
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newTime = Math.min(elapsed / duration, 1);
      setTime(newTime);
      
      if (newTime >= 1) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Derive status index directly from time to avoid effect loops
  const statusIndex = Math.min(
    Math.floor(time * (statusMessages.length - 1)), 
    statusMessages.length - 1
  );

  // Background Star Field (Memoized for performance)
  const stars = useMemo(() => 
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: 2 + Math.random() * 3
    }))
  , []);

  // 1. Sun Position & Intensity
  const sunPosition = time; 
  const solarIntensity = Math.max(0, Math.sin(Math.PI * sunPosition)); 

  // 2. Battery Progress (Cubic S-Curve for Slow-Fast-Slow dynamics)
  const progress = sunPosition < 0.5 
    ? (4 * Math.pow(sunPosition, 3)) * 100 
    : (1 - Math.pow(-2 * sunPosition + 2, 3) / 2) * 100;

  // Sun Path Path for the Sky Area
  const sunX = `${-20 + sunPosition * 140}%`;
  const sunY = (-(Math.pow((sunPosition * 100) - 50, 2)) / 25) + 100;

  const isCollecting = solarIntensity > 0.05;
  const glowSize = 40 + solarIntensity * 80;
  const haloScale = 0.8 + solarIntensity * 0.5;

  return (
    <motion.div
      key="solar-energy-loader-premium"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050b1a] overflow-hidden"
    >
      {/* 1. Cinematic Ambient Environment */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[#050b1a]" />
        
        {/* Dynamic Atmospheric Glows */}
        <motion.div
          animate={{ 
            x: [0, 50, -50, 0], 
            y: [0, 30, -30, 0],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#FFC800] blur-[120px] pointer-events-none"
          style={{ opacity: 0.15 }}
        />
        
        <motion.div
          animate={{ 
            x: [0, -40, 40, 0], 
            y: [0, -50, 50, 0],
            opacity: [0.08, 0.12, 0.08] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-[#00B4FF] blur-[120px] pointer-events-none"
          style={{ opacity: 0.12 }}
        />

        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[50%] h-[40%] rounded-full bg-[#00FF78] blur-[100px] pointer-events-none"
        />
        
        {/* Star Field */}
        <div className="absolute inset-0 z-10">
          {stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{ 
                left: `${star.x}%`, 
                top: `${star.y}%`, 
                width: star.size, 
                height: star.size,
                opacity: 0.2
              }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: star.duration }}
            />
          ))}
        </div>

        {/* Dynamic Sky Gradient (Sync with Sun) */}
        <div 
          className="absolute inset-0 z-20 transition-opacity duration-1000"
          style={{ 
            background: `radial-gradient(circle at ${sunX} ${100 - sunY}%, rgba(250, 204, 21, ${0.08 * solarIntensity}), transparent 70%)`,
          }}
        />
      </div>

      {/* 2. Top Sky Area (Sun Animation) */}
      <div className="absolute top-0 left-0 w-full h-48 pointer-events-none z-50 overflow-visible">
        <motion.div
          className="absolute rounded-full bg-gradient-to-br from-[#FACC15] to-[#F59E0B] flex items-center justify-center shadow-[0_0_60px_rgba(250,204,21,0.6)]"
          style={{ 
            left: sunX, 
            top: `${100 - sunY}%`,
            width: 72,
            height: 72,
            boxShadow: `0 0 ${glowSize}px rgba(250, 204, 21, ${0.5 + solarIntensity * 0.5})`
          }}
          transition={{ ease: "linear" }}
        >
          <div className="w-14 h-14 rounded-full border border-white/30 shadow-inner" />
          
          <AnimatePresence>
            {isCollecting && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <motion.div
                   animate={{ 
                     opacity: [0.3 * solarIntensity, 0.6 * solarIntensity, 0.3 * solarIntensity],
                     scale: haloScale 
                   }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute w-[280%] h-[280%] rounded-full bg-[#FACC15]/30 blur-2xl"
                 />
                 <motion.div
                   animate={{ 
                     opacity: [0.1 * solarIntensity, 0.25 * solarIntensity, 0.1 * solarIntensity],
                     scale: haloScale * 2 
                   }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                   className="absolute w-[400%] h-[400%] rounded-full bg-[#FACC15]/15 blur-3xl"
                 />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center w-full max-w-xl p-8 mt-40 bg-white/[0.03] backdrop-blur-3xl rounded-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]"
      >
        {/* Branding & Status */}
        <div className="flex flex-col items-center text-center mb-6 w-full">
          <motion.h1 
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            className="text-white font-black text-2xl tracking-[0.4em] uppercase drop-shadow-lg"
          >
            Solar Panel Efficiency Optimizer
          </motion.h1>
          <span className="text-white/40 text-[10px] uppercase tracking-[0.6em] font-bold mt-2">
            Initializing Solar AI System
          </span>
          <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-4" />
          
          <AnimatePresence mode="wait">
            <motion.p
              key={statusMessages[statusIndex]}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[#FACC15] text-xs font-mono font-bold tracking-widest uppercase italic"
            >
              {statusMessages[statusIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Realistic 3D Panel */}
        <motion.div 
            initial={{ rotateX: 65 }}
            animate={{ rotateX: 45 }}
            className="w-80 h-40 relative preserve-3d mb-6 pointer-events-none"
        >
            <div className="absolute -inset-1.5 bg-gradient-to-br from-slate-500/50 via-slate-700/50 to-slate-200/50 rounded-lg blur-[1px]" />
            <div className="absolute inset-0 bg-[#020617] rounded shadow-2xl overflow-hidden grid grid-cols-6 grid-rows-4 gap-[2px] p-1.5 border border-white/10">
                {[...Array(24)].map((_, i) => (
                    <div key={`cell-${i}`} className="bg-[#0f172a] rounded-[1px] relative overflow-hidden">
                        <div className="absolute inset-y-0 left-1/2 w-[1px] bg-white/10" />
                        <motion.div 
                            animate={{ x: ["-100%", "300%"] }}
                            transition={{ repeat: Infinity, duration: 4 / (0.5 + solarIntensity), delay: i * 0.1 }}
                            className="absolute inset-x-0 h-full w-2 bg-white/5 -skew-x-12"
                        />
                        {isCollecting && (
                           <motion.div 
                             animate={{ opacity: 0.4 * Math.pow(solarIntensity, 2) }} 
                             className="absolute inset-0 bg-[#FACC15] blur-sm" 
                           />
                        )}
                    </div>
                ))}
            </div>
            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl -z-10 rounded-full" />
        </motion.div>

        {/* Energy Flow (Cinematic Plasma Stream) */}
        <div className="relative h-20 w-full flex justify-center mb-4 overflow-visible">
            {isCollecting && (
                <div className="relative w-full h-full flex justify-center">
                    {/* 1. Main Plasma Core (Glow) */}
                    <motion.div 
                        animate={{ 
                            height: ["0%", "100%"],
                            opacity: [0, 0.3 * solarIntensity, 0] 
                        }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="absolute w-2 bg-gradient-to-b from-[#FACC15] to-[#22C55E] blur-md rounded-full"
                    />

                    {/* 2. Randomized Electrical Pulsations */}
                    {Array.from({ length: 15 }).map((_, i) => (
                        <motion.div
                            key={`photon-${i}`}
                            className="absolute w-[2px] h-4 rounded-full bg-white opacity-80 blur-[0.5px]"
                            initial={{ y: -10, x: (Math.random() - 0.5) * 40, opacity: 0 }}
                            animate={{ 
                              y: 112, 
                              opacity: [0, 1, 1, 0],
                              scaleY: [1, 2, 1]
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1 / (0.8 + solarIntensity * 1.5), 
                              delay: i * 0.1,
                              ease: "easeIn" 
                            }}
                        />
                    ))}

                    {/* 3. Traveling Energy Arcs (Zap Icons) */}
                    {Array.from({ length: 3 }).map((_, i) => (
                        <motion.div
                            key={`zap-${i}`}
                            className="absolute text-[#FACC15]"
                            initial={{ y: -20, opacity: 0, scale: 0.5 }}
                            animate={{ 
                                y: 100,
                                opacity: [0, 1, 0],
                                scale: [0.5, 1, 0.5],
                                rotate: [0, 45, -45, 0]
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 1.5, 
                                delay: i * 0.5,
                                ease: "linear"
                            }}
                        >
                            <Zap size={14} fill="currentColor" className="blur-[0.5px]" />
                        </motion.div>
                    ))}

                    {/* 4. Ambient Steam Glow */}
                    <motion.div 
                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="absolute inset-0 bg-gradient-to-b from-[#FACC15]/20 to-transparent blur-3xl pointer-events-none"
                    />
                </div>
            )}
        </div>

        {/* Battery Module (High-Polished) */}
        <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
            <div className="relative w-full h-14 flex items-center">
                  <div className="flex-1 h-full bg-black/40 rounded-xl border border-white/10 p-1.5 relative overflow-hidden">
                     <motion.div 
                        style={{ width: `${progress}%` }}
                        className={`h-full rounded-lg bg-gradient-to-r from-green-700 via-green-500 to-green-400 relative ${progress > 80 ? 'shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''}`}
                     >
                        {progress > 80 && (
                          <motion.div
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-0 bg-white rounded-lg"
                          />
                        )}
                     </motion.div>
                     <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-sm font-black text-white drop-shadow-md font-mono tracking-widest">
                             {progress.toFixed(0)}<span className="text-[10px] opacity-60 ml-0.5">%</span>
                         </span>
                     </div>
                 </div>
                 <div className="w-3 h-7 bg-white/10 rounded-r-md border-y border-r border-white/10 ml-[1px]" />
            </div>

            <div className="grid grid-cols-2 gap-10 w-full px-4">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase mb-1">Status</span>
                    <span className="text-[10px] font-bold text-[#22D3EE] uppercase">Active Charging</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-white/30 tracking-[0.3em] uppercase mb-1">Live Feed</span>
                    <span className="text-[10px] font-mono font-bold text-[#FACC15]">
                        {((solarIntensity * 4) + Math.random()).toFixed(2)}W
                    </span>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Subtle Bottom Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="absolute bottom-6 flex items-center gap-2 group"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
        <span className="text-[8px] font-bold text-white uppercase tracking-[0.4em]">
          Powered by DeepMind Solar AI
        </span>
      </motion.div>
    </motion.div>
  );
}
