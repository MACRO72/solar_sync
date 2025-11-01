
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { CheckCircle, XCircle, Wifi, WifiOff, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";


export default function ConnectivityPage() {
  const { data: devices, loading } = useRealtimeData();

  const isConnected = devices.some(p => p.status === 'Online');
  const allConnected = devices.length > 0 && devices.every(p => p.status === 'Online');

  if (loading) {
    return (
        <div className="space-y-6">
            <Link href="/dashboard">
              <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
              </Button>
            </Link>
            <GlassCard>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                </CardContent>
            </GlassCard>
        </div>
    )
  }

  return (
    <div className="space-y-6">
       <Link href="/dashboard">
          <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
          </Button>
      </Link>
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                {isConnected ? <Wifi className="text-status-positive" /> : <WifiOff className="text-destructive" />}
                Sensor Connectivity Status
            </CardTitle>
             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {allConnected ? <CheckCircle className="h-5 w-5 text-status-positive" /> : <XCircle className="h-5 w-5 text-destructive" />}
                <span>{allConnected ? "All Systems Operational" : `${devices.filter(p => p.status !== 'Online').length} Sensor(s) Offline`}</span>
            </div>
          </div>
          <CardDescription>Real-time status of all solar panel sensor connections.</CardDescription>
        </CardHeader>
        <CardContent>
            {devices.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                    Waiting for device data...
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {devices.map((device) => (
                        <Link href={`/dashboard/devices/${device.id.replace(/_/g, '-')}`} key={device.id}>
                            <div 
                                className={cn(
                                    "flex items-center gap-4 rounded-lg border p-4 transition-colors h-full",
                                    device.status === 'Online'
                                        ? "border-status-positive/30 bg-status-positive/10 hover:bg-status-positive/20" 
                                        : "border-destructive/30 bg-destructive/10 hover:bg-destructive/20"
                                )}>
                                {device.status === 'Online' ? (
                                <CheckCircle className="h-6 w-6 text-status-positive" />
                                ) : (
                                <XCircle className="h-6 w-6 text-destructive" />
                                )}
                                <div>
                                <p className="font-semibold text-foreground">{device.name}</p>
                                <p className={cn("text-sm", device.status === 'Online' ? "text-status-positive" : "text-destructive")}>
                                    {device.status}
                                </p>
                                </div>
                            </div>
                    </Link>
                    ))}
                </div>
            )}
        </CardContent>
      </GlassCard>
    </div>
  );
}
