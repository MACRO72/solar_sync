'use client';

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const HistoricalDataChart = dynamic(
    () => import('./components/historical-data-chart').then(mod => mod.HistoricalDataChart),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[400px] w-full" />
    }
);


const statTitles = ["Voltage", "Current", "Power", "Temperature", "Light Index", "Dust Index"];


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
                    <CardDescription>Real-time and historical data for the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoricalDataChart metric={statTitle} />
                </CardContent>
            </Card>
        </div>
    );
}
