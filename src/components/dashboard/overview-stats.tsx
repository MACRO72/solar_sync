'use client';
import Link from "next/link";
import { GlassCard, CardHeader, CardTitle, CardContent } from "@/components/glass-card"
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Gauge, Zap, Wind, Thermometer, Sun, Percent, Bolt } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stat } from "@/lib/types";

const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/\. /g, '-').replace(/ /g, '-');
}

const getIcon = (title: string) => {
    switch (title) {
        case "Voltage": return Bolt;
        case "Total Power": return Zap;
        case "Irradiance": return Sun;
        case "Avg. Temperature": return Thermometer;
        case "Dust Index": return Wind;
        case "System Health": return Gauge;
        default: return Zap;
    }
}

const getColor = (title: string) => {
     switch (title) {
        case "Voltage": return "text-primary";
        case "Total Power": return "text-orange-500";
        case "Irradiance": return "text-yellow-400";
        case "Avg. Temperature": return "text-destructive";
        case "Dust Index": return "text-status-neutral";
        case "System Health": return "text-status-positive";
        default: return "text-primary";
    }
}

export function OverviewStats() {
    const { data: devices, loading } = useRealtimeData();

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <GlassCard key={i} className="h-full">
                        <CardHeader className="flex flex-row items-center justify-start gap-4 space-y-0 pb-2">
                             <Skeleton className="h-6 w-6" />
                             <Skeleton className="h-4 w-24" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-3 w-16 mt-1" />
                        </CardContent>
                    </GlassCard>
                ))}
            </div>
        )
    }
    
    const calculateStats = (): Stat[] => {
        if (devices.length === 0) {
            return [
                { title: "Voltage", value: "N/A", icon: Bolt, change: "Waiting for data...", color: "text-primary"},
                { title: "Total Power", value: "N/A", icon: Zap, change: "Waiting for data...", color: "text-orange-500" },
                { title: "Irradiance", value: "N/A", icon: Sun, change: "Waiting for data...", color: "text-yellow-400" },
                { title: "Avg. Temperature", value: "N/A", icon: Thermometer, change: "Waiting for data...", color: "text-destructive" },
                { title: "Dust Index", value: "N/A", icon: Wind, change: "Waiting for data...", color: "text-status-neutral" },
                { title: "System Health", value: "N/A", icon: Gauge, change: "Waiting for data...", color: "text-status-positive" },
            ];
        }

        const totalPower = devices.reduce((acc, dev) => acc + (dev.power || 0), 0);
        const avgVoltage = devices.reduce((acc, dev) => acc + (dev.voltage || 0), 0) / devices.length;
        const avgTemp = devices.reduce((acc, dev) => acc + (dev.temperature || 0), 0) / devices.length;
        const totalIrradiance = devices.reduce((acc, dev) => acc + (dev.irradiance || 0), 0);
        const avgDust = devices.reduce((acc, dev) => acc + (dev.dustDensity || 0), 0) / devices.length;
        
        // System health based on number of online devices
        const onlineDevices = devices.filter(d => d.status === 'Online').length;
        const systemHealth = (onlineDevices / devices.length) * 100;

        return [
            { title: "Voltage", value: `${avgVoltage.toFixed(2)} V`, icon: Bolt, change: "Live", color: "text-primary", actual: avgVoltage, expected: 12 },
            { title: "Total Power", value: `${(totalPower / 1000).toFixed(2)} kW`, icon: Zap, change: "Live", color: "text-orange-500", actual: totalPower, expected: 4000 },
            { title: "Irradiance", value: `${totalIrradiance.toFixed(0)} W/m²`, icon: Sun, change: "Live", color: "text-yellow-400" },
            { title: "Avg. Temperature", value: `${avgTemp.toFixed(1)}°C`, icon: Thermometer, change: "Live", color: "text-destructive", actual: avgTemp, expected: 60 },
            { title: "Dust Index", value: `${avgDust.toFixed(1)} µg/m³`, icon: Wind, change: "Live", color: "text-status-neutral", actual: avgDust, expected: 100 },
            { title: "System Health", value: `${systemHealth.toFixed(1)}%`, icon: Gauge, change: `${onlineDevices}/${devices.length} Online`, color: "text-status-positive", actual: systemHealth, expected: 100 },
        ];
    }
    
    const stats = calculateStats();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {stats.map((stat, index) => {
                const Icon = getIcon(stat.title);
                const color = getColor(stat.title);

                return (
                    <Link key={index} href={`/dashboard/stats/${titleToSlug(stat.title)}`}>
                        <GlassCard className="h-full animate-energy-wave">
                            <CardHeader className="flex flex-row items-center justify-start gap-4 space-y-0 pb-2">
                                <Icon className={cn("h-6 w-6 text-muted-foreground", color)} />
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.change}</p>
                                 {stat.actual !== undefined && stat.expected !== undefined && (
                                    <div className="mt-2">
                                         <Progress 
                                            value={(stat.actual / stat.expected) * 100} 
                                            className="h-2 bg-blue-400/20"
                                            indicatorClassName="bg-purple-500"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </GlassCard>
                    </Link>
                )
            })}
        </div>
    )
}
