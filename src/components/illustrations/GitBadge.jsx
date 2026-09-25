import { GitCommitHorizontal } from "lucide-react";

/**
 * A small commit-hash style sticker, used as a decorative collage element
 * and as the dot marker on Timeline entries.
 */
const GitBadge = ({ hash = "a1b2c3d", label, rotate = -4, className = "" }) => (
    <div
        style={{ transform: `rotate(${rotate}deg)` }}
        className={`inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-elevated px-2.5 py-1 font-mono text-[11px] shadow-sticker ${className}`}
    >
        <GitCommitHorizontal size={12} className="text-sage" />
        <span className="text-sage">{hash}</span>
        {label && <span className="text-text-secondary">{label}</span>}
    </div>
);

export default GitBadge;
