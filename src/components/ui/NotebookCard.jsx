/**
 * The base card surface for project cards, contact tiles and similar blocks.
 */
const NotebookCard = ({ children, className = "", as: Component = "div", ...rest }) => (
    <Component
        className={`group relative bg-bg-elevated border border-border rounded-2xl shadow-paper transition-all duration-300 hover:-translate-y-1 hover:border-accent-warm ${className}`}
        {...rest}
    >
        {children}
    </Component>
);

export default NotebookCard;
