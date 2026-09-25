import MetricSticker from "../illustrations/MetricSticker";

const ResultsGrid = ({ results = [] }) => (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {results.map((result, index) => (
            <MetricSticker key={index} value={result.value} label={result.label} index={index} />
        ))}
    </div>
);

export default ResultsGrid;
