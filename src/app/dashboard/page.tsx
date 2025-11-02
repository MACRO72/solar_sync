
'use client';

import { OverviewStats } from "@/components/dashboard/overview-stats";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { RecentAlerts } from "@/components/dashboard/recent-alerts";

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
