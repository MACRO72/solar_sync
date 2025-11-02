
'use client';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { AlertTriangle, Bell, Info } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRealtimeData } from '@/firebase/firestore/use-realtime-data';
import type { Alert, Device } from '@/lib/types';
import { generateAlertNotifications } from '@/ai/flows/generate-alert-notifications';

const getIcon = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
        case 'High': return <AlertTriangle className="h-6 w-6 text-destructive" />;
        case 'Medium': return <Bell className="h-6 w-6 text-accent" />;
        case 'Low': return <Info className="h-6 w-6 text-primary" />;
    }
}

// --- Alert Score Calculation ---

// Normalization functions to map sensor values to a 0-1 risk score.
const normalize = (value: number, min: number, max: number) => {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
};

const f_T = (temp: number) => normalize(temp, 40, 60); // Risk starts at 40°C, max at 60°C
const f_D = (dust: number) => normalize(dust, 80, 200); // Risk starts at 80 µg/m³, max at 200
const f_I = (irradiance: number) => 1 - normalize(irradiance, 100, 400); // Risk is high when irradiance is low (unexpectedly)
const f_E = (efficiencyDeviation: number) => normalize(efficiencyDeviation, 10, 30); // Risk starts at 10% deviation, max at 30%

// Tunable weights for each risk factor
const WEIGHTS = {
  temp: 0.3,       // w_T
  dust: 0.25,      // w_D
  irradiance: 0.15,// w_I
  efficiency: 0.3, // w_E
};

const ALERT_THRESHOLD = 0.7; // θ


export function RecentAlerts() {
    const { data: devices, loading } = useRealtimeData();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [debouncedDevices] = useDebounce(devices, 30000); // 30-second debounce

    useEffect(() => {
        const generateAlerts = async () => {
            if (loading || debouncedDevices.length === 0 || isGenerating) return;

            setIsGenerating(true);
            
            const latestDevice = debouncedDevices[0];
            const offlineDevices = debouncedDevices.filter(d => d.status === 'Offline');
            const errorDevices = debouncedDevices.filter(d => d.status === 'Error');
            let newAlert: Alert | null = null;
            
            try {
                 // Handle critical, non-score-based alerts first
                if (errorDevices.length > 0) {
                     const alertContent = await generateAlertNotifications({
                        eventDescription: `Device "${errorDevices[0].name}" is reporting a critical error state. Immediate attention may be required.`,
                        urgencyLevel: 'high',
                        affectedDevice: errorDevices[0].name,
                    });
                    newAlert = {
                        id: `error-${Date.now()}`,
                        title: alertContent.title,
                        description: alertContent.message,
                        severity: 'High',
                        timestamp: new Date().toLocaleTimeString(),
                    };
                } else if (offlineDevices.length > 0) {
                    const alertContent = await generateAlertNotifications({
                        eventDescription: `${offlineDevices.length} device(s) are offline and not reporting data.`,
                        urgencyLevel: 'medium',
                        affectedDevice: offlineDevices.map(d => d.name).join(', '),
                    });
                    newAlert = {
                        id: `offline-${Date.now()}`,
                        title: alertContent.title,
                        description: alertContent.message,
                        severity: 'Medium',
                        timestamp: new Date().toLocaleTimeString(),
                    };
                } else {
                    // --- Advanced Alert Score Calculation ---
                    const { temperature = 0, dustDensity = 0, irradiance = 0, efficiency = 0 } = latestDevice;

                    // Calculate base efficiency
                    const tempCoefficient = 0.003;
                    const dustFactor = 0.05;
                    const baseEfficiency = efficiency * (1 - tempCoefficient * (temperature - 25)) * (1 - dustFactor * dustDensity);
                    const efficiencyDeviation = baseEfficiency > 0 ? ((baseEfficiency - efficiency) / baseEfficiency) * 100 : 0;

                    // Calculate risk scores
                    const riskT = f_T(temperature);
                    const riskD = f_D(dustDensity);
                    const riskI = f_I(irradiance);
                    const riskE = f_E(efficiencyDeviation);

                    const alertScore = (WEIGHTS.temp * riskT) + (WEIGHTS.dust * riskD) + (WEIGHTS.irradiance * riskI) + (WEIGHTS.efficiency * riskE);
                    
                    if (alertScore > ALERT_THRESHOLD) {
                        const reasons = [];
                        if (riskT > 0.5) reasons.push(`high temperature (${temperature.toFixed(1)}°C)`);
                        if (riskD > 0.5) reasons.push(`high dust density (${dustDensity.toFixed(1)} µg/m³)`);
                        if (riskI > 0.5) reasons.push(`unexpectedly low irradiance (${irradiance.toFixed(0)} W/m²)`);
                        if (riskE > 0.5) reasons.push(`significant efficiency drop (${efficiencyDeviation.toFixed(1)}%)`);

                        const eventDescription = `Multiple factors are indicating a potential issue, resulting in an alert score of ${alertScore.toFixed(2)}. Key contributors include: ${reasons.join(', ')}.`;
                        
                        const alertContent = await generateAlertNotifications({
                            eventDescription,
                            urgencyLevel: 'high',
                            affectedDevice: latestDevice.name,
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
                
                // If no alerts were generated, create an "All Clear" message
                if (!newAlert) {
                     const alertContent = await generateAlertNotifications({
                        eventDescription: `All systems are online and performing within expected parameters.`,
                        urgencyLevel: 'low',
                    });
                    newAlert = {
                         id: `all-ok-${Date.now()}`,
                         title: alertContent.title,
                         description: alertContent.message,
                         severity: 'Low',
                         timestamp: new Date().toLocaleTimeString(),
                     };
                }

                setAlerts([newAlert]);

            } catch (error) {
                console.error("Failed to generate alerts:", error);
                setAlerts([{
                    id: `error-fallback-${Date.now()}`,
                    title: "Alert Generation Paused",
                    description: "AI service is temporarily unavailable. Displaying basic status.",
                    severity: 'Medium',
                    timestamp: new Date().toLocaleTimeString(),
                }]);
            } finally {
                setIsGenerating(false);
            }
        };

        generateAlerts();
    }, [debouncedDevices, loading, isGenerating]);

    return (
        <GlassCard className="h-full animate-energy-wave">
            <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>AI-detected events and system notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && alerts.length === 0 ? (
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
