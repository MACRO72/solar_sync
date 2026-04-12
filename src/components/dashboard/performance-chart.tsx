
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
    measured: { label: "Efficiency (%)", color: "hsl(var(--primary))" },
    power: { label: "Power (W)", color: "hsl(var(--primary))" },
    voltage: { label: "Voltage (V)", color: "hsl(var(--primary))" },
    dust: { label: "Dust Level", color: "hsl(var(--chart-3))" },
    efficiency: { label: "Efficiency (%)", color: "hsl(var(--chart-2))" },
    temperature: { label: "Temperature (°C)", color: "hsl(var(--destructive))" },
    predicted: { label: "Predicted", color: "#a78bfa" },
} satisfies ChartConfig

/** Simple Moving Average helper */
function sma(values: number[], window = 5): number[] {
    return values.map((_, i) => {
        const slice = values.slice(Math.max(0, i - window + 1), i + 1);
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
}

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

export const PerformanceChart = React.memo(({ fullHeight = false, defaultPeriod = '24h' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) => {
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
            const live = filteredDevices.map(device => {
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
                    power: device.power ?? 0,
                    dust: device.dustDensity ?? 0,
                    temperature: device.temperature ?? 0,
                    predicted: undefined as number | undefined,
                    _sma: {} as any,
                };
            }).sort((a, b) => a.date.getTime() - b.date.getTime());

            // Attach SMA-5 predicted values
            const measuredSma = sma(live.map(d => d.measured));
            const powerSma    = sma(live.map(d => d.power));
            const dustSma     = sma(live.map(d => d.dust));
            const tempSma     = sma(live.map(d => d.temperature));
            live.forEach((d, i) => {
                d._sma = { measured: measuredSma[i], power: powerSma[i], dust: dustSma[i], temperature: tempSma[i] };
            });
            return live;
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

        const sorted = Object.entries(dailyData).map(([day, val]) => {
            const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
            return {
                time: format(new Date(day), 'MMM d'),
                date: new Date(day),
                measured: avg(val.measured),
                power: avg(val.power),
                dust: avg(val.dust),
                temperature: avg(val.temp),
                predicted: undefined as number | undefined,
            };
        }).sort((a, b) => a.date.getTime() - b.date.getTime());

        // Attach SMA-5 predicted values for every field
        const measuredSma = sma(sorted.map(d => d.measured));
        const powerSma    = sma(sorted.map(d => d.power));
        const dustSma     = sma(sorted.map(d => d.dust));
        const tempSma     = sma(sorted.map(d => d.temperature));
        sorted.forEach((d, i) => {
            d.predicted = measuredSma[i]; // default; overridden in render
            (d as any)._sma = { measured: measuredSma[i], power: powerSma[i], dust: dustSma[i], temperature: tempSma[i] };
        });
        return sorted;

    }, [devices, timePeriod]);

    // Derive chart data with the correct 'predicted' key for the active view
    const chartData = React.useMemo(() => {
        if (!processedData.length) return processedData;
        return processedData.map((d: any) => ({
            ...d,
            predicted: d._sma?.[
                chartView === 'performance' ? 'measured' :
                chartView === 'power'       ? 'power' :
                chartView === 'dust'        ? 'dust' : 'temperature'
            ] ?? undefined,
        }));
    }, [processedData, chartView]);

    const renderedChart = React.useMemo(() => {
        if (loading) return <div className="flex h-full items-center justify-center text-muted-foreground">Syncing sensor nodes...</div>;
        if (chartData.length === 0) return <div className="flex h-full items-center justify-center text-muted-foreground">Waiting for sensor data...</div>;

        const predictedLine = (
            <Line
                dataKey="predicted"
                name="Predicted"
                type="monotone"
                stroke="#a78bfa"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
                isAnimationActive={false}
                filter="url(#glow-predicted)"
                connectNulls
            />
        );

        const glowDef = (
            <defs>
                <filter id="glow-predicted" x="-20%" y="-50%" width="140%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
        );

        if (chartView === 'temperature') {
             return (
                 <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                     {glowDef}
                     <CartesianGrid vertical={false} strokeDasharray="3 3" />
                     <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                     <YAxis tickLine={false} axisLine={false} tickMargin={10} unit="°C" />
                     <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                     <Line dataKey="temperature" type="monotone" stroke="var(--color-temperature)" strokeWidth={2} dot={false} isAnimationActive={false} />
                     {predictedLine}
                 </LineChart>
            );
        }

        if (chartType === 'bar') {
            const dataKey = chartView === 'performance' ? 'measured' : chartView === 'power' ? 'power' : 'dust';
            const color = chartView === 'performance' ? 'var(--color-measured)' : chartView === 'power' ? 'var(--color-power)' : 'var(--color-dust)';
            
            return (
                 <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                     <CartesianGrid vertical={false} strokeDasharray="3 3" />
                     <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                     <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                     <Tooltip content={<ChartTooltipContent />} />
                     <Bar dataKey={dataKey} fill={color} radius={4} barSize={20} isAnimationActive={false} />
                 </BarChart>
            );
        }

        const activeKey = chartView === 'performance' ? 'measured' : chartView === 'power' ? 'power' : 'dust';
        const activeColor = chartView === 'performance' ? 'var(--color-measured)' : chartView === 'power' ? 'var(--color-power)' : 'var(--color-dust)';

        return (
             <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                 {glowDef}
                 <CartesianGrid vertical={false} strokeDasharray="3 3" />
                 <XAxis dataKey="time" tickLine={false} tickMargin={10} axisLine={false} />
                 <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                 <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                 <Line
                     dataKey={activeKey}
                     type="monotone"
                     stroke={activeColor}
                     strokeWidth={2}
                     dot={false}
                     isAnimationActive={false}
                 />
                 {predictedLine}
             </LineChart>
        );
    }, [loading, chartData, chartView, chartType]);
    
    return (
        <Card className="animate-energy-wave rounded-2xl">
            <CardHeader className="flex flex-col items-stretch justify-between gap-3 md:flex-row">
                <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg">Sensor Performance Overview</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Real-time data stream from ESP32 node.</CardDescription>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
                        <Button variant={chartType === 'curve' ? 'default' : 'ghost'} size="sm" className="text-xs px-2 py-1 h-7" onClick={() => setChartType('curve')}>
                            <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Curve
                        </Button>
                        <Button variant={chartType === 'bar' ? 'default' : 'ghost'} size="sm" className="text-xs px-2 py-1 h-7" onClick={() => setChartType('bar')}>
                            <LayoutPanelLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Bar
                        </Button>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                        {chartViewOptions.map(option => (
                            <Button key={option.value} variant={chartView === option.value ? 'secondary' : 'outline'} size="sm" className="rounded-full text-xs px-2 py-0.5 h-7" onClick={() => setChartView(option.value)}>
                                {option.label}
                            </Button>
                        ))}
                    </div>
                     <div className="flex items-center gap-1">
                        {timePeriodOptions.map(option => (
                            <Button key={option.value} variant={timePeriod === option.value ? 'default' : 'outline'} size="sm" className="rounded-full text-xs px-2 py-0.5 h-7" onClick={() => setTimePeriod(option.value)}>
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={fullHeight ? "h-[300px] sm:h-[400px] w-full" : "h-[220px] sm:h-[300px] w-full"}>
                   {renderedChart}
                </ChartContainer>
                {/* Legend */}
                {chartType === 'curve' && (
                    <div className="flex items-center gap-6 mt-3 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-0.5 bg-[hsl(var(--primary))] rounded-full" />
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Actual</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg width="20" height="4" className="overflow-visible">
                                <line x1="0" y1="2" x2="20" y2="2" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 3"
                                    style={{ filter: 'drop-shadow(0 0 3px #a78bfa)' }} />
                            </svg>
                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Predicted (SMA-5)</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
});
PerformanceChart.displayName = 'PerformanceChart';
