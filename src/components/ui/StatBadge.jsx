import AnimatedValue from './AnimatedValue';

const StatBadge = ({ value, label, className = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <AnimatedValue value={value} className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-none text-ink" />
        <span className="mt-2 font-mono text-[11px] md:text-xs uppercase tracking-widest text-text-secondary">{label}</span>
    </div>
);

export default StatBadge;
