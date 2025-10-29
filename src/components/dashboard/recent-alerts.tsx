import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card"
import { alerts } from "@/lib/data"
import { AlertTriangle, Bell, Info } from 'lucide-react'

const getIcon = (severity: 'High' | 'Medium' | 'Low') => {
    switch (severity) {
        case 'High': return <AlertTriangle className="h-5 w-5 text-destructive" />;
        case 'Medium': return <Bell className="h-5 w-5 text-accent" />;
        case 'Low': return <Info className="h-5 w-5 text-primary" />;
    }
}

export function RecentAlerts() {
    return (
        <GlassCard>
            <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>AI-detected events and system notifications.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-4">
                            <div>{getIcon(alert.severity)}</div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold">{alert.title}</p>
                                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{alert.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </GlassCard>
    )
}
