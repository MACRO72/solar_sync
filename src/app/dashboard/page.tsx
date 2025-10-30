import { OverviewStats } from '@/components/dashboard/overview-stats';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { RecentAlerts } from '@/components/dashboard/recent-alerts';

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <OverviewStats />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PerformanceChart defaultPeriod="7d" fullHeight={true}/>
        </div>
        <div className="lg:col-span-2">
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
}
