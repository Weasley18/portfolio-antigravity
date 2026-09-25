import { rotationFor } from "../../lib/hash";

const TONE_CLASSES = {
    warm: "bg-accent-warmSoft text-accent-warm border-accent-warm/40",
    cool: "bg-accent-coolSoft text-accent-cool border-accent-cool/40",
    ink: "bg-transparent text-ink border-border",
};

/**
 * A small paper-sticker style chip, e.g. for tags/tech pills.
 * `tone` picks the color pairing; rotation is deterministic per label so it
 * doesn't jitter between renders.
 */
const StickerTag = ({ children, tone = "ink", className = "" }) => {
    const rotate = rotationFor(String(children));

    return (
        <span
            style={{ transform: `rotate(${rotate}deg)` }}
            className={`inline-flex items-center whitespace-nowrap rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider shadow-sticker ${TONE_CLASSES[tone] || TONE_CLASSES.ink} ${className}`}
        >
            {children}
        </span>
    );
};

export default StickerTag;
