
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
    "Current": "current",
    "Power": "power",
    "Light Index": "irradiance",
    "Temperature": "temperature",
    "Dust Index": "dustDensity",
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
                if (isNaN(deviceDate.getTime())) { // Check for invalid date
                    const timeParts = d.lastSeen.split(':');
                    if (timeParts.length === 3) {
                        const [h, m, s] = timeParts.map(Number);
                        const today = new Date();
                        deviceDate.setHours(h, m, s);
                        // If date is in the future, assume it's from yesterday
                        if (deviceDate > today) {
                            deviceDate.setDate(deviceDate.getDate() - 1);
                        }
                    } else {
                        return false;
                    }
                }

                if (isNaN(deviceDate.getTime())) return false; // Still invalid

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
            time: d.lastSeen,
            value: d[dataKey] as number ?? 0
        })).sort((a, b) => {
            try {
                return new Date(a.time).getTime() - new Date(b.time).getTime()
            } catch {
                return a.time.localeCompare(b.time);
            }
        });

    }, [devices, timePeriod, dataKey, loading]);
    
    const formatTick = (value: any) => {
        try {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return value; // Return time string if not a full date
            }
            if (timePeriod === '24h') return format(date, 'HH:mm');
            return format(date, 'MMM d');
        } catch {
            return value;
        }
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
