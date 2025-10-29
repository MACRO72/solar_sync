import { GlassCard, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/glass-card";
import { HistoricalDataChart } from "./components/historical-data-chart";
import { stats as statDetails } from '@/lib/data';
import { notFound } from "next/navigation";

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
            <GlassCard>
                <CardHeader>
                    <CardTitle>{stat.title} - Historical Data</CardTitle>
                    <CardDescription>Data from the previous 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <HistoricalDataChart metric={stat.title} />
                </CardContent>
            </GlassCard>
        </div>
    );
}
