import { motion } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import { revealOnView } from "../../lib/motion";

/**
 * A numbered section wrapper for a case study page: "01 — The Problem", etc.
 */
const CaseStudySection = ({ index, title, children, className = "" }) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <motion.section {...revealOnView(prefersReducedMotion)} className={`py-10 md:py-14 border-t border-border ${className}`}>
            <div className="flex items-baseline gap-3 mb-6 md:mb-8">
                <span className="font-mono text-xs text-text-secondary/70">{index}</span>
                <h2 className="text-2xl md:text-4xl font-display font-semibold tracking-tight">{title}</h2>
            </div>
            {children}
        </motion.section>
    );
};

export default CaseStudySection;
