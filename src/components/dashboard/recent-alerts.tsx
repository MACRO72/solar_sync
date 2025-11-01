'use client';
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { alerts as mockAlerts } from "@/lib/data"
import { AlertTriangle, Bell, Info } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

const getIcon = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
        case 'High': return <AlertTriangle className="h-6 w-6 text-destructive" />;
        case 'Medium': return <Bell className="h-6 w-6 text-accent" />;
        case 'Low': return <Info className="h-6 w-6 text-primary" />;
    }
}

export function RecentAlerts() {
    // In a real app, this data would come from a real-time source.
    const alerts = mockAlerts;

    return (
        <GlassCard className="h-full animate-energy-wave">
            <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>AI-detected events and system notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                {alerts.length > 0 ? (
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
