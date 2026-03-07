'use client';
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { AlertTriangle, Bell, Info, Loader2, TestTube2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import type { Alert, Device } from '@/lib/types';
import { generateAlertNotifications } from '@/ai/flows/generate-alert-notifications';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { triggerTestAlert } from '@/app/dashboard/insights/actions';
import { useAppState } from '@/context/app-state-provider';

const getIcon = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
        case 'High': return <AlertTriangle className="h-6 w-6 text-destructive" />;
        case 'Medium': return <Bell className="h-6 w-6 text-accent" />;
        case 'Low': return <Info className="h-6 w-6 text-primary" />;
    }
}

export function RecentAlerts() {
    const { data: devices, loading } = useRealtimeData();
    const { user } = useUser();
    const { phone } = useAppState();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [debouncedDevices] = useDebounce(devices, 30000);
    const { toast } = useToast();

    const generateAlerts = useCallback(async (deviceList: Device[], isTest = false) => {
        if ((!isTest && deviceList.length === 0) || isGenerating) return;
        setIsGenerating(true);
        let newAlert: Alert | null = null;
        try {
            if (isTest) {
                // LITERAL TEST ALERT LOGIC
                if (user?.email) {
                    const res = await triggerTestAlert(user.email, phone);
                    if (res.status === 'success') {
                        newAlert = { 
                            id: `test-${Date.now()}`, 
                            title: 'Test Alert', 
                            description: 'A literal "Test Alert" has been sent to your email and phone.', 
                            severity: 'Medium', 
                            timestamp: new Date().toLocaleTimeString() 
                        };
                        toast({ 
                            title: "Test Alert Sent", 
                            description: "Literal test messages sent via Email and SMS." 
                        });
                    }
                }
            } else {
                // AI DRIVEN ALERT LOGIC (Real events)
                const latest = deviceList[0];
                const content = await generateAlertNotifications({
                    eventDescription: `Telemetry data analysis for ${latest.name}.`,
                    urgencyLevel: latest.status === 'Error' ? 'high' : 'medium',
                    affectedDevice: latest.name,
                    recipientEmail: user?.email || undefined,
                    recipientPhone: phone || undefined,
                });
                newAlert = { 
                    id: `alert-${Date.now()}`, 
                    title: content.title, 
                    description: content.message, 
                    severity: content.priority === 'high' ? 'High' : 'Medium', 
                    timestamp: new Date().toLocaleTimeString() 
                };
                toast({ 
                    title: content.pushTitle, 
                    description: content.pushBody, 
                    variant: content.priority === 'high' ? 'destructive' : 'default' 
                });
            }
            if (newAlert) setAlerts((p) => [newAlert!, ...p].slice(0, 10));
        } catch (e: any) {
            console.error(e);
            toast({ 
                title: "Alert Failed", 
                description: e.message || "Failed to process alert.", 
                variant: "destructive" 
            });
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating, user?.email, phone, toast]);

    useEffect(() => { 
        if (debouncedDevices.length > 0) generateAlerts(debouncedDevices); 
    }, [debouncedDevices, generateAlerts]);

    return (
        <GlassCard className="h-full">
            <CardHeader className="flex-row items-start justify-between">
                <div><CardTitle>Recent Alerts</CardTitle><CardDescription>AI monitoring.</CardDescription></div>
                <Button variant="outline" size="sm" onClick={() => generateAlerts([], true)} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />} Test Alert
                </Button>
            </CardHeader>
            <CardContent>
                {loading && alerts.length === 0 ? <div className="flex h-[350px] items-center justify-center"><Loader2 className="animate-spin mr-2" /> Monitoring...</div> :
                 alerts.length > 0 ? <ScrollArea className="h-[350px]"><div className="space-y-6 pr-4">{alerts.map((a) => (
                    <div key={a.id} className="flex items-start gap-4"><div>{getIcon(a.severity)}</div><div className="flex-1">
                    <div className="flex items-center justify-between"><p className="font-semibold">{a.title}</p><p className="text-xs text-muted-foreground">{a.timestamp}</p></div>
                    <p className="text-sm text-muted-foreground">{a.description}</p></div></div>))}</div></ScrollArea> :
                    <div className="flex h-[350px] items-center justify-center text-muted-foreground">No alerts.</div>}
            </CardContent>
        </GlassCard>
    )
}
