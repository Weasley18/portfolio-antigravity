/**
 * A section heading: a small mono kicker (e.g. "01 · Starting XI") over a
 * condensed display title.
 */
const SectionHeading = ({ index, kicker, title, className = "" }) => (
    <div className={`mb-8 md:mb-12 ${className}`}>
        {(index || kicker) && (
            <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-2">
                {index}
                {index && kicker && <span className="text-text-secondary"> · </span>}
                {kicker && <span className="text-text-secondary">{kicker}</span>}
            </p>
        )}
        <h2 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight leading-none">{title}</h2>
    </div>
);

export default SectionHeading;
