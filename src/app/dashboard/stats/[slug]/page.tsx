
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HistoricalDataChart } from "./components/historical-data-chart";
import { stats as statDetails } from '@/lib/data';
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

const statTitles = ["Voltage", "Total Power", "Irradiance", "Temperature", "Dust Index", "System Health"];


export default function StatDetailPage({ params }: { params: { slug: string } }) {
    const titleToSlug = (title: string) => {
        return title.toLowerCase().replace(/\. /g, '-').replace(/ /g, '-');
    }

    const statTitle = statTitles.find(s => titleToSlug(s) === params.slug);

    if (!statTitle) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <Link href="/dashboard">
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
            </Link>
            <Card className="animate-energy-wave">
                <CardHeader>
                    <CardTitle>{statTitle} - Historical Data</CardTitle>
                    <CardDescription>Data from the previous 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoricalDataChart metric={statTitle} />
                </CardContent>
            </Card>
        </div>
    );
}
