
'use client'
import * as React from 'react';
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { format, parse, startOfDay } from 'date-fns';
import { Activity, LayoutPanelLeft } from 'lucide-react';

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
type ChartType = 'curve' | 'bar';

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

export function PerformanceChart({ fullHeight = false, defaultPeriod = '24h' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>(defaultPeriod);
    const [chartView, setChartView] = React.useState<ChartView>('performance');
    const [chartType, setChartType] = React.useState<ChartType>('curve');
    const { data: devices, loading } = useRealtimeData();
    
    const processedData = React.useMemo(() => {
        if (!devices || devices.length === 0) return [];
        const now = new Date();
        const tempCoefficient = 0.003;
        const dustFactor = 0.05;

        // Filter devices based on the selected time period
        const filteredDevices = devices.filter(device => {
            let deviceDate: Date;
            if (device.lastSeen.includes('T')) {
                deviceDate = new Date(device.lastSeen);
            } else {
                const timeParts = device.lastSeen.split(':');
                deviceDate = new Date();
                if (timeParts.length === 3) {
                    const [h, m, s] = timeParts.map(Number);
                    deviceDate.setHours(h, m, s, 0);
                    if (deviceDate > now) deviceDate.setDate(deviceDate.getDate() - 1);
                } else {
                    return false;
                }
            }
            if (isNaN(deviceDate.getTime())) return false;

            const diffDays = (now.getTime() - deviceDate.getTime()) / (1000 * 3600 * 24);
            if (timePeriod === '24h') return diffDays <= 1;
            if (timePeriod === '7d') return diffDays <= 7;
            if (timePeriod === '30d') return diffDays <= 30;
            return true;
        });

        // For Live view, return sorted data points
        if (timePeriod === '24h') {
            return filteredDevices.map(device => {
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
                    date: deviceDate,
                    measured: device.efficiency ?? 0,
                    base: (device.efficiency ?? 0) * 1.1, // Mock base line
                    power: device.power ?? 0,
                    dust: device.dustDensity ?? 0,
                    temperature: device.temperature ?? 0,
                };
            }).sort((a, b) => a.date.getTime() - b.date.getTime());
        }

        // Aggregate by day for longer periods
        const dailyData: Record<string, any> = {};
        filteredDevices.forEach(device => {
            const date = device.lastSeen.includes('T') ? new Date(device.lastSeen) : new Date();
            const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = { measured: [], power: [], dust: [], temp: [], count: 0 };
            }
            dailyData[dayKey].measured.push(device.efficiency || 0);
            dailyData[dayKey].power.push(device.power || 0);
            dailyData[dayKey].dust.push(device.dustDensity || 0);
            dailyData[dayKey].temp.push(device.temperature || 0);
            dailyData[dayKey].count++;
        });

        return Object.entries(dailyData).map(([day, val]) => {
            const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
            return {
                time: format(new Date(day), 'MMM d'),
                date: new Date(day),
                measured: avg(val.measured),
                base: avg(val.measured) * 1.1,
                power: avg(val.power),
                dust: avg(val.dust),
                temperature: avg(val.temp),
            };
        }).sort((a, b) => a.date.getTime() - b.date.getTime());

    }, [devices, timePeriod]);

    const renderChart = () => {
        if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">Syncing sensor nodes...</div>;
        if (processedData.length === 0) return <div className="flex h-full items-center justify-center text-muted-foreground">Waiting for sensor data...</div>;

        if (chartView === 'temperature') {
             return (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="°C" />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <Line dataKey="temperature" type="monotone" stroke="var(--color-temperature)" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            );
        }

        if (chartType === 'bar') {
            const dataKey = chartView === 'performance' ? 'measured' : chartView === 'power' ? 'power' : 'dust';
            const color = chartView === 'performance' ? 'var(--color-measured)' : chartView === 'power' ? 'var(--color-power)' : 'var(--color-dust)';
            
            return (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar dataKey={dataKey} fill={color} radius={4} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Line 
                        dataKey={chartView === 'performance' ? 'measured' : chartView === 'power' ? 'power' : 'dust'} 
                        type="monotone" 
                        stroke={chartView === 'performance' ? 'var(--color-measured)' : chartView === 'power' ? 'var(--color-power)' : 'var(--color-dust)'} 
                        strokeWidth={2} 
                        dot={false} 
                    />
                </LineChart>
            </ResponsiveContainer>
        );
    }
    
    return (
        <Card className="animate-energy-wave rounded-2xl">
            <CardHeader className="flex flex-col items-stretch justify-between gap-4 md:flex-row">
                <div>
                    <CardTitle>Sensor Performance Overview</CardTitle>
                    <CardDescription>Real-time data stream from ESP32 node.</CardDescription>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                        <Button variant={chartType === 'curve' ? 'default' : 'ghost'} size="sm" onClick={() => setChartType('curve')}>
                            <Activity className="h-4 w-4 mr-1" /> Curve
                        </Button>
                        <Button variant={chartType === 'bar' ? 'default' : 'ghost'} size="sm" onClick={() => setChartType('bar')}>
                            <LayoutPanelLeft className="h-4 w-4 mr-1" /> Bar
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        {chartViewOptions.map(option => (
                            <Button key={option.value} variant={chartView === option.value ? 'secondary' : 'outline'} size="sm" className="rounded-full" onClick={() => setChartView(option.value)}>
                                {option.label}
                            </Button>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                        {timePeriodOptions.map(option => (
                            <Button key={option.value} variant={timePeriod === option.value ? 'default' : 'outline'} size="sm" className="rounded-full" onClick={() => setTimePeriod(option.value)}>
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
