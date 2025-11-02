'use client'
import * as React from 'react';
import { Bar, BarChart, Line, LineChart, Scatter, ScatterChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { format } from 'date-fns';


const chartConfig = {
    measured: { label: "Measured", color: "hsl(var(--primary))" },
    base: { label: "Base", color: "hsl(var(--chart-5))" },
    power: { label: "Power (W)", color: "hsl(var(--primary))" },
    voltage: { label: "Voltage (V)", color: "hsl(var(--primary))" },
    dust: { label: "Dust Level", color: "hsl(var(--chart-3))" },
    efficiency: { label: "Efficiency (%)", color: "hsl(var(--chart-2))" },
    temperature: { label: "Temperature (°C)", color: "hsl(var(--destructive))" },
} satisfies ChartConfig

type TimePeriod = '24h' | '7d' | '30d';
type ChartView = 'performance' | 'power' | 'dust' | 'temperature';

const timePeriodOptions: {value: TimePeriod, label: string}[] = [
    { value: '24h', label: 'Live' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];

const chartViewOptions: {value: ChartView, label: string}[] = [
    { value: 'performance', label: 'Efficiency' },
    { value: 'power', label: 'Power' },
    { value: 'dust', label: 'Dust Index' },
    { value: 'temperature', label: 'Temperature' },
];


export function PerformanceChart({ fullHeight = false, defaultPeriod = '7d' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>(defaultPeriod);
    const [chartView, setChartView] = React.useState<ChartView>('performance');
    const { data: devices, loading } = useRealtimeData();
    
    const processedData = React.useMemo(() => {
        if (!devices || devices.length === 0) return [];

        const now = new Date();
        const nominalEfficiency = 100; // η₀
        const tempCoefficient = 0.003; // β
        const dustFactor = 0.05;      // γ
        
        return devices.map(device => {
            let deviceDate: Date;
            // Check if lastSeen is a full date string or just time
            if (device.lastSeen.includes('T') && device.lastSeen.endsWith('Z')) {
                deviceDate = new Date(device.lastSeen);
            } else {
                // Handle time-only strings
                const timeParts = device.lastSeen.split(':');
                deviceDate = new Date();
                if (timeParts.length === 3) {
                    const [h, m, s] = timeParts.map(Number);
                    deviceDate.setHours(h, m, s, 0);
                    // If the time is in the future, assume it's from yesterday
                    if (deviceDate > now) {
                        deviceDate.setDate(deviceDate.getDate() - 1);
                    }
                } else {
                    // Fallback for invalid time format
                     try {
                        const parsedDate = new Date(device.lastSeen);
                        if (!isNaN(parsedDate.getTime())) {
                            deviceDate = parsedDate;
                        } else {
                            deviceDate = now;
                        }
                    } catch {
                        deviceDate = now;
                    }
                }
            }
            if (isNaN(deviceDate.getTime())) {
                // Fallback for any other invalid date format
                deviceDate = now;
            }

            const temp = device.temperature ?? 0;
            const dust = device.dustDensity ?? 0;
            const baseEfficiency = nominalEfficiency * (1 - tempCoefficient * (temp - 25)) * (1 - dustFactor * dust);

            return {
                time: format(deviceDate, 'HH:mm'),
                date: deviceDate,
                measured: device.efficiency ?? 0,
                base: Math.max(0, baseEfficiency),
                power: device.power ?? 0,
                dust: dust,
                temperature: temp,
            };
        }).filter(item => {
             if (timePeriod === '24h') return true; 
             const diffDays = (now.getTime() - item.date.getTime()) / (1000 * 3600 * 24);
             if (timePeriod === '7d') return diffDays <= 7;
             if (timePeriod === '30d') return diffDays <= 30;
             return true;
        }).sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [devices, timePeriod]);


    const getChartDescription = () => {
        switch (chartView) {
            case 'performance':
                return 'Measured vs. Base Efficiency (%)';
            case 'power':
                return 'Real-time power output (W)';
            case 'dust':
                return 'Average dust accumulation level (µg/m³)';
            case 'temperature':
                return 'Temperature vs. Power Output';
        }
    }

    const renderChart = () => {
        if (loading) {
            return <div className="flex h-full items-center justify-center text-muted-foreground">Loading chart data...</div>;
        }
        if (processedData.length === 0) {
            return <div className="flex h-full items-center justify-center text-muted-foreground">Waiting for device data...</div>;
        }

        switch (chartView) {
            case 'performance':
                return (
                    <LineChart accessibilityLayer data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="%" />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="measured" type="monotone" stroke="var(--color-measured)" strokeWidth={2} dot={false} unit="%" />
                        <Line dataKey="base" type="monotone" stroke="var(--color-base)" strokeWidth={2} strokeDasharray="5 5" dot={false} unit="%" />
                    </LineChart>
                );
            case 'power':
                 return (
                    <LineChart accessibilityLayer data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="W" />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="power" type="monotone" stroke="var(--color-power)" strokeWidth={2} dot={false} name="Power" unit="W" />
                    </LineChart>
                );
            case 'dust':
                return (
                    <BarChart accessibilityLayer data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="µg/m³" />
                        <Tooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="dust" fill="var(--color-dust)" radius={4} barSize={20} />
                    </BarChart>
                );
             case 'temperature':
                 return (
                     <ScatterChart accessibilityLayer data={processedData} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="temperature"
                            type="number"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            unit="°C"
                            domain={['dataMin - 2', 'dataMax + 2']}
                            name="Temperature"
                        />
                        <YAxis
                            dataKey="power"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            unit="W"
                            name="Power"
                        />
                        <Tooltip content={<ChartTooltipContent />} cursor={false} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Scatter name="Power vs Temp" data={processedData} fill="var(--color-power)" />
                    </ScatterChart>
                );
        }
    }
    
    return (
        <Card className="animate-energy-wave rounded-2xl">
            <CardHeader className="flex flex-col items-stretch justify-between gap-4 md:flex-row">
                <div>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>
                       {getChartDescription()}
                    </CardDescription>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex items-center gap-2 flex-wrap">
                        {chartViewOptions.map(option => (
                            <Button 
                                key={option.value}
                                variant={chartView === option.value ? 'default' : 'outline'}
                                size="sm"
                                className="rounded-full"
                                onClick={() => setChartView(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
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
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={fullHeight ? "h-[400px] w-full" : "h-[300px] w-full"}>
                   {renderChart()}
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
