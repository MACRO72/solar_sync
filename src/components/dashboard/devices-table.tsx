'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";

export function DevicesTable() {
    const { data: devices, loading } = useRealtimeData();

    const getStatusBadge = (status: 'Online' | 'Offline' | 'Error') => {
        return (
            <Badge variant="outline" className={cn('text-xs', {
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
        <GlassCard>
            <CardHeader>
                <CardTitle>Device Fleet</CardTitle>
                <CardDescription>Live status and telemetry of all ESP32 nodes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Device ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Temp (°C)</TableHead>
                                <TableHead>Output (kWh)</TableHead>
                                <TableHead>Last Seen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    </TableRow>
                                ))
                            ) : devices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        Waiting for data from your ESP32...
                                    </TableCell>
                                </TableRow>
                            ) : (
                                devices.map(device => (
                                    <TableRow key={device.id}>
                                        <TableCell className="font-medium">{device.id}</TableCell>
                                        <TableCell>{device.name}</TableCell>
                                        <TableCell>{getStatusBadge(device.status)}</TableCell>
                                        <TableCell>{device.temperature ?? 'N/A'}</TableCell>
                                        <TableCell>{device.energyOutput ?? 'N/A'}</TableCell>
                                        <TableCell>{device.lastSeen}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </GlassCard>
    )
}
