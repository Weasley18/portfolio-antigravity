/**
 * A pure-CSS device bezel wrapper, reusable for any mobile-project hero.
 */
const PhoneFrame = ({ children, className = "" }) => (
    <div className={`relative mx-auto w-full max-w-[280px] ${className}`}>
        <div className="relative rounded-[2.25rem] border-[6px] border-ink bg-ink shadow-paper overflow-hidden aspect-[9/19]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-ink rounded-b-xl z-10" />
            <div className="w-full h-full bg-bg-elevated overflow-y-auto">{children}</div>
        </div>
    </div>
);

/**
 * A single chat bubble for a phone-frame chat mockup illustration.
 */
export const ChatBubble = ({ from = "agent", lang, text }) => {
    const isUser = from === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-3 py-1.5`}>
            <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-snug ${
                    isUser
                        ? "bg-accent-cool text-white rounded-br-sm"
                        : "bg-bg-secondary text-ink rounded-bl-sm"
                }`}
            >
                {lang && (
                    <span className="block font-mono text-[9px] uppercase tracking-wider opacity-60 mb-0.5">
                        {lang}
                    </span>
                )}
                {text}
            </div>
        </div>
    );
};

export default PhoneFrame;
