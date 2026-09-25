/**
 * A numbered "notebook tab" section heading, e.g. "01 — Selected Work".
 */
const SectionHeading = ({ index, title, className = "" }) => (
    <div className={`flex items-baseline gap-3 mb-8 md:mb-12 ${className}`}>
        {index && (
            <span className="font-mono text-sm text-accent-warm border border-accent-warm/40 bg-accent-warmSoft rounded px-2 py-0.5">
                {index}
            </span>
        )}
        <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight">{title}</h2>
    </div>
);

export default SectionHeading;
