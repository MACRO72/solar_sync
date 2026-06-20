
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Mail, Users } from "lucide-react";
import Link from "next/link";

export function HelpAndSupport() {
    return (
        <Card className="animate-energy-wave">
            <CardHeader>
                <CardTitle>Help &amp; Support</CardTitle>
                <CardDescription>Reach out to our team for any questions or issues.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                {/* Team info */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Support Team</span>
                    </div>
                    <div className="pl-6 space-y-1">
                        <p className="text-sm font-bold tracking-wide">CTRL+DevX</p>
                        <Link
                            href="mailto:solarsyncx@gmail.com"
                            className="text-sm text-primary hover:underline break-all"
                        >
                            solarsyncx@gmail.com
                        </Link>
                    </div>
                </div>

                {/* Email button */}
                <Link href="mailto:solarsyncx@gmail.com" passHref>
                    <Button variant="outline" className="w-full justify-start gap-2">
                        <Mail className="h-4 w-4" />
                        Email Support
                        <span className="ml-auto text-xs text-muted-foreground">solarsyncx@gmail.com</span>
                    </Button>
                </Link>

                {/* Report an issue */}
                <Link href="mailto:solarsyncx@gmail.com?subject=SolarSync%20Issue%20Report" passHref>
                    <Button variant="outline" className="w-full justify-start gap-2">
                        <LifeBuoy className="h-4 w-4" />
                        Report an Issue
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
