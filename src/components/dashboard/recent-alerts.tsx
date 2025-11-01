'use client';
import { useState, useEffect } from 'react';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { AlertTriangle, Bell, Info } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import type { Alert } from '@/lib/types';
import { generateAlertNotifications } from '@/ai/flows/generate-alert-notifications';

const getIcon = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
        case 'High': return <AlertTriangle className="h-6 w-6 text-destructive" />;
        case 'Medium': return <Bell className="h-6 w-6 text-accent" />;
        case 'Low': return <Info className="h-6 w-6 text-primary" />;
    }
}

export function RecentAlerts() {
    const { data: devices, loading } = useRealtimeData();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const generateAlerts = async () => {
            if (loading || devices.length === 0 || isGenerating) return;

            setIsGenerating(true);
            const newAlerts: Alert[] = [];
            const offlineDevices = devices.filter(d => d.status === 'Offline');
            const errorDevices = devices.filter(d => d.status === 'Error');
            const hotDevices = devices.filter(d => (d.temperature ?? 0) > 50);

            try {
                if (offlineDevices.length > 0) {
                    const alertContent = await generateAlertNotifications({
                        eventDescription: `${offlineDevices.length} device(s) are offline.`,
                        urgencyLevel: 'medium',
                        affectedDevice: offlineDevices.map(d => d.name).join(', '),
                    });
                    newAlerts.push({
                        id: `offline-${Date.now()}`,
                        title: alertContent.title,
                        description: alertContent.message,
                        severity: 'Medium',
                        timestamp: new Date().toLocaleTimeString(),
                    });
                }

                if (errorDevices.length > 0) {
                     const alertContent = await generateAlertNotifications({
                        eventDescription: `Device "${errorDevices[0].name}" is reporting an error.`,
                        urgencyLevel: 'high',
                        affectedDevice: errorDevices[0].name,
                    });
                    newAlerts.push({
                        id: `error-${Date.now()}`,
                        title: alertContent.title,
                        description: alertContent.message,
                        severity: 'High',
                        timestamp: new Date().toLocaleTimeString(),
                    });
                }
                
                if (hotDevices.length > 0 && errorDevices.length === 0) {
                     const alertContent = await generateAlertNotifications({
                        eventDescription: `Device "${hotDevices[0].name}" is overheating.`,
                        urgencyLevel: 'high',
                        affectedDevice: hotDevices[0].name,
                    });
                     newAlerts.push({
                        id: `temp-${Date.now()}`,
                        title: alertContent.title,
                        description: alertContent.message,
                        severity: 'High',
                        timestamp: new Date().toLocaleTimeString(),
                    });
                }
                
                if (newAlerts.length === 0) {
                     const alertContent = await generateAlertNotifications({
                        eventDescription: `All systems are online and performing as expected.`,
                        urgencyLevel: 'low',
                    });
                    newAlerts.push({
                         id: `all-ok-${Date.now()}`,
                         title: alertContent.title,
                         description: alertContent.message,
                         severity: 'Low',
                         timestamp: new Date().toLocaleTimeString(),
                     });
                }

                setAlerts(newAlerts.sort((a,b) => {
                    const severityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                }));

            } catch (error) {
                console.error("Failed to generate alerts:", error);
            } finally {
                setIsGenerating(false);
            }
        };

        // Re-generate alerts when device data changes
        generateAlerts();
    // Debounce or add a cooldown if this fires too often in a real scenario
    }, [devices, loading]); // isGenerating is intentionally omitted

    return (
        <GlassCard className="h-full animate-energy-wave">
            <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>AI-detected events and system notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="flex h-[350px] items-center justify-center text-center">
                        <p className="text-muted-foreground">Scanning for alerts...</p>
                    </div>
                ) : alerts.length > 0 ? (
                    <ScrollArea className="h-[350px]">
                        <div className="space-y-6 pr-4">
                            {alerts.map((alert) => (
                                <div key={alert.id} className="flex items-start gap-4">
                                    <div>{getIcon(alert.severity)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{alert.title}</p>
                                            <p className="text-xs text-muted-foreground whitespace-nowrap">{alert.timestamp}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                     <div className="flex h-[350px] items-center justify-center text-center">
                        <p className="text-muted-foreground">No alerts to display.</p>
                    </div>
                )}
            </CardContent>
        </GlassCard>
    )
}
