'use client';

import * as React from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { GlassCard, CardHeader, CardTitle, CardContent } from '@/components/glass-card';
import { cn } from '@/lib/utils';
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { X, LucideIcon } from 'lucide-react';
import type { MetricKey } from '@/lib/types';


/** Parse the numeric portion and unit suffix from a value string like "3.14 V" */
function parseValue(val: string | number): { num: number | null; prefix: string; suffix: string } {
  const str = String(val);
  // Match: optional leading sign, digits, optional decimal, then whatever follows
  const match = str.match(/^([^\d-]*)(-?\d+\.?\d*)(.*)$/);
  if (!match) return { num: null, prefix: '', suffix: str };
  return { num: parseFloat(match[2]), prefix: match[1], suffix: match[3] };
}

/** Animated number that counts up from 0 on mount, then springs to new values */
function AnimatedNumber({ value, decimals }: { value: number; decimals: number }) {
  const spring = useSpring(0, { stiffness: 80, damping: 18, mass: 0.8 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));

  React.useEffect(() => { spring.set(value); }, [spring, value]);
  return <motion.span>{display}</motion.span>;
}

/** Renders value with count-up if numeric, or plain text otherwise */
function AnimatedValue({ value, className }: { value: string | number; className?: string }) {
  const { num, prefix, suffix } = React.useMemo(() => parseValue(value), [value]);
  const decimals = React.useMemo(() => {
    if (num === null) return 0;
    const d = String(num).split('.')[1];
    return d ? d.length : 0;
  }, [num]);

  if (num === null) return <span className={className}>{value}</span>;
  return (
    <span className={className}>
      {prefix}
      <AnimatedNumber value={num} decimals={decimals} />
      {suffix}
    </span>
  );
}

interface MetricData {
  time: string;
  value: number;
}

interface ParallaxChartTileProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  iconColor: string;
  metricKey: MetricKey;
  chartColor: string;
  unit: string;
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  animationDelay?: number;
}

export function ParallaxChartTile({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  metricKey,
  chartColor,
  unit,
  isExpanded,
  onExpand,
  onCollapse,
  animationDelay = 0,
}: ParallaxChartTileProps) {
  const { data: devices, loading } = useRealtimeData();

  // Process data for the chart only when expanded to save performance, 
  // though we have it locally anyway
  const chartData = React.useMemo(() => {
    if (!devices || devices.length === 0 || !isExpanded) return [];
    
    // Get last 20 data points for a smooth sparkline look
    const recentDevices = [...devices].slice(0, 20).reverse();
    
    return recentDevices.map(device => {
      let deviceDate: Date;
      if (device.lastSeen.includes('T')) {
        deviceDate = new Date(device.lastSeen);
      } else {
        const [h, m, s] = device.lastSeen.split(':').map(Number);
        deviceDate = new Date();
        deviceDate.setHours(h, m, s, 0);
      }

      return {
        time: format(deviceDate, 'HH:mm:ss'),
        value: device[metricKey] ?? 0,
      };
    });
  }, [devices, metricKey, isExpanded]);

  const config = {
    value: { label: title, color: chartColor },
  } satisfies ChartConfig;

  // Get thematic animation variants for the graph container based on metric topic
  const getGraphAnimation = (key: MetricKey) => {
    const base = {
      exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }
    };

    switch (key) {
      case 'voltage':
        // Fast, snappy "zap" from above
        return {
          ...base,
          initial: { opacity: 0, height: 0, marginTop: 0, y: -40, scale: 0.95 },
          animate: { opacity: 1, height: '100%', marginTop: 24, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 15 } }
        };
      case 'current':
        // Flowing fluid motion from the side
        return {
          ...base,
          initial: { opacity: 0, height: 0, marginTop: 0, x: -50 },
          animate: { opacity: 1, height: '100%', marginTop: 24, x: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
        };
      case 'power':
        // Explosive outward pop
        return {
          ...base,
          initial: { opacity: 0, height: 0, marginTop: 0, scale: 0.7 },
          animate: { opacity: 1, height: '100%', marginTop: 24, scale: 1, transition: { type: 'spring', bounce: 0.5, duration: 0.6 } }
        };
      case 'temperature':
        // Rising heat motion from below
        return {
          ...base,
          initial: { opacity: 0, height: 0, marginTop: 0, y: 50 },
          animate: { opacity: 1, height: '100%', marginTop: 24, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
        };
      case 'irradiance':
        // Bright radiant expansion (using scale and intense easing)
        return {
          ...base,
          initial: { opacity: 0, height: 0, marginTop: 0, scale: 0.8, filter: 'brightness(2)' },
          animate: { opacity: 1, height: '100%', marginTop: 24, scale: 1, filter: 'brightness(1)', transition: { duration: 0.5 } }
        };
      case 'dustDensity':
        // Scattered settling particles (slight rotation and diagonal slide)
        return {
          ...base,
          initial: { opacity: 0, height: 0, marginTop: 0, x: 30, y: -30, rotate: 3 },
          animate: { opacity: 1, height: '100%', marginTop: 24, x: 0, y: 0, rotate: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
        };
      default:
        // Standard fade/grow
        return {
          ...base,
          initial: { opacity: 0, height: 0, marginTop: 0 },
          animate: { opacity: 1, height: '100%', marginTop: 24, transition: { duration: 0.3 } }
        };
    }
  };

  const graphAnim = getGraphAnimation(metricKey);

  // Spring animation transition for the main tile expansion (keep snappy)
  const transition = { type: 'spring', bounce: 0.1, duration: 0.6 };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1, // Disable pop-out scale to allow clean grid flow
      }}
      transition={{ ...transition, delay: animationDelay }}
      style={{
         zIndex: isExpanded ? 50 : 1,
         // By spanning the entire grid row/columns, it stays in the flow of the document
         // instead of jumping to a 'fixed' modal layout.
         gridColumn: isExpanded ? '1 / -1' : 'auto',
         gridRow: isExpanded ? 'span 2' : 'auto',
         minHeight: isExpanded ? '450px' : '100%',
      }}
      className={cn(
        "cursor-pointer group",
        isExpanded && "cursor-default"
      )}
      onClick={!isExpanded ? onExpand : undefined}
    >
      <GlassCard 
        className={cn(
            "h-full w-full overflow-hidden transition-all duration-300",
            !isExpanded ? "hover:shadow-lg hover:-translate-y-1 hover:border-primary/30" 
                        : "shadow-2xl border border-slate-700 bg-[#0B1220] !bg-opacity-100 !backdrop-blur-none z-50 rounded-2xl" 
        )}
      >
        <motion.div layout className="flex flex-col h-full p-6">
            <motion.div layout className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    <motion.div layoutId={`icon-${title}`} className="p-2 rounded-lg bg-black/30 ring-1 ring-white/10">
                     <Icon className={cn("h-6 w-6 stroke-[1.5]", isExpanded ? "text-white" : iconColor)} />
                    </motion.div>
                    <motion.h3 layoutId={`title-${title}`} className={cn("text-sm font-medium tracking-tight", isExpanded && "text-white")}>
                        {title}
                    </motion.h3>
                </div>
                {isExpanded && (
                    <motion.button 
                     initial={{ opacity: 0, scale: 0.8 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.8 }}
                     onClick={(e) => { e.stopPropagation(); onCollapse(); }}
                     className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#E5E7EB] transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </motion.button>
                )}
            </motion.div>
            
            <motion.div layout className={cn("flex flex-col", isExpanded ? "mt-4 mb-4 items-center" : "mt-2")}>
                <motion.div
                  layoutId={`val-${title}`}
                  className={cn("font-bold tracking-tight", isExpanded ? "text-5xl text-white drop-shadow-md" : "text-3xl")}
                >
                  <AnimatedValue value={value} />
                </motion.div>
                <AnimatePresence>
                    {!isExpanded && (
                        <motion.p 
                            layoutId={`change-${title}`} 
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-muted-foreground mt-1"
                        >
                            {change}
                        </motion.p>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={graphAnim.initial}
                        animate={graphAnim.animate}
                        exit={graphAnim.exit}
                        className="flex-1 w-full relative min-h-[200px]"
                    >
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Skeleton className="h-full w-full rounded-xl opacity-10 bg-white" />
                            </div>
                        ) : (
                                <ChartContainer config={config} className="h-full w-full">
                                    <AreaChart data={chartData} margin={{ top: 30, right: 30, bottom: 20, left: 10 }}>
                                        <defs>
                                            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={chartColor} stopOpacity={0.25}/>
                                                <stop offset="95%" stopColor={chartColor} stopOpacity={0.05}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />
                                        <XAxis 
                                            dataKey="time" 
                                            tickLine={false} 
                                            tickMargin={12} 
                                            axisLine={{ stroke: '#ffffff', strokeOpacity: 0.25 }}
                                            tick={{ fill: '#E5E7EB', fontSize: 14, fontWeight: 600 }} 
                                            minTickGap={30}
                                        />
                                        <YAxis 
                                            domain={['auto', 'auto']} 
                                            tickLine={false} 
                                            axisLine={{ stroke: '#ffffff', strokeOpacity: 0.25 }}
                                            tickMargin={12} 
                                            unit={unit} 
                                            tick={{ fill: '#E5E7EB', fontSize: 14, fontWeight: 600 }}
                                            padding={{ top: 30, bottom: 30 }}
                                        />
                                        <ChartTooltip cursor={{ stroke: chartColor, strokeWidth: 1, strokeDasharray: '3 3', strokeOpacity: 0.5 }} content={<ChartTooltipContent indicator="line" className="bg-[#0B1220] shadow-2xl border border-slate-700 text-white font-semibold" />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="value" 
                                            stroke={chartColor} 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill={`url(#gradient-${title})`} 
                                            animationDuration={1500}
                                            animationEasing="ease-out"
                                            dot={{ r: 6, fill: '#ffffff', stroke: chartColor, strokeWidth: 3 }}
                                            activeDot={{ r: 10, fill: '#ffffff', stroke: chartColor, strokeWidth: 4 }}
                                        />
                                    </AreaChart>
                                </ChartContainer>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
      </GlassCard>
      
    </motion.div>
  );
}
