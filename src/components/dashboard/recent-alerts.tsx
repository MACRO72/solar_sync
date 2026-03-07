
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

const getIcon = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
        case 'High': return <AlertTriangle className="h-6 w-6 text-destructive" />;
        case 'Medium': return <Bell className="h-6 w-6 text-accent" />;
        case 'Low': return <Info className="h-6 w-6 text-primary" />;
    }
}

const normalize = (value: number, min: number, max: number) => {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
};

const f_T = (temp: number) => normalize(temp, 40, 60);
const f_D = (dust: number) => normalize(dust, 80, 200);
const f_E = (efficiencyDeviation: number) => normalize(efficiencyDeviation, 10, 30);

const WEIGHTS = {
  temp: 0.4,
  dust: 0.3,
  efficiency: 0.3,
};

const ALERT_THRESHOLD = 0.7;


export function RecentAlerts() {
    const { data: devices, loading } = useRealtimeData();
    const { user } = useUser();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [debouncedDevices] = useDebounce(devices, 30000);
    const { toast } = useToast();

    const generateAlerts = useCallback(async (deviceList: Device[], isTest = false) => {
        if ((!isTest && deviceList.length === 0) || isGenerating) return;

        setIsGenerating(true);
        let newAlert: Alert | null = null;
        
        try {
            let alertContent;
            if (isTest) {
                const eventDescription = `Simulated test event: System is reporting a high temperature scenario. This test is to confirm alert generation and notification delivery via Email. A high-priority email should be sent to the administrator.`;

                alertContent = await generateAlertNotifications({
                    eventDescription: eventDescription,
                    urgencyLevel: 'high',
                    affectedDevice: 'Test Panel Alpha',
                    recipientEmail: user?.email || undefined,
                });

                newAlert = {
                    id: `test-alert-${Date.now()}`,
                    title: alertContent.title,
                    description: alertContent.message,
                    severity: 'High',
                    timestamp: new Date().toLocaleTimeString(),
                };

            } else {
                const latestDevice = deviceList[0];
                const errorDevices = deviceList.filter(d => d.status === 'Error');
                
                if (errorDevices.length > 0) {
                     alertContent = await generateAlertNotifications({
                        eventDescription: `Device "${errorDevices[0].name}" is reporting a critical error state. Immediate attention may be required.`,
                        urgencyLevel: 'high',
                        affectedDevice: errorDevices[0].name,
                        recipientEmail: user?.email || undefined,
                    });
                    newAlert = {
                        id: `error-${Date.now()}`,
                        title: alertContent.title,
                        description: alertContent.message,
                        severity: 'High',
                        timestamp: new Date().toLocaleTimeString(),
                    };
                } else {
                    const { temperature = 0, dustDensity = 0, efficiency = 0 } = latestDevice;
                    const tempCoefficient = 0.003;
                    const dustFactor = 0.05;
                    const baseEfficiency = efficiency > 0 ? (efficiency / ((1 - tempCoefficient * (temperature - 25)) * (1 - dustFactor * dustDensity))) : 0;
                    const efficiencyDeviation = baseEfficiency > 0 ? Math.abs(((baseEfficiency - efficiency) / baseEfficiency) * 100) : 0;

                    const riskT = f_T(temperature);
                    const riskD = f_D(dustDensity);
                    const riskE = f_E(efficiencyDeviation);

                    const alertScore = (WEIGHTS.temp * riskT) + (WEIGHTS.dust * riskD) + (WEIGHTS.efficiency * riskE);
                    
                    if (alertScore > ALERT_THRESHOLD) {
                        const eventDescription = `Anomalous sensor readings detected. Multiple factors are contributing to a high alert score (${alertScore.toFixed(2)}), including temperature, dust levels, or efficiency drops.`;
                        
                        alertContent = await generateAlertNotifications({
                            eventDescription,
                            urgencyLevel: 'high',
                            affectedDevice: latestDevice.name,
                            recipientEmail: user?.email || undefined,
                        });
                        newAlert = {
                            id: `score-alert-${Date.now()}`,
                            title: alertContent.title,
                            description: alertContent.message,
                            severity: 'High',
                            timestamp: new Date().toLocaleTimeString(),
                        };
                    }
                }
            }
            
            if (newAlert) {
                setAlerts((prev) => [newAlert!, ...prev].slice(0, 10));

                if (alertContent?.pushTitle && alertContent?.pushBody) {
                    toast({
                        title: alertContent.pushTitle,
                        description: alertContent.pushBody,
                        variant: newAlert.severity === 'High' ? 'destructive' : 'default',
                    });
                }
            }


        } catch (error: any) {
            console.error("Failed to generate alerts:", error);
            const isRateLimit = error.message?.includes('429') || error.message?.includes('Quota exceeded');
            
            toast({
              title: isRateLimit ? "AI Busy (Rate Limit)" : "Alert Generation Failed",
              description: isRateLimit 
                ? "The AI is currently receiving too many requests. Please wait a few moments and try again." 
                : (error.message || "An unexpected error occurred."),
              variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating, user?.email, toast]);

    const handleTestAlert = () => {
        generateAlerts([], true);
    }

    useEffect(() => {
        if (debouncedDevices.length > 0) {
            generateAlerts(debouncedDevices);
        }
    }, [debouncedDevices, generateAlerts]);


    return (
        <GlassCard className="h-full animate-energy-wave">
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>AI-detected events and system notifications.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestAlert} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TestTube2 className="mr-2 h-4 w-4" />}
                    Test Alert
                </Button>
            </CardHeader>
            <CardContent>
                {loading && alerts.length === 0 ? (
                     <div className="flex h-[350px] items-center justify-center text-center">
                        <div className='flex items-center gap-2'>
                           <Loader2 className="h-5 w-5 animate-spin"/>
                           <p className="text-muted-foreground">Scanning for alerts...</p>
                        </div>
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
