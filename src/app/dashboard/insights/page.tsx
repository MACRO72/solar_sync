import { AnomalySummarizer } from "./components/anomaly-summarizer";
import { InsightsGenerator } from "./components/insights-generator";

export default function InsightsPage() {
    return (
        <div className="space-y-8">
            <InsightsGenerator />
            <AnomalySummarizer />
        </div>
    )
}
