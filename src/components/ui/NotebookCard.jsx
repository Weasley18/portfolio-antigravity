/**
 * A generic "paper card" — the base surface for project cards, contact
 * tiles, and sticky-note style content throughout the site.
 */
const NotebookCard = ({ children, className = "", rotate = 0, torn = false, as: Component = "div", ...rest }) => {
    return (
        <Component
            style={rotate ? { transform: `rotate(${rotate}deg)` } : undefined}
            className={`relative bg-bg-elevated border border-border rounded-xl shadow-paper transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-warm/40 hover:shadow-xl ${torn ? "torn-edge" : ""} ${className}`}
            {...rest}
        >
            {children}
        </Component>
    );
};

export default NotebookCard;
