
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Book, ExternalLink } from "lucide-react";
import Link from "next/link";

export function HelpAndSupport() {
    return (
        <Card className="animate-energy-wave">
            <CardHeader>
                <CardTitle>Help & Support</CardTitle>
                <CardDescription>Get help with using the dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Link href="#" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <Book className="mr-2 h-4 w-4" />
                        Read Documentation
                        <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                </Link>
                <Link href="#" passHref>
                    <Button variant="outline" className="w-full justify-start">
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        Contact Support
                         <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
