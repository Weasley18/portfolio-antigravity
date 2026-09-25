const TONE_CLASSES = {
    keyword: "text-accent-cool",
    fn: "text-accent-warm",
    string: "text-sage",
    comment: "text-text-secondary/70 italic",
    plain: "text-text-primary",
};

/**
 * An illustrative "code editor" window — traffic-light chrome + a filename
 * tab, body is a short, hand-authored, illustrative snippet (never lifted
 * verbatim from a private repo).
 */
const CodeWindow = ({ filename, language, lines = [] }) => (
    <div className="rounded-xl border border-border bg-bg-elevated shadow-paper overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-secondary/60">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-warm/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-sage/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-accent-cool/60" />
            <span className="ml-3 font-mono text-xs text-text-secondary">{filename}</span>
            {language && (
                <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-text-secondary/70">
                    {language}
                </span>
            )}
        </div>
        <pre className="px-4 md:px-5 py-4 overflow-x-auto text-[13px] md:text-sm leading-relaxed font-mono">
            {lines.map((line, i) => (
                <div key={i} className={TONE_CLASSES[line.tone] || TONE_CLASSES.plain}>
                    {line.text || " "}
                </div>
            ))}
        </pre>
    </div>
);

export default CodeWindow;
