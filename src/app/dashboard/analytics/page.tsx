import { PerformanceChart } from "@/components/dashboard/performance-chart";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            <PerformanceChart fullHeight={true} defaultPeriod="7d" />
        </div>
    )
}
