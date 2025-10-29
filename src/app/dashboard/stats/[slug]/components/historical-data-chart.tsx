'use client'
import * as React from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { historicalData } from "@/lib/data"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const chartConfig = {
    value: { label: "Value", color: "hsl(var(--primary))" },
} satisfies ChartConfig

type TimePeriod = '7d' | '30d';

export function HistoricalDataChart({ metric }: { metric: string }) {
    const [timePeriod, setTimePeriod] = React.useState<TimePeriod>('30d');
    
    const allData = historicalData[metric as keyof typeof historicalData] || [];
    const data = timePeriod === '7d' ? allData.slice(-7) : allData;

    return (
        <div className="space-y-4">
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
                <SelectTrigger className="w-full sm:w-[160px] ml-auto">
                    <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
            </Select>
            <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
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
