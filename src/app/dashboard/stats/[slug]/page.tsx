
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HistoricalDataChart } from "./components/historical-data-chart";
import { stats as statDetails } from '@/lib/data';
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StatDetailPage({ params }: { params: { slug: string } }) {
    const slugToTitle = (slug: string) => {
        return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const stat = statDetails.find(s => s.title.toLowerCase().replace(/ /g, '-') === params.slug);

    if (!stat) {
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
                    <CardTitle>{stat.title} - Historical Data</CardTitle>
                    <CardDescription>Data from the previous 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoricalDataChart metric={stat.title} />
                </CardContent>
            </Card>
        </div>
    );
}
