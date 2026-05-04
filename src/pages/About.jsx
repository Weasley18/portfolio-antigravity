import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { education, skills, certifications } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const Section = ({ title, children, delay = 0, disableAnimation = false }) => (
    <motion.div
        initial={disableAnimation ? false : { opacity: 0, y: 20 }}
        animate={disableAnimation ? false : { opacity: 1, y: 0 }}
        transition={disableAnimation ? undefined : { duration: 0.5, delay }}
        className="mb-20"
    >
        <h3 className="text-3xl font-display font-bold mb-8 border-b border-border pb-4">{title}</h3>
        {children}
    </motion.div>
);

const About = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    const sectionDisableAnimation = useMemo(() => prefersReducedMotion, [prefersReducedMotion]);

    return (
        <div className="py-12">
            <motion.h1
                initial={sectionDisableAnimation ? false : { opacity: 0, y: 20 }}
                animate={sectionDisableAnimation ? false : { opacity: 1, y: 0 }}
                transition={sectionDisableAnimation ? undefined : { duration: 0.5, ease: 'easeOut' }}
                className="text-5xl md:text-7xl font-display font-bold mb-16 tracking-tight"
            >
                About Me
            </motion.h1>

            <Section title="Education" delay={0.1} disableAnimation={sectionDisableAnimation}>
                <div className="grid gap-12">
                    {education.map((edu, index) => (
                        <div key={index} className="flex flex-col md:flex-row justify-between md:items-start gap-4 group">
                            <div>
                                <h4 className="text-2xl font-semibold mb-1 group-hover:text-text-secondary transition-colors">{edu.institution}</h4>
                                <p className="text-lg text-text-secondary">{edu.degree}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="font-medium text-lg">{edu.year}</p>
                                <p className="text-base text-text-secondary">{edu.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Skills" delay={0.2} disableAnimation={sectionDisableAnimation}>
                <div className="grid md:grid-cols-2 gap-12">
                    {Object.entries(skills).map(([category, items]) => (
                        <div key={category}>
                            <h4 className="text-xl font-semibold capitalize mb-6 text-text-secondary">{category}</h4>
                            <div className="flex flex-wrap gap-3">
                                {items.map((skill) => (
                                    <span key={skill} className="px-4 py-2 bg-accent/50 border border-border rounded-lg text-sm font-medium hover:bg-accent hover:scale-105 transition-all duration-300 cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Certifications & Achievements" delay={0.3} disableAnimation={sectionDisableAnimation}>
                <ul className="space-y-4 text-lg text-text-secondary">
                    {certifications.map((cert, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="mt-2 w-1.5 h-1.5 bg-text-primary rounded-full flex-shrink-0" />
                            {cert}
                        </li>
                    ))}
                </ul>
            </Section>
        </div>
    );
};

export default About;
