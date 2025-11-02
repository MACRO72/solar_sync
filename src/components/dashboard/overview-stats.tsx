
'use client';
import Link from "next/link";
import { GlassCard, CardHeader, CardTitle, CardContent } from "@/components/glass-card"
import { cn } from "@/lib/utils";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Zap, Wind, Thermometer, Sun, Bolt, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stat } from "@/lib/types";

const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/\. /g, '-').replace(/ /g, '-');
}

const getIcon = (title: string) => {
    switch (title) {
        case "Voltage": return Bolt;
        case "Current": return Droplets;
        case "Power": return Zap;
        case "Temperature": return Thermometer;
        case "Light Index": return Sun;
        case "Dust Index": return Wind;
        default: return Zap;
    }
}

const getColor = (title: string) => {
     switch (title) {
        case "Voltage": return "text-primary";
        case "Current": return "text-blue-400";
        case "Power": return "text-orange-500";
        case "Temperature": return "text-destructive";
        case "Light Index": return "text-yellow-400";
        case "Dust Index": return "text-status-neutral";
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
        const latestDevice = devices[0];

        if (!latestDevice) {
            const waitingStat = { value: "N/A", change: "Waiting for data..." };
            return [
                { title: "Voltage", ...waitingStat, icon: Bolt, color: "text-primary"},
                { title: "Current", ...waitingStat, icon: Droplets, color: "text-blue-400"},
                { title: "Power", ...waitingStat, icon: Zap, color: "text-orange-500" },
                { title: "Temperature", ...waitingStat, icon: Thermometer, color: "text-destructive" },
                { title: "Light Index", ...waitingStat, icon: Sun, color: "text-yellow-400" },
                { title: "Dust Index", ...waitingStat, icon: Wind, color: "text-status-neutral" },
            ];
        }

        return [
            { title: "Voltage", value: `${(latestDevice.voltage || 0).toFixed(2)} V`, icon: Bolt, change: "Live", color: "text-primary"},
            { title: "Current", value: `${(latestDevice.current || 0).toFixed(2)} A`, icon: Droplets, change: "Live", color: "text-blue-400" },
            { title: "Power", value: `${(latestDevice.power || 0).toFixed(2)} W`, icon: Zap, change: "Live", color: "text-orange-500" },
            { title: "Temperature", value: `${(latestDevice.temperature || 0).toFixed(1)}°C`, icon: Thermometer, change: "Live", color: "text-destructive" },
            { title: "Light Index", value: `${(latestDevice.irradiance || 0).toFixed(0)} lx`, icon: Sun, change: "Live", color: "text-yellow-400" },
            { title: "Dust Index", value: `${(latestDevice.dustDensity || 0).toFixed(1)} µg/m³`, icon: Wind, change: "Live", color: "text-status-neutral" },
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
                            </CardContent>
                        </GlassCard>
                    </Link>
                )
            })}
        </div>
    )
}
