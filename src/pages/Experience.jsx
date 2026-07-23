import { motion } from 'framer-motion';
import { experience } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const Experience = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-12">
            <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.5, ease: 'easeOut' }}
                className="text-4xl md:text-7xl font-display font-bold mb-10 md:mb-16 tracking-tight"
            >
                Experience
            </motion.h1>

            <div className="space-y-20">
                {experience.map((exp, index) => (
                    <motion.div
                        key={index}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? undefined : { duration: 0.4, ease: 'easeOut', delay: index * 0.04 }}
                        className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 group"
                    >
                        <div className="md:text-right">
                            <h3 className="text-2xl font-bold group-hover:text-text-secondary transition-colors">{exp.company}</h3>
                            <p className="text-lg text-text-secondary mb-2 font-medium">{exp.role}</p>
                            <p className="text-sm font-medium uppercase tracking-wider opacity-70">{exp.duration}</p>
                            <p className="text-sm text-text-secondary mt-1">{exp.location}</p>
                        </div>
                        <div className="relative border-l border-border pl-6 md:pl-12 py-2">
                            <span className="absolute -left-[5px] top-4 w-2.5 h-2.5 bg-text-primary rounded-full ring-4 ring-bg-primary" />
                            <ul className="space-y-4 text-base md:text-lg text-text-secondary leading-relaxed">
                                {exp.description.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Experience;
