
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const PerformanceChart = dynamic(
    () => import('@/components/dashboard/performance-chart').then(mod => mod.PerformanceChart),
    { 
        ssr: false,
        loading: () => <Skeleton className="h-[400px] w-full" />
    }
);

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <PerformanceChart fullHeight={true} defaultPeriod="7d" />
        </div>
    )
}
