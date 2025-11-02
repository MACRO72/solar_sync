
'use client';

import { OverviewStats } from "@/components/dashboard/overview-stats";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";

const PerformanceChart = dynamic(
  () => import('@/components/dashboard/performance-chart').then(mod => mod.PerformanceChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[300px] w-full" />
  }
);


export default function DashboardOverviewPage() {

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-3">
            <OverviewStats />
        </div>
        <div className="lg:col-span-2">
            <PerformanceChart />
        </div>
        <div className="lg:col-span-1 grid grid-cols-1 gap-6">
            <RecentAlerts />
        </div>
    </div>
  );
}
