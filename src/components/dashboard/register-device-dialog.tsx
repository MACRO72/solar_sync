'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerDevice } from '@/lib/device-service';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, Check } from 'lucide-react';

export function RegisterDeviceDialog({ isOpen, setIsOpen, onRegistered }: { isOpen: boolean, setIsOpen: (o: boolean) => void, onRegistered: () => void }) {
    const [deviceId, setDeviceId] = React.useState('');
    const [isRegistering, setIsRegistering] = React.useState(false);
    const [pairingCode, setPairingCode] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState(false);
    const { toast } = useToast();

    const handleRegister = async () => {
        if (!deviceId.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Device ID is required.' });
            return;
        }

        setIsRegistering(true);
        try {
            const code = await registerDevice(deviceId.trim());
            setPairingCode(code);
            onRegistered();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Registration Failed', description: error.message });
        } finally {
            setIsRegistering(false);
        }
    };

    const handleCopy = () => {
        if (pairingCode) {
            navigator.clipboard.writeText(pairingCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(() => {
            setDeviceId('');
            setPairingCode(null);
            setCopied(false);
        }, 200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-[#0B1220] border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>{pairingCode ? 'Registration Successful' : 'Register New Device'}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {pairingCode 
                            ? 'Share this pairing code with the user to allow them to claim the device.' 
                            : 'Enter the unique hardware ID to register it in the system and generate a pairing code.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {!pairingCode ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="deviceId">Device ID (e.g. ESP001)</Label>
                                <Input 
                                    id="deviceId" 
                                    value={deviceId} 
                                    onChange={(e) => setDeviceId(e.target.value)} 
                                    placeholder="ESP001"
                                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-500"
                                    disabled={isRegistering}
                                />
                            </div>
                            <Button onClick={handleRegister} disabled={isRegistering} className="w-full bg-[#22D3EE] text-black hover:bg-[#22D3EE]/90">
                                {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isRegistering ? 'Generating Code...' : 'Register Device'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 flex flex-col items-center">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-between w-full">
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">Pairing Code</p>
                                    <p className="text-3xl font-mono font-bold tracking-widest text-[#22D3EE]">{pairingCode}</p>
                                </div>
                                <Button size="icon" variant="outline" className="border-white/10 hover:bg-white/5" onClick={handleCopy}>
                                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-slate-400" />}
                                </Button>
                            </div>
                            <Button onClick={handleClose} variant="outline" className="w-full">Close</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
