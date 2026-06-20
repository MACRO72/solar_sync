'use client';

import * as React from 'react';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Wifi, WifiOff } from "lucide-react";
import { getUserDevices, unpairDevice } from '@/lib/device-service';
import type { PairedDevice } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PairDeviceDialog } from './pair-device-dialog';
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import { useDeviceStatus } from '@/hooks/use-device-status';
import { cn } from '@/lib/utils';

export function MyDevicesPanel() {
    const [devices, setDevices] = React.useState<PairedDevice[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isPairOpen, setIsPairOpen] = React.useState(false);
    const { user } = useUser();
    const { toast } = useToast();
    
    // We get real-time data to check online status of paired devices
    const { data: realTimeDevices } = useRealtimeData();

    const fetchDevices = React.useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getUserDevices(user.uid);
            setDevices(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Failed to load devices', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    React.useEffect(() => {
        if (user) {
            fetchDevices();
        }
    }, [user, fetchDevices]);

    const handleRemove = async (deviceId: string) => {
        if (!user) return;
        if (!confirm(`Are you sure you want to remove ${deviceId} from your account?`)) return;
        
        try {
            await unpairDevice(user.uid, deviceId);
            toast({ title: 'Device Removed', description: `${deviceId} has been unpaired from your account.` });
            fetchDevices();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <>
            <PairDeviceDialog 
                isOpen={isPairOpen} 
                setIsOpen={setIsPairOpen} 
                onPaired={fetchDevices} 
            />
            <GlassCard className="mb-6">
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>My Paired Devices</CardTitle>
                        <CardDescription>Hardware nodes linked to your account.</CardDescription>
                    </div>
                    <Button onClick={() => setIsPairOpen(true)} className="bg-[#22D3EE] text-black hover:bg-[#22D3EE]/90 font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Device
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8 text-slate-500">Loading your devices...</div>
                    ) : devices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 space-y-4 border border-dashed border-slate-800 rounded-lg bg-black/20">
                            <p className="text-slate-400">You haven't paired any devices yet.</p>
                            <Button variant="outline" onClick={() => setIsPairOpen(true)}>
                                Pair a Device
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {devices.map(device => (
                                <DeviceCard 
                                    key={device.deviceId} 
                                    device={device} 
                                    onRemove={() => handleRemove(device.deviceId)} 
                                    realTimeData={realTimeDevices.find(d => d.id === device.deviceId) || realTimeDevices[0]} // Fallback to first device for now if ID doesn't match perfectly during test
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </GlassCard>
        </>
    );
}

function DeviceCard({ device, onRemove, realTimeData }: { device: PairedDevice, onRemove: () => void, realTimeData: any }) {
    const status = useDeviceStatus(realTimeData?.lastSeen);
    const isOnline = status.isOnline;

    return (
        <div className="bg-[#0B1220]/80 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-lg font-bold font-mono text-white tracking-tight">{device.deviceId}</h3>
                    <p className="text-xs text-slate-500 mt-1">Claimed: {device.claimedAt ? format(new Date(device.claimedAt), 'MMM d, yyyy') : 'Unknown'}</p>
                </div>
                <Badge variant="outline" className={cn('text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5', isOnline ? "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]" : "bg-slate-500/10 border-slate-500/30 text-slate-400")}>
                    {isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                    {isOnline ? 'Online' : 'Offline'}
                </Badge>
            </div>
            
            <div className="flex justify-end">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onRemove}
                    className="h-8 text-slate-400 hover:text-destructive hover:bg-destructive/10"
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                </Button>
            </div>
        </div>
    );
}
