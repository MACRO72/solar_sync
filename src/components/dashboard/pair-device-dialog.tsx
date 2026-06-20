'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pairDevice } from '@/lib/device-service';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function PairDeviceDialog({ isOpen, setIsOpen, onPaired }: { isOpen: boolean, setIsOpen: (o: boolean) => void, onPaired: () => void }) {
    const [deviceId, setDeviceId] = React.useState('');
    const [pairingCode, setPairingCode] = React.useState('');
    const [isPairing, setIsPairing] = React.useState(false);
    const { user } = useUser();
    const { toast } = useToast();

    const handlePair = async () => {
        if (!deviceId.trim() || !pairingCode.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Both Device ID and Pairing Code are required.' });
            return;
        }

        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to pair a device.' });
            return;
        }

        setIsPairing(true);
        try {
            await pairDevice(user.uid, deviceId.trim(), pairingCode.trim());
            toast({ title: 'Device Paired', description: 'You have successfully claimed this device.' });
            onPaired();
            handleClose();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Pairing Failed', description: error.message });
        } finally {
            setIsPairing(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setDeviceId('');
            setPairingCode('');
        }, 200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-[#0B1220] border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enter the Device ID and the pairing code provided by your administrator.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="deviceId">Device ID</Label>
                        <Input 
                            id="deviceId" 
                            value={deviceId} 
                            onChange={(e) => setDeviceId(e.target.value)} 
                            placeholder="e.g. ESP001"
                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 font-mono"
                            disabled={isPairing}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pairingCode">Pairing Code</Label>
                        <Input 
                            id="pairingCode" 
                            value={pairingCode} 
                            onChange={(e) => setPairingCode(e.target.value.toUpperCase())} 
                            placeholder="e.g. A7K9P2"
                            className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 font-mono uppercase"
                            disabled={isPairing}
                            maxLength={6}
                        />
                    </div>
                    
                    <Button onClick={handlePair} disabled={isPairing} className="w-full bg-[#22D3EE] text-black hover:bg-[#22D3EE]/90 mt-2 font-bold">
                        {isPairing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isPairing ? 'Verifying...' : 'Connect Device'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
