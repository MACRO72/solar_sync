
'use client';

import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";

// A simple normalization function to map lat/lng to a 0-100 scale
// This is a mock conversion and not a true mercator projection.
const normalizeCoords = (lat: number, lng: number) => {
    // Simple mapping assuming the provided coordinates are around a central point.
    // Los Angeles coordinates are roughly lat: 34, lng: -118
    const latMin = 34.050;
    const latMax = 34.054;
    const lngMin = -118.245;
    const lngMax = -118.239;

    const top = 100 - ((lat - latMin) / (latMax - latMin)) * 100;
    const left = ((lng - lngMin) / (lngMax - lngMin)) * 100;
    
    return { 
        top: `${Math.max(0, Math.min(100, top))}%`, 
        left: `${Math.max(0, Math.min(100, left))}%`
    };
};

export function DevicesMap() {
    const { data: devices, loading } = useRealtimeData();
    
    return (
        <GlassCard className="overflow-hidden">
            <CardHeader>
                <CardTitle>Device Geo-Distribution</CardTitle>
                <CardDescription>Live geographical location of sensor nodes.</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="relative h-[400px] w-full rounded-lg border border-border bg-background/50 p-4">
                        {/* Grid background */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-20" />

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground">Loading Map...</p>
                            </div>
                        )}

                        {!loading && devices.length === 0 && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-muted-foreground">Waiting for device location data...</p>
                            </div>
                        )}

                        {devices.map((device) => {
                            if (!device.location) return null;

                            const { top, left } = normalizeCoords(device.location.lat, device.location.lng);
                            const statusColor = 
                                device.status === 'Online' ? 'bg-status-positive' :
                                device.status === 'Offline' ? 'bg-status-neutral' :
                                'bg-destructive';
                            
                            const pulseColor = 
                                device.status === 'Online' ? 'shadow-[0_0_12px_3px] shadow-status-positive/50' :
                                device.status === 'Offline' ? 'shadow-[0_0_12px_3px] shadow-status-neutral/50' :
                                'shadow-[0_0_12px_3px] shadow-destructive/50';

                            return (
                                <Tooltip key={device.id}>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="absolute -translate-x-1/2 -translate-y-1/2"
                                            style={{ top, left }}
                                        >
                                            <div className={cn("relative h-3 w-3 rounded-full", statusColor)}>
                                                <div className={cn("absolute inset-0 h-3 w-3 rounded-full animate-ping", statusColor, pulseColor)} />
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{device.name}</p>
                                        <p>Status: {device.status}</p>
                                        <p>Temp: {device.temperature}°C</p>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </GlassCard>
    );
}

// Helper component for the grid pattern background
const GridPattern = () => (
    <svg className="absolute inset-0 h-full w-full stroke-border/50 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]">
        <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse" x="100%" y="100%" patternTransform="translate(-0.5 -0.5)">
                <path d="M0 32V0H32" fill="none" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
);
