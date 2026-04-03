import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Edit, Plus } from "lucide-react";
import { RenameDeviceDialog } from "./rename-device-dialog";
import { useFirestore } from "@/firebase/provider";
import { doc, onSnapshot } from "firebase/firestore";
import { useDeviceStatus } from "@/hooks/use-device-status";

export function DevicesTable() {
    const { data: devices, loading } = useRealtimeData();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = React.useState(false);
    const [customDeviceName, setCustomDeviceName] = React.useState<string | null>(null);
    const firestore = useFirestore();

    const latestDevice = devices[0];

    React.useEffect(() => {
        if (latestDevice && firestore) {
            const deviceDocRef = doc(firestore, 'device-data', latestDevice.id);
            const unsubscribe = onSnapshot(deviceDocRef, (doc) => {
                if (doc.exists() && doc.data().name) {
                    setCustomDeviceName(doc.data().name);
                } else {
                    setCustomDeviceName(null);
                }
            });
            return () => unsubscribe();
        }
    }, [latestDevice, firestore]);

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

    const deviceName = customDeviceName || latestDevice?.name;

    return (
        <>
            {latestDevice && (
                <RenameDeviceDialog
                    isOpen={isRenameDialogOpen}
                    setIsOpen={setIsRenameDialogOpen}
                    deviceId={latestDevice.id}
                    currentName={deviceName}
                />
            )}
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
                                    <TableHead className="text-right">Actions</TableHead>
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
                                        <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ) : !latestDevice ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center h-24">
                                            Waiting for data from your ESP32...
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <DeviceRow key={latestDevice.id} device={latestDevice} deviceName={deviceName} setIsRenameDialogOpen={setIsRenameDialogOpen} />
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </GlassCard>
        </>
    )
}

function DeviceRow({ device, deviceName, setIsRenameDialogOpen }: { device: any, deviceName: string, setIsRenameDialogOpen: (open: boolean) => void }) {
    const status = useDeviceStatus(device.lastSeen);

    const getStatusBadge = (isOnline: boolean) => {
        return (
            <Badge variant="outline" className={cn('text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5', isOnline ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]" : "bg-destructive/10 border-destructive/30 text-destructive")}>
                <div className={cn("w-1.5 h-1.5 rounded-full mr-2", isOnline ? "bg-[#22C55E] animate-pulse" : "bg-destructive")} />
                {isOnline ? 'Online' : 'Offline'}
            </Badge>
        )
    }

    return (
        <TableRow className="hover:bg-white/5 transition-colors group">
            <TableCell className="font-medium font-mono text-xs text-slate-400">{device.id}</TableCell>
            <TableCell className="font-bold text-white">{deviceName}</TableCell>
            <TableCell>{getStatusBadge(status.isOnline)}</TableCell>
            <TableCell className="text-slate-300 font-medium">{device.temperature?.toFixed(1) ?? 'N/A'}</TableCell>
            <TableCell className="text-slate-300 font-medium">{device.irradiance ?? 'N/A'}</TableCell>
            <TableCell className="text-slate-300 font-medium">{device.power?.toFixed(2) ?? 'N/A'}</TableCell>
            <TableCell className="text-[#22D3EE] font-bold">{device.efficiency?.toFixed(1) ?? 'N/A'}%</TableCell>
            <TableCell className="text-xs text-slate-500 font-medium">{status.lastSeenRelative}</TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => setIsRenameDialogOpen(true)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Rename Device</span>
                </Button>
            </TableCell>
        </TableRow>
    );
}
