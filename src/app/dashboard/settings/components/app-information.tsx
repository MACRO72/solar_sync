
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export function AppInformation() {
    return (
        <Card className="animate-energy-wave">
            <CardHeader>
                <CardTitle>App Information</CardTitle>
                <CardDescription>Details about the current application build.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">1.0.0</p>
                </div>
                <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">Build</p>
                    <p className="font-medium">24A32</p>
                </div>
                <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">Mode</p>
                    <p className="font-medium">Production</p>
                </div>
                 <div className="flex justify-between text-sm">
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">July 26, 2024</p>
                </div>
            </CardContent>
        </Card>
    );
}
