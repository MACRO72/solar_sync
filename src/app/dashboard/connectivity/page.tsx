
import { GlassCard, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/glass-card";
import { CheckCircle, XCircle, Wifi, WifiOff, Cable } from "lucide-react";
import { cn } from "@/lib/utils";

const panels = [
  { name: "North Wing Panel A1", connected: true },
  { name: "North Wing Panel A2", connected: true },
  { name: "South Wing Panel B1", connected: false },
  { name: "South Wing Panel B2", connected: true },
  { name: "East Wing Panel C1", connected: true },
  { name: "East Wing Panel C2", connected: false },
];

export default function ConnectivityPage() {
  const isConnected = panels.some(p => p.connected);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                {isConnected ? <Wifi className="text-status-positive" /> : <WifiOff className="text-destructive" />}
                Sensor Connectivity Status
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isConnected ? <CheckCircle className="h-5 w-5 text-status-positive" /> : <XCircle className="h-5 w-5 text-destructive" />}
                <span>{isConnected ? "All Systems Operational" : "Some Sensors Offline"}</span>
            </div>
          </div>
          <CardDescription>Real-time status of all solar panel sensor connections.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {panels.map((panel, index) => (
              <div key={index} 
                   className={cn(
                       "flex items-center gap-4 rounded-lg border p-4 transition-colors",
                       panel.connected 
                         ? "border-status-positive/30 bg-status-positive/10" 
                         : "border-destructive/30 bg-destructive/10"
                   )}>
                {panel.connected ? (
                  <CheckCircle className="h-6 w-6 text-status-positive" />
                ) : (
                  <XCircle className="h-6 w-6 text-destructive" />
                )}
                <div>
                  <p className="font-semibold text-foreground">{panel.name}</p>
                  <p className={cn("text-sm", panel.connected ? "text-status-positive" : "text-destructive")}>
                    {panel.connected ? "Connected" : "Disconnected"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
