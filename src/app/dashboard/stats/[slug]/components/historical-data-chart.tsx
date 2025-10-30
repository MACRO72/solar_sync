'use client'
import * as React from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { historicalData } from "@/lib/data"
import { Button } from '@/components/ui/button'

const chartConfig = {
    value: { label: "Value", color: "hsl(var(--primary))" },
} satisfies ChartConfig

type TimePeriod = '7d' | '30d';

const timePeriodOptions: {value: TimePeriod, label: string}[] = [
    { value: '7d', label: '7d' },
    { value: '30d', label: '30d' },
];


export function HistoricalDataChart({ metric }: { metric: string }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('30d');
    
    const allData = historicalData[metric as keyof typeof historicalData] || [];
    const data = timePeriod === '7d' ? allData.slice(-7) : allData;

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
                <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                         tickFormatter={(value) => `Day ${value}`}
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
