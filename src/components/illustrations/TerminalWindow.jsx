const TONE_CLASSES = {
    prompt: "text-accent-cool",
    pass: "text-sage",
    warn: "text-accent-warm",
    plain: "text-text-secondary",
};

/**
 * A terminal-chrome illustration with a scan-log style body and a blinking
 * cursor on the final line. Used as RedRetail's hero.
 */
const TerminalWindow = ({ title, lines = [] }) => (
    <div className="rounded-xl border border-border bg-[#1C1A16] shadow-paper overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/20">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-warm/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-sage/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cool/60" />
            <span className="ml-3 font-mono text-xs text-white/60 truncate">{title}</span>
        </div>
        <pre className="px-4 md:px-5 py-4 overflow-x-auto text-[13px] md:text-sm leading-relaxed font-mono">
            {lines.map((line, i) => (
                <div key={i} className={TONE_CLASSES[line.tone] || TONE_CLASSES.plain}>
                    {line.text || " "}
                    {i === lines.length - 1 && (
                        <span className="blinking-cursor text-white">▍</span>
                    )}
                </div>
            ))}
        </pre>
    </div>
);

export default TerminalWindow;
