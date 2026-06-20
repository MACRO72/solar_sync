'use client';

import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, RefreshCcw } from "lucide-react";
import { getAllDevices, deleteDevice, unpairDevice } from '@/lib/device-service';
import type { DeviceOwnershipRecord } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { RegisterDeviceDialog } from './register-device-dialog';
import { format } from 'date-fns';

export function AdminDevicesPanel() {
    const [devices, setDevices] = React.useState<(DeviceOwnershipRecord & { deviceId: string })[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);
    const { toast } = useToast();

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await getAllDevices();
            setDevices(data as any);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to load devices', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDevices();
    }, []);

    const handleDelete = async (deviceId: string) => {
        if (!confirm(`Are you sure you want to delete ${deviceId}? This action cannot be undone.`)) return;
        
        try {
            await deleteDevice(deviceId);
            toast({ title: 'Device Deleted', description: `${deviceId} has been removed from the system.` });
            fetchDevices();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleReset = async (deviceId: string, ownerUid: string) => {
        if (!confirm(`Are you sure you want to reset ownership for ${deviceId}?`)) return;

        try {
            await unpairDevice(ownerUid, deviceId);
            toast({ title: 'Ownership Reset', description: `${deviceId} is now unclaimed.` });
            fetchDevices();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <>
            <RegisterDeviceDialog 
                isOpen={isRegisterOpen} 
                setIsOpen={setIsRegisterOpen} 
                onRegistered={fetchDevices} 
            />
            <GlassCard>
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>System Devices</CardTitle>
                        <CardDescription>Manage all hardware nodes and pairing codes.</CardDescription>
                    </div>
                    <Button onClick={() => setIsRegisterOpen(true)} className="bg-[#22D3EE] text-black hover:bg-[#22D3EE]/90 font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        Register New Device
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Device ID</TableHead>
                                    <TableHead>Pairing Code</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Owner UID</TableHead>
                                    <TableHead>Registered</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-slate-500">Loading devices...</TableCell>
                                    </TableRow>
                                ) : devices.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-slate-500">No devices registered in the system yet.</TableCell>
                                    </TableRow>
                                ) : (
                                    devices.map(device => (
                                        <TableRow key={device.deviceId} className="hover:bg-white/5">
                                            <TableCell className="font-mono text-xs">{device.deviceId}</TableCell>
                                            <TableCell className="font-mono font-bold tracking-widest text-[#22D3EE]">{device.pairingCode}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={device.status === 'claimed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}>
                                                    {device.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-400 font-mono">
                                                {device.owner || <span className="text-slate-600 italic">None</span>}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-500">
                                                {device.registeredAt ? format(new Date(device.registeredAt), 'MMM d, yyyy') : 'Unknown'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        disabled={device.status !== 'claimed' || !device.owner}
                                                        onClick={() => handleReset(device.deviceId, device.owner)}
                                                        className="h-8 hover:text-orange-400"
                                                        title="Reset Ownership"
                                                    >
                                                        <RefreshCcw className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleDelete(device.deviceId)}
                                                        className="h-8 hover:text-destructive"
                                                        title="Delete Device"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </GlassCard>
        </>
    );
}
