const StatBadge = ({ value, label, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <span className="font-display text-2xl md:text-4xl font-semibold tracking-tight text-ink">{value}</span>
        <span className="mt-1 text-xs md:text-sm uppercase tracking-wider text-text-secondary">{label}</span>
    </div>
);

export default StatBadge;
