import { motion } from "framer-motion";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import { revealOnView } from "../../lib/motion";

/**
 * A vertical timeline of experience entries, with a git-commit-style dot
 * marking each role.
 */
const Timeline = ({ items }) => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="space-y-14 md:space-y-16">
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    {...revealOnView(prefersReducedMotion, { delay: index * 0.05 })}
                    className="grid md:grid-cols-[1fr_2fr] gap-6 md:gap-16 group"
                >
                    <div className="md:text-right">
                        <h3 className="text-xl md:text-2xl font-display font-semibold group-hover:text-accent-warm transition-colors">
                            {item.company}
                        </h3>
                        <p className="text-base md:text-lg text-text-secondary mb-2 font-medium">{item.role}</p>
                        <p className="text-xs font-mono uppercase tracking-wider text-text-secondary/80">{item.duration}</p>
                        <p className="text-sm text-text-secondary mt-1">{item.location}</p>
                    </div>
                    <div className="relative border-l-2 border-dashed border-border pl-6 md:pl-12 py-1">
                        <span className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-accent-warm ring-4 ring-bg-primary" />
                        <ul className="space-y-3 text-sm md:text-base text-text-secondary leading-relaxed">
                            {item.description.map((line, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-2 w-1 h-1 rounded-full bg-accent-cool flex-shrink-0" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default Timeline;
