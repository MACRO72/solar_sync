import Link from "next/link";
import { GlassCard, CardHeader, CardTitle, CardContent } from "@/components/glass-card"
import { stats } from "@/lib/data";

const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/ /g, '-');
}

export function OverviewStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => (
                <Link key={index} href={`/dashboard/stats/${titleToSlug(stat.title)}`}>
                    <GlassCard className="h-full">
                        <CardHeader className="flex flex-row items-center justify-start gap-4 space-y-0 pb-2">
                            <stat.icon className="h-6 w-6 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.change} vs last month</p>
                        </CardContent>
                    </GlassCard>
                </Link>
            ))}
        </div>
    )
}
