import { motion } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import { revealOnView } from "../../lib/motion";

/**
 * A numbered section wrapper for a case study page: "01 — The Problem", etc.
 */
const CaseStudySection = ({ index, title, aside, children, className = "", id }) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <motion.section id={id} {...revealOnView(prefersReducedMotion)} className={`scroll-mt-28 py-8 md:py-10 border-t border-border ${className}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-5 md:mb-6">
                <span className="font-mono text-xs text-accent-warm">{index}</span>
                <h2 className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tight">{title}</h2>
                {aside && <p className="basis-full md:basis-auto md:ml-auto md:max-w-md text-sm text-text-secondary md:text-right">{aside}</p>}
            </div>
            {children}
        </motion.section>
    );
};

export default CaseStudySection;
