
import Link from "next/link";
import { ArrowLeft, Wifi, Thermometer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/glass-card";
import { notFound } from "next/navigation";
import { devices } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";


export default function DeviceDetailPage({ params }: { params: { slug: string } }) {
    const slugToId = (slug: string) => {
        return slug.toUpperCase().replace(/-/g, '_');
    }
    const device = devices.find(d => d.id.toLowerCase().replace(/_/g, '-') === params.slug);

    if (!device) {
        // For panels that are not in the main device list
        const panelName = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return (
             <div className="space-y-6">
                <Link href="/dashboard/connectivity">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Connectivity
                    </Button>
                </Link>
                <GlassCard>
                    <CardHeader>
                        <CardTitle>{panelName}</CardTitle>
                        <CardDescription>Status and details for this panel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Detailed information for this panel is not yet available.</p>
                    </CardContent>
                </GlassCard>
            </div>
        )
    }

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
                            <p className="text-muted-foreground">Energy Output</p>
                            <p className="font-semibold text-foreground">{device.energyOutput} kWh</p>
                        </div>
                   </div>
                </CardContent>
            </GlassCard>
        </div>
    );
}