'use client';

import * as React from "react";
import { useState } from "react";
import { GlassCard, CardHeader, CardContent } from "@/components/glass-card"
import { cn } from "@/lib/utils";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Zap, Wind, Thermometer, Sun, Bolt, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Stat, MetricKey } from "@/lib/types";
import { ParallaxChartTile } from "./parallax-chart-tile";
import { LayoutGroup } from "framer-motion";

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

const getChartColor = (title: string) => {
     switch (title) {
        case "Voltage": return "#00E5FF"; // Cyan/Neon Blue
        case "Current": return "#E040FB"; // Electric Purple
        case "Power": return "#FF9100";   // Neon Orange
        case "Temperature": return "#FF5252"; // Bright Red/Pink
        case "Light Index": return "#FFEA00"; // Neon Yellow
        case "Dust Index": return "#00E676";  // Neon Green
        default: return "#00E5FF";
    }
}


const getMetricKey = (title: string): MetricKey => {
     switch (title) {
        case "Voltage": return "voltage";
        case "Current": return "current";
        case "Power": return "power";
        case "Temperature": return "temperature";
        case "Light Index": return "irradiance";
        case "Dust Index": return "dustDensity";
        default: return "voltage";
    }
}

const getUnit = (title: string) => {
     switch (title) {
        case "Voltage": return "V";
        case "Current": return "mA";
        case "Power": return "W";
        case "Temperature": return "°C";
        case "Light Index": return "lx";
        case "Dust Index": return "µg/m³";
        default: return "";
    }
}

export function OverviewStats() {
    const { data: devices, loading } = useRealtimeData();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Prevent body scroll when a tile is expanded
    React.useEffect(() => {
        if (expandedIndex !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
             document.body.style.overflow = 'auto';
        }
    }, [expandedIndex]);

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
            { title: "Current", value: `${(latestDevice.current || 0).toFixed(2)} mA`, icon: Droplets, change: "Live", color: "text-blue-400" },
            { title: "Power", value: `${(latestDevice.power || 0).toFixed(2)} W`, icon: Zap, change: "Live", color: "text-orange-500" },
            { title: "Temperature", value: `${(latestDevice.temperature || 0).toFixed(1)}°C`, icon: Thermometer, change: "Live", color: "text-destructive" },
            { title: "Light Index", value: `${(latestDevice.irradiance || 0).toFixed(0)} lx`, icon: Sun, change: "Live", color: "text-yellow-400" },
            { title: "Dust Index", value: `${(latestDevice.dustDensity || 0).toFixed(1)} µg/m³`, icon: Wind, change: "Live", color: "text-status-neutral" },
        ];
    }
    
    const stats = calculateStats();

    return (
        <LayoutGroup>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 relative">
                {stats.map((stat, index) => {
                    const isExpanded = expandedIndex === index;
                    
                    return (
                        <ParallaxChartTile 
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            change={stat.change}
                            icon={getIcon(stat.title)}
                            iconColor={getColor(stat.title)}
                            metricKey={getMetricKey(stat.title)}
                            chartColor={getChartColor(stat.title)}
                            unit={getUnit(stat.title)}
                            isExpanded={isExpanded}
                            onExpand={() => setExpandedIndex(index)}
                            onCollapse={() => setExpandedIndex(null)}
                            animationDelay={index * 0.05} // Stagger entrance
                        />
                    )
                })}
            </div>
        </LayoutGroup>
    )
}
