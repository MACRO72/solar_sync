'use client'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { historicalData } from "@/lib/data"

const chartConfig = {
    value: { label: "Value", color: "hsl(var(--primary))" },
} satisfies ChartConfig

export function HistoricalDataChart({ metric }: { metric: string }) {
    const data = historicalData[metric as keyof typeof historicalData] || [];
    return (
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <LineChart accessibilityLayer data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
    )
}
