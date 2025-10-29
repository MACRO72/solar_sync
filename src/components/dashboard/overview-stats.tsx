import { GlassCard, CardHeader, CardTitle, CardContent } from "@/components/glass-card"
import { Thermometer, Zap, Wind, Gauge, HeartPulse } from "lucide-react"

const stats = [
    { title: "System Efficiency", value: "98.7%", icon: Gauge, change: "+0.2%" },
    { title: "Energy Output", value: "3,450 kWh", icon: Zap, change: "+5%" },
    { title: "Dust Index", value: "Low", icon: Wind, change: "Stable" },
    { title: "Avg. Temperature", value: "48°C", icon: Thermometer, change: "-1°C" },
    { title: "System Health", value: "99.5%", icon: HeartPulse, change: "Excellent" },
];

export function OverviewStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => (
                <GlassCard key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">{stat.change} vs last month</p>
                    </CardContent>
                </GlassCard>
            ))}
        </div>
    )
}
