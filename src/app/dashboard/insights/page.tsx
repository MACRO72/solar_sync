import { AnomalySummarizer } from "./components/anomaly-summarizer";
import { CsvAnalyzer } from "./components/csv-analyzer";
import { EfficiencyForecaster } from "./components/efficiency-forecaster";
import { InsightsGenerator } from "./components/insights-generator";

export default function InsightsPage() {
    return (
        <div className="space-y-8">
            <EfficiencyForecaster />
            <InsightsGenerator />
            <AnomalySummarizer />
            <CsvAnalyzer />
        </div>
    )
}
