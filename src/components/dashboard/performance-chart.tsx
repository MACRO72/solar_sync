'use client'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/glass-card"
import { performanceData } from "@/lib/data"

const chartConfig = {
    actual: { label: "Actual", color: "hsl(var(--primary))" },
    predicted: { label: "Predicted", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

export function PerformanceChart({ fullHeight = false }: { fullHeight?: boolean }) {
    return (
        <GlassCard>
            <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Actual vs. Predicted Energy Output (kWh)</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className={fullHeight ? "h-[400px] w-full" : "h-[300px] w-full"}>
                    <LineChart accessibilityLayer data={performanceData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                         <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => `${value}`}
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
