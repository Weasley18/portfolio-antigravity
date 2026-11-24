import MetricSticker from "../illustrations/MetricSticker";

const ResultsGrid = ({ results = [], compact = false }) => (
    <div className={`grid gap-3 ${compact ? "grid-cols-3" : "sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"}`}>
        {results.map((result, index) => (
            <MetricSticker key={index} value={result.value} label={result.label} compact={compact} />
        ))}
    </div>
);

export default ResultsGrid;
