const TONE_CLASSES = {
    warm: "bg-accent-warmSoft text-accent-warm border-transparent",
    cool: "bg-accent-coolSoft text-accent-cool border-transparent",
    ink: "bg-transparent text-text-secondary border-border",
};

/**
 * A small tag chip for tech/category labels. `tone` picks the color pairing.
 */
const StickerTag = ({ children, tone = "ink", className = "" }) => (
    <span
        className={`inline-flex items-center whitespace-nowrap rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider ${TONE_CLASSES[tone] || TONE_CLASSES.ink} ${className}`}
    >
        {children}
    </span>
);

export default StickerTag;
