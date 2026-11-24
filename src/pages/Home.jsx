import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { personalInfo, projects, caseStudies, experience } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import PillLink from '../components/ui/PillLink';
import ResumeButton from '../components/ui/ResumeButton';
import StickerTag from '../components/ui/StickerTag';
import StatBadge from '../components/ui/StatBadge';
import SectionHeading from '../components/ui/SectionHeading';
import NotebookCard from '../components/ui/NotebookCard';
import HeroField from '../components/three/HeroField';
import Tilt3D from '../components/ui/Tilt3D';

const flagshipProjects = projects.filter((p) => p.isFlagship);

const Home = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="pb-16">
            {/* Hero: an energy core that assembles itself, built in three.js */}
            <section className="relative -mt-6 md:-mt-8 rounded-3xl overflow-hidden border border-border min-h-[78svh] md:min-h-[82vh] flex items-end text-[#EEF2FB]">
                <HeroField />
                {/* Legibility scrims */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050913] via-[#050913]/55 to-transparent md:bg-gradient-to-r md:from-[#050913]/90 md:via-[#050913]/45 md:to-transparent pointer-events-none" />

                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                    animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? undefined : { duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="relative z-10 w-full max-w-2xl p-6 sm:p-10 md:p-14"
                >
                    <p className="font-mono text-[11px] md:text-xs uppercase tracking-widest text-[#EDBB00] mb-4">
                        Bengaluru · Software Engineer · Class of 2027
                    </p>
                    <h1 className="font-display font-extrabold uppercase tracking-tight leading-[0.88] text-6xl sm:text-7xl md:text-8xl lg:text-9xl mb-5">
                        Harsh
                        <br />
                        Ringsia
                    </h1>
                    <p className="text-base md:text-xl text-[#C9D2E8] font-light leading-relaxed mb-8 max-w-xl">
                        {personalInfo.tagline}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                        <PillLink to="/work" variant="solid">
                            See the work
                        </PillLink>
                        <ResumeButton variant="outline" className="!text-[#EEF2FB] !border-white/25 hover:!border-white/60" />
                    </div>
                </motion.div>

                <p className="absolute right-4 bottom-3 md:right-6 md:bottom-5 z-10 hidden sm:block font-mono text-[10px] uppercase tracking-widest text-white/40">
                    Core online · click to pulse · built in code with three.js
                </p>
            </section>

            {/* Season stats */}
            <motion.div {...revealOnView(prefersReducedMotion)} className="py-12 md:py-16">
                <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-6">Season stats</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
                    {personalInfo.stats.map((stat) => (
                        <StatBadge key={stat.label} value={stat.value} label={stat.label} />
                    ))}
                </div>
            </motion.div>

            <div className="stripe-rule" aria-hidden="true" />

            {/* Starting XI */}
            <section className="py-16 md:py-24">
                <SectionHeading index="01" kicker="Selected work" title="Starting XI" />
                <div className="grid md:grid-cols-2 gap-5 md:gap-6">
                    {flagshipProjects.map((project, index) => {
                        const cs = caseStudies[project.slug];
                        return (
                            <motion.div key={project.slug} {...revealOnView(prefersReducedMotion, { delay: index * 0.06 })}>
                                <Tilt3D max={7}>
                                <NotebookCard as={Link} to={`/work/${project.slug}`} className="block h-full p-6 md:p-8 overflow-hidden">
                                    <span className="kit-number absolute right-5 top-3 font-display font-extrabold text-[7rem] leading-none select-none transition-colors" aria-hidden="true">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <div className="relative">
                                        <p className="font-mono text-xs text-text-secondary mb-3">{project.date}</p>
                                        <h3 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight leading-none mb-3">
                                            {project.title}
                                        </h3>
                                        <p className="text-text-secondary mb-6 leading-relaxed max-w-md">{cs?.tagline || project.summary}</p>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {project.tags.map((tag, i) => (
                                                <StickerTag key={tag} tone={i === 0 ? 'warm' : 'cool'}>
                                                    {tag}
                                                </StickerTag>
                                            ))}
                                        </div>
                                        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-accent-warm">
                                            Case study <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </div>
                                </NotebookCard>
                                </Tilt3D>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="mt-10">
                    <PillLink to="/work" variant="outline">
                        The full squad
                    </PillLink>
                </div>
            </section>

            {/* Career teaser */}
            <motion.section {...revealOnView(prefersReducedMotion)} className="py-16 md:py-20 border-t border-border">
                <SectionHeading index="02" kicker="Experience" title="Career" />
                <ul className="divide-y divide-border border-y border-border mb-8">
                    {experience.map((item) => (
                        <li key={item.company} className="py-5 grid md:grid-cols-[1fr_1.2fr_auto] gap-1 md:gap-8 md:items-baseline">
                            <p className="font-display text-2xl font-bold uppercase tracking-tight">{item.company}</p>
                            <p className="text-text-secondary">{item.role}</p>
                            <p className="font-mono text-xs uppercase tracking-wider text-text-secondary">{item.duration}</p>
                        </li>
                    ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                    <PillLink to="/experience" variant="solid">
                        Fly through my career in 3D
                    </PillLink>
                    <PillLink to="/skills" variant="outline">
                        Spin the skill sphere
                    </PillLink>
                </div>
            </motion.section>

            {/* Closing CTA */}
            <motion.section {...revealOnView(prefersReducedMotion)} className="py-16 md:py-24 text-center border-t border-border">
                <p className="font-mono text-xs uppercase tracking-widest text-gold mb-4">Open to internships</p>
                <h2 className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tight leading-none mb-8">
                    Let&apos;s build something
                    <br className="hidden sm:block" /> worth shipping.
                </h2>
                <PillLink to="/contact" variant="solid">
                    Get in touch
                </PillLink>
            </motion.section>
        </div>
    );
};

export default Home;
