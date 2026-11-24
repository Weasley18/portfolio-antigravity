import { ArrowUpRight } from "lucide-react";

/**
 * Hero card for a playable project: a little floodlit street pitch drawn in
 * SVG, with a play-now button.
 */
const PlayCard = ({ url }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl overflow-hidden border border-border bg-[#071a12] shadow-paper"
    >
        <svg viewBox="0 0 400 240" className="block w-full" role="img" aria-label="Top-down sketch of a street football pitch">
            <defs>
                <radialGradient id="pc-flood" cx="50%" cy="50%" r="65%">
                    <stop offset="0%" stopColor="#2b7a45" />
                    <stop offset="100%" stopColor="#0b2417" />
                </radialGradient>
            </defs>
            <rect width="400" height="240" fill="url(#pc-flood)" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <rect key={i} x={20 + i * 45} y="20" width="22.5" height="200" fill="#ffffff" opacity="0.035" />
            ))}
            <g fill="none" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="2">
                <rect x="20" y="20" width="360" height="200" rx="2" />
                <line x1="200" y1="20" x2="200" y2="220" />
                <circle cx="200" cy="120" r="30" />
                <rect x="20" y="80" width="34" height="80" />
                <rect x="346" y="80" width="34" height="80" />
            </g>
            {/* Two brick goals, para-style */}
            <rect x="12" y="104" width="8" height="10" fill="#c8553d" />
            <rect x="12" y="126" width="8" height="10" fill="#c8553d" />
            <rect x="380" y="104" width="8" height="10" fill="#c8553d" />
            <rect x="380" y="126" width="8" height="10" fill="#c8553d" />
            {/* Players: home in blaugrana, away in white */}
            {[[120, 90], [150, 150], [90, 130], [240, 70], [170, 110]].map(([x, y], i) => (
                <circle key={`h${i}`} cx={x} cy={y} r="6" fill={i % 2 ? "#a50044" : "#0b57b0"} stroke="#fff" strokeWidth="1.5" />
            ))}
            {[[260, 140], [300, 100], [230, 180], [320, 160]].map(([x, y], i) => (
                <circle key={`a${i}`} cx={x} cy={y} r="6" fill="#eef2fb" stroke="#0a1022" strokeWidth="1.5" />
            ))}
            <circle cx="186" cy="114" r="3.5" fill="#edbb00" />
        </svg>
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-[#050913] text-[#EEF2FB]">
            <span className="font-display text-xl font-bold uppercase tracking-tight">Play it in your browser</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[#EDBB00]">
                Kick off <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
        </div>
    </a>
);

export default PlayCard;
