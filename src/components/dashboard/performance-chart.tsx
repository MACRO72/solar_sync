
'use client'
import * as React from 'react';
import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
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

export function PerformanceChart({ fullHeight = false, defaultPeriod = '7d' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>(defaultPeriod);
    const [chartView, setChartView] = React.useState<ChartView>('performance');
    const [chartType, setChartType] = React.useState<ChartType>('curve');
    const { data: devices, loading } = useRealtimeData();
    
    const processedData = React.useMemo(() => {
        if (!devices || devices.length === 0) return [];
        const now = new Date();
        const tempCoefficient = 0.003;
        const dustFactor = 0.05;

        // Filter devices based on the selected time period first
        const filteredDevices = devices.filter(device => {
            let deviceDate: Date;
            if (device.lastSeen.includes('T') && device.lastSeen.endsWith('Z')) {
                deviceDate = new Date(device.lastSeen);
            } else {
                const timeParts = device.lastSeen.split(':');
                deviceDate = new Date();
                if (timeParts.length === 3) {
                    const [h, m, s] = timeParts.map(Number);
                    deviceDate.setHours(h, m, s, 0);
                    if (deviceDate > now) {
                        deviceDate.setDate(deviceDate.getDate() - 1);
                    }
                } else {
                    return false; // Invalid time format
                }
            }
            if (isNaN(deviceDate.getTime())) return false;

            const diffDays = (now.getTime() - deviceDate.getTime()) / (1000 * 3600 * 24);
            if (timePeriod === '24h') return diffDays <= 1;
            if (timePeriod === '7d') return diffDays <= 7;
            if (timePeriod === '30d') return diffDays <= 30;
            return true;
        });

        // If 'Live' view, process and return detailed data
        if (timePeriod === '24h') {
            return filteredDevices.map(device => {
                let deviceDate: Date;
                 if (device.lastSeen.includes('T') && device.lastSeen.endsWith('Z')) {
                    deviceDate = new Date(device.lastSeen);
                } else {
                    deviceDate = parse(device.lastSeen, 'HH:mm:ss', new Date());
                }

                const temp = device.temperature ?? 0;
                const dust = device.dustDensity ?? 0;
                const measuredEfficiency = device.efficiency ?? 0;
                const baseEfficiency = measuredEfficiency > 0 ? (measuredEfficiency / ((1 - tempCoefficient * (temp - 25)) * (1 - dustFactor * dust))) : 0;
                
                return {
                    time: format(deviceDate, 'HH:mm'),
                    date: deviceDate,
                    measured: measuredEfficiency,
                    base: Math.max(0, Math.min(100, baseEfficiency)),
                    power: device.power ?? 0,
                    dust: dust,
                    temperature: temp,
                };
            }).sort((a, b) => a.date.getTime() - b.date.getTime());
        }

        // For '7d' and '30d', aggregate data by day
        const dailyData: Record<string, {
            temps: number[],
            dusts: number[],
            powers: number[],
            measuredEffs: number[],
            baseEffs: number[],
            count: number
        }> = {};

        filteredDevices.forEach(device => {
            let deviceDate: Date;
            if (device.lastSeen.includes('T') && device.lastSeen.endsWith('Z')) {
                deviceDate = new Date(device.lastSeen);
            } else {
                 deviceDate = parse(device.lastSeen, 'HH:mm:ss', new Date());
                 if (deviceDate > new Date()) deviceDate.setDate(deviceDate.getDate() - 1);
            }

            const dayKey = format(startOfDay(deviceDate), 'yyyy-MM-dd');
            if (!dailyData[dayKey]) {
                dailyData[dayKey] = { temps: [], dusts: [], powers: [], measuredEffs: [], baseEffs: [], count: 0 };
            }

            const temp = device.temperature ?? 0;
            const dust = device.dustDensity ?? 0;
            const power = device.power ?? 0;
            const measuredEfficiency = device.efficiency ?? 0;
            const baseEfficiency = measuredEfficiency > 0 ? (measuredEfficiency / ((1 - tempCoefficient * (temp - 25)) * (1 - dustFactor * dust))) : 0;

            dailyData[dayKey].temps.push(temp);
            dailyData[dayKey].dusts.push(dust);
            dailyData[dayKey].powers.push(power);
            dailyData[dayKey].measuredEffs.push(measuredEfficiency);
            dailyData[dayKey].baseEffs.push(Math.max(0, Math.min(100, baseEfficiency)));
            dailyData[dayKey].count++;
        });

        return Object.entries(dailyData).map(([day, data]) => {
            const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
            return {
                time: format(new Date(day), 'MMM d'),
                date: new Date(day),
                measured: avg(data.measuredEffs),
                base: avg(data.baseEffs),
                power: avg(data.powers),
                dust: avg(data.dusts),
                temperature: avg(data.temps),
            };
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

        if (chartView === 'temperature') {
             return (
                 <LineChart accessibilityLayer data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="temperature" type="number" tickLine={false} tickMargin={10} axisLine={false} unit="°C" domain={['dataMin - 2', 'dataMax + 2']} />
                    <YAxis dataKey="power" tickLine={false} axisLine={false} tickMargin={10} unit="W" />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <Line dataKey="power" type="monotone" stroke="var(--color-power)" strokeWidth={2} dot={true} />
                </LineChart>
            );
        }

        if (chartType === 'bar') {
            const dataKey = chartView === 'performance' ? 'measured' : chartView === 'power' ? 'power' : 'dust';
            const color = chartView === 'performance' ? 'var(--color-measured)' : chartView === 'power' ? 'var(--color-power)' : 'var(--color-dust)';
            
            return (
                <BarChart accessibilityLayer data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey={dataKey} fill={color} radius={4} barSize={20} />
                    {chartView === 'performance' && <Bar dataKey="base" fill="var(--color-base)" radius={4} barSize={20} opacity={0.3} />}
                </BarChart>
            );
        }

        // Default: Curve (Monotone Line)
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
                    <LineChart accessibilityLayer data={processedData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="µg/m³" />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="dust" type="monotone" stroke="var(--color-dust)" strokeWidth={2} dot={false} name="Dust Level" />
                    </LineChart>
                );
            default: return null;
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
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                        <Button 
                            variant={chartType === 'curve' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="rounded-md h-8 px-2"
                            onClick={() => setChartType('curve')}
                        >
                            <Activity className="h-4 w-4 mr-1" /> Curve
                        </Button>
                        <Button 
                            variant={chartType === 'bar' ? 'default' : 'ghost'} 
                            size="sm" 
                            className="rounded-md h-8 px-2"
                            onClick={() => setChartType('bar')}
                        >
                            <LayoutPanelLeft className="h-4 w-4 mr-1" /> Bar
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {chartViewOptions.map(option => (
                            <Button 
                                key={option.value}
                                variant={chartView === option.value ? 'secondary' : 'outline'}
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
    