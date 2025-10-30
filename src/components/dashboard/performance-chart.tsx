'use client'
import * as React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { performanceData, powerData } from "@/lib/data"
import { Button } from "@/components/ui/button";


const chartConfig = {
    actual: { label: "Actual", color: "hsl(var(--primary))" },
    predicted: { label: "Predicted", color: "hsl(var(--chart-4))" },
    power: { label: "Power (W)", color: "hsl(var(--primary))" },
} satisfies ChartConfig

type TimePeriod = '24h' | '7d' | '30d';
type ChartView = 'performance' | 'power';

const timePeriodOptions: {value: TimePeriod, label: string}[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];

const chartViewOptions: {value: ChartView, label: string}[] = [
    { value: 'performance', label: 'Performance' },
    { value: 'power', label: 'Power vs. Time' },
];


export function PerformanceChart({ fullHeight = false, defaultPeriod = '7d' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>(defaultPeriod);
    const [chartView, setChartView] = React.useState<ChartView>('performance');
    
    const data = chartView === 'performance' ? performanceData[timePeriod] : powerData[timePeriod];

    return (
        <Card className="animate-energy-wave">
            <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row">
                <div>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>
                        {chartView === 'performance'
                            ? 'Actual vs. Predicted Energy Output (kWh)'
                            : 'Power Output (W) vs. Time'
                        }
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
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
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={fullHeight ? "h-[400px] w-full" : "h-[300px] w-full"}>
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
                    ) : (
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
                    )}
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
