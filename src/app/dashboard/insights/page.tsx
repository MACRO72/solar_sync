import { AnomalySummarizer } from "./components/anomaly-summarizer";
import { CsvAnalyzer } from "./components/csv-analyzer";
import { EfficiencyPredictor } from "./components/efficiency-predictor";
import { InsightsGenerator } from "./components/insights-generator";

export default function InsightsPage() {
    return (
        <div className="space-y-8">
            <EfficiencyPredictor />
            <InsightsGenerator />
            <AnomalySummarizer />
            <CsvAnalyzer />
        </div>
    )
}
