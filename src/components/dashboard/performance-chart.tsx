'use client'
import * as React from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/glass-card"
import { performanceData } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export function PerformanceChart({ fullHeight = false, defaultPeriod = '12m' }: { fullHeight?: boolean, defaultPeriod?: TimePeriod }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>(defaultPeriod);
    
    const data = performanceData[timePeriod];

    return (
        <GlassCard>
            <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row">
                <div>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Actual vs. Predicted Energy Output (kWh)</CardDescription>
                </div>
                <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="12m">Last 12 Months</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={fullHeight ? "h-[400px] w-full" : "h-[300px] w-full"}>
                    <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
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
        </GlassCard>
    )
}
