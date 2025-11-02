'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRealtimeData } from "@/firebase/firestore/use-realtime-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";
import { Edit, Plus } from "lucide-react";
import { RenameDeviceDialog } from "./rename-device-dialog";
import * as React from 'react';
import { useFirestore } from "@/firebase/provider";
import { doc, onSnapshot } from "firebase/firestore";

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
                                    <TableRow key={latestDevice.id}>
                                        <TableCell className="font-medium">{latestDevice.id}</TableCell>
                                        <TableCell>{deviceName}</TableCell>
                                        <TableCell>{getStatusBadge(latestDevice.status)}</TableCell>
                                        <TableCell>{latestDevice.temperature?.toFixed(1) ?? 'N/A'}</TableCell>
                                        <TableCell>{latestDevice.irradiance ?? 'N/A'}</TableCell>
                                        <TableCell>{latestDevice.power ?? 'N/A'}</TableCell>
                                        <TableCell>{latestDevice.efficiency?.toFixed(2) ?? 'N/A'}</TableCell>
                                        <TableCell>{latestDevice.lastSeen}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => setIsRenameDialogOpen(true)}>
                                                <Edit className="h-4 w-4" />
                                                <span className="sr-only">Rename Device</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </GlassCard>
        </>
    )
}
