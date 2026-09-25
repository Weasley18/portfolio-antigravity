import { rotationFor } from "../../lib/hash";

/**
 * A torn-sticky-note stat callout, used in a case study's Results section.
 */
const MetricSticker = ({ value, label, index = 0 }) => {
    const rotate = rotationFor(`${value}-${label}-${index}`);

    return (
        <div
            style={{ transform: `rotate(${rotate}deg)` }}
            className="relative torn-edge bg-accent-warmSoft border border-accent-warm/30 rounded-lg shadow-sticker px-5 py-6 md:px-6 md:py-8"
        >
            <p className="font-display text-2xl md:text-3xl font-semibold text-accent-warm leading-none mb-2">{value}</p>
            <p className="text-sm text-ink/80 leading-snug">{label}</p>
        </div>
    );
};

export default MetricSticker;
