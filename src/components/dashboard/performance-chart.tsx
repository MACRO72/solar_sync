'use client'
import * as React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { performanceData, powerData, dustData, tempData } from "@/lib/data"
import { Button } from "@/components/ui/button";


const chartConfig = {
    actual: { label: "Actual", color: "hsl(var(--primary))" },
    predicted: { label: "Predicted", color: "hsl(var(--chart-4))" },
    power: { label: "Power (W)", color: "hsl(var(--primary))" },
    voltage: { label: "Voltage (V)", color: "hsl(var(--primary))" },
    dust: { label: "Dust Level", color: "hsl(var(--chart-3))" },
    efficiency: { label: "Efficiency (%)", color: "hsl(var(--chart-2))" },
    temperature: { label: "Temperature (°C)", color: "hsl(var(--destructive))" },
} satisfies ChartConfig

type TimePeriod = '24h' | '7d' | '30d';
type ChartView = 'performance' | 'power' | 'dust' | 'temperature';

const timePeriodOptions: {value: TimePeriod, label: string}[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];

const chartViewOptions: {value: ChartView, label: string}[] = [
    { value: 'performance', label: 'Performance' },
    { value: 'power', label: 'Power vs. Time' },
    { value: 'dust', label: 'Dust vs Efficiency' },
    { value: 'temperature', label: 'Temperature Impact' },
];


export function PerformanceChart({ fullHeight = false, defaultPeriod = '7d' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>(defaultPeriod);
    const [chartView, setChartView] = React.useState<ChartView>('performance');
    
    const data = chartView === 'performance' ? performanceData[timePeriod] 
        : chartView === 'power' ? powerData[timePeriod] 
        : chartView === 'dust' ? dustData[timePeriod]
        : tempData[timePeriod];

    const getChartDescription = () => {
        switch (chartView) {
            case 'performance':
                return 'Actual vs. Predicted Energy Output (kWh)';
            case 'power':
                return 'Power Output (W) vs. Time';
            case 'dust':
                return 'Dust Level vs. System Efficiency';
            case 'temperature':
                return 'Temperature vs. Power Output';
        }
    }
    
    return (
        <Card className="animate-energy-wave">
            <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row">
                <div>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>
                       {getChartDescription()}
                    </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={fullHeight ? "h-[400px] w-full" : "h-[300px] w-full"}>
                   <ResponsiveContainer>
                         {chartView === 'performance' ? (
                            <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => {
                                        if (timePeriod === '24h') return value;
                                        return value.split(' ')[0];
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    unit="kWh"
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} dot={true} unit="kWh" />
                                <Line dataKey="predicted" type="monotone" stroke="var(--color-predicted)" strokeWidth={2} dot={true} unit="kWh" />
                            </LineChart>
                        ) : chartView === 'power' ? (
                            <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="time"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => {
                                        if (timePeriod === '24h') return value;
                                        return value.split(' ')[0];
                                    }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    unit="W"
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line dataKey="power" type="monotone" stroke="var(--color-power)" strokeWidth={2} dot={false} name="Power" unit="W" />
                            </LineChart>
                        ) : chartView === 'dust' ? (
                           <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="dust"
                                    type="number"
                                    label={{ value: "Dust Level", position: "insideBottom", offset: -5 }}
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    unit="%"
                                    label={{ value: 'Efficiency (%)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line yAxisId="left" dataKey="efficiency" type="monotone" stroke="var(--color-efficiency)" strokeWidth={2} name="Efficiency" unit="%" />
                            </LineChart>
                        ) : ( // Temperature Impact
                             <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 20, bottom: 0, left: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="temperature"
                                    type="number"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    unit="°C"
                                    label={{ value: "Temperature (°C)", position: "insideBottom", offset: -5 }}
                                />
                                <YAxis
                                    yAxisId="left"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    unit="W"
                                    label={{ value: 'Power (W)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Line yAxisId="left" dataKey="power" type="monotone" stroke="var(--color-power)" strokeWidth={2} name="Power" unit="W" />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
