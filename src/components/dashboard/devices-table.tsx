'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { devices } from "@/lib/data"
import { cn } from "@/lib/utils"

export function DevicesTable() {
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
                            {devices.map(device => (
                                <TableRow key={device.id}>
                                    <TableCell className="font-medium">{device.id}</TableCell>
                                    <TableCell>{device.name}</TableCell>
                                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                                    <TableCell>{device.temperature}</TableCell>
                                    <TableCell>{device.energyOutput}</TableCell>
                                    <TableCell>{device.lastSeen}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </GlassCard>
    )
}
