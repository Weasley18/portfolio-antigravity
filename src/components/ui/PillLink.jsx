import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const VARIANT_CLASSES = {
    solid: "bg-garnet text-white border-transparent hover:brightness-110",
    outline: "bg-transparent text-ink border-border hover:border-accent-warm hover:text-accent-warm",
};

/**
 * A pill-shaped CTA. Renders a react-router <Link> for internal paths, or a
 * plain <a> for external URLs (http/https/mailto/tel).
 */
const PillLink = ({ to, href, children, variant = "solid", icon = true, className = "", ...rest }) => {
    const classes = `inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm md:text-base font-medium transition-colors duration-300 ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.solid} ${className}`;

    const content = (
        <>
            {children}
            {icon && <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />}
        </>
    );

    if (href) {
        const isExternal = /^https?:\/\//.test(href);
        return (
            <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className={`group ${classes}`}
                {...rest}
            >
                {content}
            </a>
        );
    }

    return (
        <Link to={to} className={`group ${classes}`} {...rest}>
            {content}
        </Link>
    );
};

export default PillLink;
