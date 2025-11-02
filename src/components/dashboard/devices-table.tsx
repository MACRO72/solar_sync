'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

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

    const latestDevice = devices[0];

    return (
        <GlassCard>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Device Fleet</CardTitle>
                    <CardDescription>Live status and telemetry of all ESP32 nodes.</CardDescription>
                </div>
                 <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Device
                </Button>
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
                                <TableHead>Irradiance (W/m²)</TableHead>
                                <TableHead>Power (W)</TableHead>
                                <TableHead>Efficiency (%)</TableHead>
                                <TableHead>Last Seen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                </TableRow>
                            ) : !latestDevice ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center h-24">
                                        Waiting for data from your ESP32...
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={latestDevice.id}>
                                    <TableCell className="font-medium">{latestDevice.id}</TableCell>
                                    <TableCell>{latestDevice.name}</TableCell>
                                    <TableCell>{getStatusBadge(latestDevice.status)}</TableCell>
                                    <TableCell>{latestDevice.temperature?.toFixed(1) ?? 'N/A'}</TableCell>
                                    <TableCell>{latestDevice.irradiance ?? 'N/A'}</TableCell>
                                    <TableCell>{latestDevice.power ?? 'N/A'}</TableCell>
                                    <TableCell>{latestDevice.efficiency?.toFixed(2) ?? 'N/A'}</TableCell>
                                    <TableCell>{latestDevice.lastSeen}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </GlassCard>
    )
}
