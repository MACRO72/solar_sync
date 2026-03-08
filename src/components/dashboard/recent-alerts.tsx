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
    const [debouncedDevices] = useDebounce(devices, 45000); 
    const { toast } = useToast();

    const handleAlert = useCallback(async (deviceList: Device[], isTest = false) => {
        if ((!isTest && deviceList.length === 0) || isGenerating) return;
        setIsGenerating(true);
        
        try {
            if (isTest) {
                // AI DRIVEN TEST ALERT
                const content = await generateAlertNotifications({
                    eventDescription: "This is a system diagnostic test. Please generate a 'Test Successful' alert. Ensure the pushTitle and pushBody are optimized for a mobile popup.",
                    urgencyLevel: 'medium',
                    affectedDevice: 'Diagnostic Node',
                    recipientEmail: user?.email || undefined,
                    recipientPhone: phone || undefined,
                });

                const testAlert: Alert = { 
                    id: `test-${Date.now()}`, 
                    title: content.title, 
                    description: content.message, 
                    severity: 'Medium', 
                    timestamp: new Date().toLocaleTimeString() 
                };
                setAlerts((p) => [testAlert, ...p].slice(0, 10));
                
                // This toast simulates the mobile popup experience in the browser
                toast({ 
                    title: content.pushTitle, 
                    description: content.pushBody, 
                });
            } else {
                // AI DRIVEN ALERT - FOR REAL SENSORY EVENTS
                const latest = deviceList[0];
                
                const isHighTemp = (latest.temperature || 0) >= 60;
                const isMediumTemp = (latest.temperature || 0) >= 50 && (latest.temperature || 0) < 60;
                const isError = latest.status === 'Error' || latest.status === 'Offline';
                const isLowEfficiency = (latest.irradiance || 0) > 500 && (latest.efficiency || 0) < 5;

                if (!isHighTemp && !isMediumTemp && !isError && !isLowEfficiency) {
                    setIsGenerating(false);
                    return;
                }

                const urgency = (isHighTemp || isError) ? 'high' : 'medium';
                
                const content = await generateAlertNotifications({
                    eventDescription: `Telemetry Anomaly: Status=${latest.status}, Temp=${latest.temperature}°C, Power=${latest.power}W, Efficiency=${latest.efficiency}%. Priority: ${isHighTemp ? 'Overheat' : 'Low Efficiency'}.`,
                    urgencyLevel: urgency,
                    affectedDevice: latest.name || latest.id,
                    recipientEmail: user?.email || undefined,
                    recipientPhone: phone || undefined,
                });

                const newAlert: Alert = { 
                    id: `alert-${Date.now()}`, 
                    title: content.title, 
                    description: content.message, 
                    severity: content.priority === 'high' ? 'High' : 'Medium', 
                    timestamp: new Date().toLocaleTimeString() 
                };

                setAlerts((p) => [newAlert, ...p].slice(0, 10));
                
                toast({ 
                    title: content.pushTitle, 
                    description: content.pushBody, 
                    variant: content.priority === 'high' ? 'destructive' : 'default' 
                });
            }
        } catch (e: any) {
            console.error('Alert processing error:', e);
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating, user?.email, phone, toast]);

    useEffect(() => { 
        if (debouncedDevices.length > 0 && !loading) {
            handleAlert(debouncedDevices); 
        }
    }, [debouncedDevices, handleAlert, loading]);

    return (
        <GlassCard className="h-full">
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Security & Alerts</CardTitle>
                    <CardDescription>AI Mobile Push Monitoring Enabled.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleAlert([], true)} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />} 
                    Test Alert
                </Button>
            </CardHeader>
            <CardContent>
                {loading && alerts.length === 0 ? (
                    <div className="flex h-[350px] items-center justify-center">
                        <Loader2 className="animate-spin mr-2" /> 
                        Analyzing sensor data...
                    </div>
                ) : alerts.length > 0 ? (
                    <ScrollArea className="h-[350px]">
                        <div className="space-y-6 pr-4">
                            {alerts.map((a) => (
                                <div key={a.id} className="flex items-start gap-4">
                                    <div className="mt-1">{getIcon(a.severity)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{a.title}</p>
                                            <p className="text-xs text-muted-foreground">{a.timestamp}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex h-[350px] items-center justify-center text-center text-muted-foreground">
                        <div className="space-y-2">
                            <Bell className="mx-auto h-8 w-8 opacity-20" />
                            <p>No active alerts.<br/>All systems nominal.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </GlassCard>
    )
}
