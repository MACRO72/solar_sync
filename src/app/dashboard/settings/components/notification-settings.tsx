
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationSettings() {
    return (
        <Card className="animate-energy-wave">
            <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive alerts and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                        <span>Push Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Receive alerts directly on your device.
                        </span>
                    </Label>
                    <Switch id="push-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                        <span>Email Notifications</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Get summaries and critical alerts via email.
                        </span>
                    </Label>
                    <Switch id="email-notifications" defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                    <Label htmlFor="high-priority-only" className="flex flex-col space-y-1">
                        <span>High-Priority Only</span>
                        <span className="font-normal leading-snug text-muted-foreground">
                            Only receive alerts with high severity.
                        </span>
                    </Label>
                    <Switch id="high-priority-only" />
                </div>
            </CardContent>
        </Card>
    );
}
