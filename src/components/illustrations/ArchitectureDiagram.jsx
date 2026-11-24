import { ChevronDown } from "lucide-react";

const TONE_CLASSES = {
    warm: "border-accent-warm/50 bg-accent-warmSoft text-accent-warm",
    cool: "border-accent-cool/50 bg-accent-coolSoft text-accent-cool",
    ink: "border-border bg-bg-elevated text-ink",
};

const Node = ({ label, sublabel, tone = "ink" }) => (
    <div
        className={`rounded-lg border px-3 md:px-4 py-2.5 md:py-3 text-center shadow-paper ${TONE_CLASSES[tone] || TONE_CLASSES.ink}`}
    >
        <p className="font-mono text-xs md:text-sm font-medium leading-tight">{label}</p>
        {sublabel && <p className="mt-0.5 text-[10px] md:text-xs text-text-secondary leading-tight">{sublabel}</p>}
    </div>
);

/**
 * A row-based architecture/data-flow diagram: each row is a horizontal band
 * of nodes (a single node, or several for a fan-out), connected top-to-bottom
 * by an arrow. Deliberately avoids runtime DOM measurement — rows stack and
 * wrap responsively via flexbox, no absolute-positioned SVG paths needed.
 */
const ArchitectureDiagram = ({ rows = [] }) => (
    <div className="flex flex-col items-center gap-1.5 py-2">
        {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="w-full flex flex-col items-center">
                {rowIndex > 0 && (
                    <div className="flex flex-col items-center py-1 text-text-secondary/70">
                        <ChevronDown size={18} strokeWidth={1.5} />
                    </div>
                )}
                <div className="flex flex-wrap justify-center gap-3 md:gap-4 w-full">
                    {row.nodes.map((node, nodeIndex) => (
                        <Node key={nodeIndex} {...node} />
                    ))}
                </div>
                {row.fanLabel && (
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-gold">{row.fanLabel}</p>
                )}
            </div>
        ))}
    </div>
);

export default ArchitectureDiagram;
