import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { education, experience, skills, certifications } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import AnnotationText from '../components/ui/AnnotationText';
import StickerTag from '../components/ui/StickerTag';
import Timeline from '../components/ui/Timeline';
import ResumeButton from '../components/ui/ResumeButton';

const skillTones = ['warm', 'cool'];

const About = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-8 md:py-12">
            <motion.div {...revealOnView(prefersReducedMotion)} className="mb-16 md:mb-24 max-w-3xl">
                <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">Notebook — Page 01</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold tracking-tight mb-6">About Me</h1>
                <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed mb-4">
                    I'm a pre-final-year Computer Science (Cyber Security) student, mostly interested in backend systems and
                    AI tools that hold up outside of a demo. During my internship at Firedesk, I worked on backend services
                    with JWT auth and role-based access control, helped optimize PostgreSQL schemas that cut query latency
                    by around 40%, and built reusable React components that made new features a bit quicker to ship.
                </p>
                <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed mb-6">
                    Outside of that, I like experimenting — RAG pipelines, ML models for financial risk scoring, multilingual
                    mobile apps at hackathons. <AnnotationText className="text-lg md:text-xl">I'm still learning, but I try to build things that are actually useful.</AnnotationText>
                </p>
            </motion.div>

            <section className="mb-20 md:mb-28">
                <SectionHeading index="02" title="Journey" />
                <Timeline items={experience} />
            </section>

            <section className="mb-20 md:mb-28">
                <SectionHeading index="03" title="Education" />
                <div className="grid gap-8">
                    {education.map((edu, index) => (
                        <motion.div
                            key={index}
                            {...revealOnView(prefersReducedMotion, { delay: index * 0.06 })}
                            className="flex flex-col md:flex-row justify-between md:items-start gap-2 border-b border-border pb-6"
                        >
                            <div>
                                <h4 className="text-xl md:text-2xl font-display font-semibold mb-1">{edu.institution}</h4>
                                <p className="text-text-secondary">{edu.degree}</p>
                            </div>
                            <div className="text-left md:text-right shrink-0">
                                <p className="font-mono text-sm font-medium">{edu.year}</p>
                                <p className="text-sm text-text-secondary">{edu.location}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="mb-20 md:mb-28">
                <SectionHeading index="04" title="Skills" />
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
                    {Object.entries(skills).map(([category, items], catIndex) => (
                        <motion.div key={category} {...revealOnView(prefersReducedMotion, { delay: catIndex * 0.05 })}>
                            <h4 className="text-sm uppercase tracking-wider text-text-secondary mb-4">{category}</h4>
                            <div className="flex flex-wrap gap-2.5">
                                {items.map((skill) => (
                                    <StickerTag key={skill} tone={skillTones[catIndex % 2]}>
                                        {skill}
                                    </StickerTag>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="mb-16 md:mb-20">
                <SectionHeading index="05" title="Certifications & Achievements" />
                <div className="grid sm:grid-cols-2 gap-4">
                    {certifications.map((cert, index) => (
                        <motion.div
                            key={index}
                            {...revealOnView(prefersReducedMotion, { delay: index * 0.04 })}
                            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-bg-elevated shadow-paper"
                        >
                            <Award size={18} className="text-accent-warm shrink-0 mt-0.5" />
                            <p className="text-sm text-text-secondary leading-relaxed">{cert}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <div className="text-center pt-4">
                <ResumeButton variant="solid" />
            </div>
        </div>
    );
};

export default About;
