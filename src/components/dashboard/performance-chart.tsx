'use client'
import * as React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { performanceData } from "@/lib/data"
import { Button } from "@/components/ui/button";
import type { PerformanceData } from '@/lib/types';


const chartConfig = {
    actual: { label: "Actual", color: "hsl(var(--primary))" },
    predicted: { label: "Predicted", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

type ChartData = {
    time: string;
    actual: number;
    predicted: number;
}

type TimePeriod = '24h' | '7d' | '30d' | '12m';

const timePeriodOptions: {value: TimePeriod, label: string}[] = [
    { value: '24h', label: '24h' },
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
    { value: '12m', label: '12m' },
];


export function PerformanceChart({ fullHeight = false, defaultPeriod = '12m' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>(defaultPeriod);
    
    const data = performanceData[timePeriod];

    return (
        <Card className="animate-energy-wave">
            <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row">
                <div>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Actual vs. Predicted Energy Output (kWh)</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {timePeriodOptions.map(option => (
                        <Button 
                            key={option.value}
                            variant={timePeriod === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTimePeriod(option.value)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={fullHeight ? "h-[400px] w-full" : "h-[300px] w-full"}>
                    <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="time"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => {
                                if (timePeriod === '12m') return value.slice(0, 3);
                                if (timePeriod === '24h') return value;
                                return value.split(' ')[0];
                            }}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} dot={true} />
                        <Line dataKey="predicted" type="monotone" stroke="var(--color-predicted)" strokeWidth={2} dot={true} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
