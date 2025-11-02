import { AnomalySummarizer } from "./components/anomaly-summarizer";
import { CsvAnalyzer } from "./components/csv-analyzer";
import { EfficiencyForecaster } from "./components/efficiency-forecaster";
import { InsightsGenerator } from "./components/insights-generator";
import { PowerForecaster } from "./components/power-forecaster";

export default function InsightsPage() {
    return (
        <div className="space-y-8">
            <EfficiencyForecaster />
            <PowerForecaster />
            <InsightsGenerator />
            <AnomalySummarizer />
            <CsvAnalyzer />
        </div>
    )
}
