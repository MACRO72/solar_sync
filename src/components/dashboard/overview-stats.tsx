import Link from "next/link";
import { GlassCard, CardHeader, CardTitle, CardContent } from "@/components/glass-card"
import { stats } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const titleToSlug = (title: string) => {
    return title.toLowerCase().replace(/\. /g, '-').replace(/ /g, '-');
}

export function OverviewStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {stats.map((stat, index) => (
                <Link key={index} href={`/dashboard/stats/${titleToSlug(stat.title)}`}>
                    <GlassCard className="h-full animate-energy-wave">
                        <CardHeader className="flex flex-row items-center justify-start gap-4 space-y-0 pb-2">
                            <stat.icon className={cn("h-6 w-6 text-muted-foreground", stat.color)} />
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">{stat.change}</p>
                             {stat.actual !== undefined && stat.expected !== undefined && (
                                <div className="mt-2">
                                     <Progress 
                                        value={(stat.actual / stat.expected) * 100} 
                                        className="h-2 bg-blue-400/20"
                                        indicatorClassName="bg-purple-500"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </GlassCard>
                </Link>
            ))}
        </div>
    )
}
