
'use client';
import Link from "next/link";
import { ArrowLeft, Wifi, Thermometer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/glass-card";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";


export default function DeviceDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { data: devices, loading } = useRealtimeData();

    const getStatusBadge = (status: 'Online' | 'Offline' | 'Error') => {
        return (
            <Badge variant="outline" className={cn('text-sm', {
                "bg-status-positive/10 border-status-positive/30 text-status-positive": status === 'Online',
                "bg-destructive/10 border-destructive/30 text-destructive": status === 'Error',
                "bg-status-neutral/10 border-status-neutral/30 text-status-neutral": status === 'Offline',
            })}>
                <div className={cn("w-2 h-2 rounded-full mr-2", {
                    "bg-status-positive": status === 'Online',
                    "bg-destructive": status === 'Error',
                    "bg-status-neutral": status === 'Offline',
                })} />
                {status}
            </Badge>
        )
    }
    
    if (loading) {
         return (
             <div className="space-y-6">
                <Link href="/dashboard/devices">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Devices
                    </Button>
                </Link>
                <GlassCard>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </GlassCard>
             </div>
         )
    }

    const device = devices.find(d => d.id.toLowerCase().replace(/_/g, '-') === slug);

    if (!device) {
        // This part handles panels from the connectivity page that might not be in the main device list yet.
        const panelName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const mockDevice = {
            name: panelName,
            id: slug.replace(/-/g, '_'),
            status: 'Offline' as 'Online' | 'Offline' | 'Error',
            lastSeen: 'N/A',
            temperature: 0,
            energyOutput: 0,
        };
        
        return (
             <div className="space-y-6">
                <Link href="/dashboard/connectivity">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Connectivity
                    </Button>
                </Link>
                <GlassCard className="animate-energy-wave">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>{mockDevice.name}</CardTitle>
                                <CardDescription>ID: {mockDevice.id}</CardDescription>
                            </div>
                            {getStatusBadge(mockDevice.status)}
                        </div>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-4">
                       <div className="flex items-center gap-4 rounded-lg border border-border/20 p-4">
                            <Wifi className="h-8 w-8 text-primary" />
                            <div>
                                <p className="text-muted-foreground">Last Seen</p>
                                <p className="font-semibold text-foreground">{mockDevice.lastSeen}</p>
                            </div>
                       </div>
                        <div className="flex items-center gap-4 rounded-lg border border-border/20 p-4">
                            <Thermometer className="h-8 w-8 text-destructive" />
                            <div>
                                <p className="text-muted-foreground">Temperature</p>
                                <p className="font-semibold text-foreground">{mockDevice.temperature}°C</p>
                            </div>
                       </div>
                        <div className="flex items-center gap-4 rounded-lg border border-border/20 p-4">
                            <Zap className="h-8 w-8 text-orange-500" />
                            <div>
                                <p className="text-muted-foreground">Energy Output</p>
                                <p className="font-semibold text-foreground">{mockDevice.energyOutput} kWh</p>
                            </div>
                       </div>
                    </CardContent>
                </GlassCard>
                <div className="text-center text-muted-foreground">
                    <p>Waiting for live data for this device...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Link href="/dashboard/devices">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Devices
                </Button>
            </Link>
            <GlassCard className="animate-energy-wave">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{device.name}</CardTitle>
                            <CardDescription>ID: {device.id}</CardDescription>
                        </div>
                        {getStatusBadge(device.status)}
                    </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                   <div className="flex items-center gap-4 rounded-lg border border-border/20 p-4">
                        <Wifi className="h-8 w-8 text-primary" />
                        <div>
                            <p className="text-muted-foreground">Last Seen</p>
                            <p className="font-semibold text-foreground">{device.lastSeen}</p>
                        </div>
                   </div>
                    <div className="flex items-center gap-4 rounded-lg border border-border/20 p-4">
                        <Thermometer className="h-8 w-8 text-destructive" />
                        <div>
                            <p className="text-muted-foreground">Temperature</p>
                            <p className="font-semibold text-foreground">{device.temperature}°C</p>
                        </div>
                   </div>
                    <div className="flex items-center gap-4 rounded-lg border border-border/20 p-4">
                        <Zap className="h-8 w-8 text-orange-500" />
                        <div>
                            <p className="text-muted-foreground">Power</p>
                            <p className="font-semibold text-foreground">{device.power} W</p>
                        </div>
                   </div>
                </CardContent>
            </GlassCard>
        </div>
    );
}
