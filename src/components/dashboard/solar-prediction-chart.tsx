"use client";

import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  ReferenceLine
} from 'recharts';
import { format, addHours, parseISO } from 'date-fns';
import { GlassCard } from '@/components/glass-card';
import { TrendingUp, Clock } from 'lucide-react';

interface DataPoint {
  timestamp: string;
  power: number;
  type: 'historical' | 'predicted';
}

interface SolarPredictionChartProps {
  historicalData: any[]; // Expecting array of { lastSeen, power }
  currentIrradiance: number;
  currentTemp: number;
  currentDust: number;
}

export function SolarPredictionChart({ 
  historicalData, 
  currentIrradiance, 
  currentTemp, 
  currentDust 
}: SolarPredictionChartProps) {
  
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];

    // 1. Process Historical Data
    const processedHistorical = historicalData
      .slice(0, 20) // Take last 20 points
      .reverse()
      .map(d => ({
        time: d.lastSeen.includes('T') ? format(parseISO(d.lastSeen), 'HH:mm') : d.lastSeen,
        power: d.power || 0,
        predictedPower: null as number | null,
        type: 'historical'
      }));

    if (processedHistorical.length === 0) return [];

    const lastPoint = processedHistorical[processedHistorical.length - 1];
    const firstPoint = processedHistorical[0];
    const basePower = lastPoint.power;

    // Calculate a basic trend factor from recent history (-1 to 1)
    const trendFactor = processedHistorical.length > 1 
      ? (lastPoint.power - firstPoint.power) / Math.max(firstPoint.power, 1)
      : 0;

    // 2. Generate Prediction Data (Next 3 hours)
    const predictions = [];
    for (let i = 1; i <= 6; i++) {
      const hoursAhead = i * 0.5; // Every 30 mins
      const futureTime = addHours(new Date(), hoursAhead);
      
      const dustPenalty = (currentDust / 500) * 0.2;
      const tempPenalty = (currentTemp > 40 ? (currentTemp - 40) * 0.05 : 0);
      
      // Project using trend + environmental penalties
      // We decay the trend over time to avoid infinite growth/fall
      const decay = 1 - (i * 0.1);
      const predictedValue = Math.max(0, basePower * (1 + (trendFactor * decay) - dustPenalty - tempPenalty));

      predictions.push({
        time: format(futureTime, 'HH:mm'),
        power: null as number | null,
        predictedPower: Number(predictedValue.toFixed(2)),
        type: 'predicted'
      });
    }

    // Connect the last historical point to the first prediction for a smooth line
    const firstPrediction = { ...predictions[0], power: lastPoint.power, predictedPower: lastPoint.power };

    return [...processedHistorical, firstPrediction, ...predictions];
  }, [historicalData, currentIrradiance, currentTemp, currentDust]);

  return (
    <GlassCard className="w-full bg-[#0B1220]/50 border-white/5 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-[#22D3EE]" />
            <h3 className="text-white font-bold text-lg tracking-tight">Predicted Solar Generation</h3>
          </div>
          <p className="text-slate-400 text-xs">AI-driven 3-hour output estimation based on current trends.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shrink-0">
          <Clock className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Next 180 Mins</span>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
            />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }}
              unit="W"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0B1220', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#22D3EE' }}
            />
            
            {/* Historical Area */}
            <Area 
                type="monotone" 
                dataKey="power" 
                stroke="#22D3EE" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPower)" 
                animationDuration={1500}
            />

            {/* Prediction Line (Dashed) */}
            <Line 
                type="monotone" 
                dataKey="predictedPower" 
                stroke="#22D3EE" 
                strokeWidth={3} 
                strokeDasharray="8 5"
                dot={false}
                animationDuration={2000}
            />
            
            {/* Legend marker for Prediction */}
            <ReferenceLine x={chartData.find(d => d.type === 'historical')?.time} stroke="transparent" />
          </AreaChart>
      </div>

      <div className="flex items-center gap-6 mt-6 px-2">
        <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-[#22D3EE]"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historical</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-[#22D3EE]"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">AI Predicted</span>
        </div>
      </div>
    </GlassCard>
  );
}
