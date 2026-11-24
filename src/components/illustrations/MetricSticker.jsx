import AnimatedValue from "../ui/AnimatedValue";
import Tilt3D from "../ui/Tilt3D";

/**
 * A stat tile: tilts in 3D, and the number rolls up when it scrolls into
 * view. `compact` is the smaller version used in a case study's overview.
 */
const MetricSticker = ({ value, label, compact = false }) => (
    <Tilt3D max={6} className={`group overflow-hidden bg-bg-elevated border border-border rounded-2xl ${compact ? "px-4 py-4" : "px-5 py-6 md:px-6 md:py-7"}`}>
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-garnet" aria-hidden="true" />
        <p className={`font-display font-bold text-ink leading-none ${compact ? "text-3xl md:text-4xl mb-2" : "text-4xl md:text-5xl mb-3"}`}>
            <AnimatedValue value={value} />
        </p>
        <p className={`text-text-secondary leading-snug ${compact ? "text-xs" : "text-sm"}`}>{label}</p>
    </Tilt3D>
);

export default MetricSticker;
