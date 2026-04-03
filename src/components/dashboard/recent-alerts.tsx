'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
                // INTELLIGENT AI-DRIVEN TEST ALERT
                const content = await generateAlertNotifications({
                    eventDescription: "SYSTEM DIAGNOSTIC TEST: AI-powered notification engine is being verified. Please generate a 'Test Successful' alert with details about the secure link to Brevo and Gemini. Ensure the tone is professional but reassuring.",
                    urgencyLevel: 'medium',
                    affectedDevice: 'Diagnostic Internal Engine',
                    recipientEmail: user?.email || undefined,
                    recipientPhone: phone || undefined,
                    telemetry: {
                        temperature: 55, // Trigger medium AI enhancement if allowed
                        dustLevel: 0,
                        efficiency: 100
                    }
                });

                const testAlert: Alert = { 
                    id: `test-${Date.now()}`, 
                    title: content.title, 
                    description: content.message, 
                    severity: 'Medium', 
                    timestamp: new Date().toLocaleTimeString() 
                };
                setAlerts((p) => [testAlert, ...p].slice(0, 10));
                
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
                const isDusty = (latest.dustDensity || 0) >= 150;
                const isAbnormalTilt = (latest.tiltAngle != null) && (latest.tiltAngle < 20 || latest.tiltAngle > 40);

                if (!isHighTemp && !isMediumTemp && !isError && !isLowEfficiency && !isDusty && !isAbnormalTilt) {
                    setIsGenerating(false);
                    return;
                }

                const urgency = (isHighTemp || isError) ? 'high' : 'medium';
                
                // Add more context for Gemini to be "intelligent"
                const context = [
                    `Status: ${latest.status}`,
                    `Temp: ${latest.temperature?.toFixed(1)}°C`,
                    `Power: ${latest.power?.toFixed(1)}W`,
                    `Efficiency: ${latest.efficiency?.toFixed(1)}%`,
                    `Dust: ${latest.dustDensity?.toFixed(0)}µg/m³`,
                    `Tilt: ${latest.tiltAngle?.toFixed(1)}°`,
                ].join(', ');

                const content = await generateAlertNotifications({
                    eventDescription: `TELEMETRY ANOMALY DETECTED: ${
                        isHighTemp ? 'Critical Overheat' : 
                        isError ? 'System Failure' : 
                        isDusty ? 'High Dust' : 
                        isAbnormalTilt ? 'Abnormal Tilt' : 'Low Efficiency'
                    }.`,
                    urgencyLevel: urgency,
                    affectedDevice: latest.name || latest.id,
                    recipientEmail: user?.email || undefined,
                    recipientPhone: phone || undefined,
                    telemetry: {
                        dustLevel: latest.dustDensity,
                        tiltAngle: latest.tiltAngle,
                        efficiency: latest.efficiency,
                        temperature: latest.temperature,
                    }
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
                            <AnimatePresence initial={false}>
                              {alerts.map((a, i) => (
                                <motion.div
                                  key={a.id && a.id !== "" ? a.id : `alert-key-${i}`}
  

                                  initial={{ opacity: 0, y: -16, scale: 0.97 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                                  transition={{
                                    duration: 0.35,
                                    delay: i === 0 ? 0 : 0,
                                    ease: 'easeOut',
                                  }}
                                  className="flex items-start gap-4"
                                >
                                  <div className="mt-1">{getIcon(a.severity)}</div>
                                  <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                          <p className="font-semibold">{a.title}</p>
                                          <p className="text-xs text-muted-foreground">{a.timestamp}</p>
                                      </div>
                                      <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>
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
