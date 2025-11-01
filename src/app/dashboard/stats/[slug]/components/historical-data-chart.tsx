'use client'
import * as React from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Button } from '@/components/ui/button'
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data'
import { format } from 'date-fns'

const chartConfig = {
    value: { label: "Value", color: "hsl(var(--primary))" },
} satisfies ChartConfig

type TimePeriod = '24h' | '7d' | '30d';

const timePeriodOptions: {value: TimePeriod, label: string}[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];


const metricToKeyMap: Record<string, keyof import('@/lib/types').Device> = {
    "Voltage": "voltage",
    "Total Power": "power",
    "Irradiance": "irradiance",
    "Avg. Temperature": "temperature",
    "Dust Index": "dustDensity",
    "System Health": "efficiency", // Fallback for system health
};


export function HistoricalDataChart({ metric }: { metric: string }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('30d');
    const { data: devices, loading } = useRealtimeData();

    const dataKey = metricToKeyMap[metric] || 'power';
    
    const processedData = React.useMemo(() => {
        if (loading || !devices || devices.length === 0) return [];

        const now = new Date();
        const filteredDevices = devices.filter(d => {
            try {
                const deviceDate = new Date(d.lastSeen);
                if (isNaN(deviceDate.getTime())) return false; // Invalid date
                const diffDays = (now.getTime() - deviceDate.getTime()) / (1000 * 3600 * 24);

                if (timePeriod === '24h') return diffDays <= 1;
                if (timePeriod === '7d') return diffDays <= 7;
                if (timePeriod === '30d') return diffDays <= 30;
                return true;
            } catch (e) {
                return false;
            }
        });
        
        return filteredDevices.map(d => ({
            time: timePeriod === '24h' ? format(new Date(d.lastSeen), 'HH:mm') : format(new Date(d.lastSeen), 'MMM d'),
            value: d[dataKey] as number ?? 0
        })).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    }, [devices, timePeriod, dataKey, loading]);
    
    const formatTick = (value: any) => {
        if (timePeriod === '24h') {
            return value; // Already formatted as HH:mm
        }
        return value; // Already formatted as 'MMM d'
    };

    if (loading) return <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">Loading historical data...</div>
    if (processedData.length === 0) return <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">Waiting for data to populate this chart...</div>

    return (
        <div className="space-y-4">
            <div className="flex justify-end gap-2">
                 {timePeriodOptions.map(option => (
                    <Button 
                        key={option.value}
                        variant={timePeriod === option.value ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full"
                        onClick={() => setTimePeriod(option.value)}
                    >
                        {option.label}
                    </Button>
                ))}
            </div>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart accessibilityLayer data={processedData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                         tickFormatter={formatTick}
                    />
                     <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Line dataKey="value" type="monotone" stroke="var(--color-value)" strokeWidth={2} dot={true} />
                </LineChart>
            </ChartContainer>
        </div>
    )
}
