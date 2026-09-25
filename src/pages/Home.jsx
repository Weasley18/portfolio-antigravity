import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { personalInfo, projects, caseStudies } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import PillLink from '../components/ui/PillLink';
import ResumeButton from '../components/ui/ResumeButton';
import StickerTag from '../components/ui/StickerTag';
import StatBadge from '../components/ui/StatBadge';
import SectionHeading from '../components/ui/SectionHeading';
import AnnotationText from '../components/ui/AnnotationText';
import NotebookCard from '../components/ui/NotebookCard';
import GitBadge from '../components/illustrations/GitBadge';
import { ArrowRight } from 'lucide-react';

const flagshipProjects = projects.filter((p) => p.isFlagship);

const Home = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="pb-16">
            {/* Hero */}
            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.7, ease: 'easeOut' }}
                className="min-h-[70vh] flex flex-col md:flex-row md:items-center md:justify-between gap-14 md:gap-16 w-full py-8 md:py-12"
            >
                {/* Left: name + tagline */}
                <div className="max-w-xl">
                    <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">
                        Bengaluru · Open to internships
                    </p>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-semibold tracking-tight leading-[1.02] text-balance mb-3">
                        {personalInfo.name}
                    </h1>
                    <p className="mb-6">
                        <AnnotationText>building courtroom AI, fintech AI &amp; a few things in between</AnnotationText>
                    </p>
                    <p className="text-base md:text-xl text-text-secondary mb-10 font-light leading-relaxed">
                        {personalInfo.tagline}
                    </p>
                    <div className="flex flex-wrap items-center gap-4">
                        <PillLink to="/work" variant="solid">View the Work</PillLink>
                        <ResumeButton variant="outline" />
                        <Link to="/contact" className="text-sm md:text-base font-medium text-text-secondary hover:text-accent-warm transition-colors">
                            Contact me
                        </Link>
                    </div>
                </div>

                {/* Right: polaroid photo + collage stickers */}
                <div className="relative flex flex-col items-center md:items-end md:ml-auto shrink-0 pt-4 md:pt-0">
                    <div className="absolute -top-3 -left-4 md:-left-8 z-10">
                        <StickerTag tone="warm">Bengaluru, IN</StickerTag>
                    </div>
                    <div className="absolute -bottom-4 -right-2 md:-right-6 z-10">
                        <GitBadge label="shipping" />
                    </div>
                    <div
                        style={{ transform: 'rotate(-3deg)' }}
                        className="w-56 sm:w-64 md:w-80 bg-bg-elevated border border-border p-3 pb-6 rounded-sm shadow-paper"
                    >
                        <div className="w-full aspect-[3/4] overflow-hidden rounded-sm bg-bg-secondary">
                            <img
                                src={personalInfo.image}
                                alt={personalInfo.name}
                                width="675"
                                height="900"
                                loading="eager"
                                decoding="async"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <p className="mt-4 text-center font-handwritten text-lg text-ink/80">{personalInfo.role}</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats strip */}
            <motion.div
                {...revealOnView(prefersReducedMotion)}
                className="flex flex-wrap gap-x-10 gap-y-6 py-10 md:py-14 border-y border-border"
            >
                {personalInfo.stats.map((stat) => (
                    <StatBadge key={stat.label} value={stat.value} label={stat.label} />
                ))}
            </motion.div>

            {/* Selected work */}
            <div className="py-16 md:py-24">
                <SectionHeading index="01" title="Selected Work" />
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {flagshipProjects.map((project, index) => {
                        const cs = caseStudies[project.slug];
                        return (
                            <motion.div key={project.slug} {...revealOnView(prefersReducedMotion, { delay: index * 0.08 })}>
                                <NotebookCard
                                    as={Link}
                                    to={`/work/${project.slug}`}
                                    rotate={index % 2 === 0 ? -1 : 1}
                                    torn
                                    className="block h-full p-6 md:p-8"
                                >
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h3 className="text-2xl md:text-3xl font-display font-semibold">{project.title}</h3>
                                        <span className="font-mono text-xs text-text-secondary shrink-0 pt-2">{project.date}</span>
                                    </div>
                                    <p className="text-text-secondary mb-6 leading-relaxed">{cs?.tagline || project.summary}</p>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {project.tags.map((tag) => (
                                            <StickerTag key={tag} tone={tag === 'AI' ? 'warm' : 'cool'}>{tag}</StickerTag>
                                        ))}
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-warm">
                                        Read case study <ArrowRight size={16} />
                                    </span>
                                </NotebookCard>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="mt-10 text-center">
                    <PillLink to="/work" variant="outline">See all work</PillLink>
                </div>
            </div>

            {/* About teaser */}
            <motion.div {...revealOnView(prefersReducedMotion)} className="py-16 md:py-20 border-t border-border">
                <SectionHeading index="02" title="A little about me" />
                <p className="max-w-2xl text-lg md:text-xl text-text-secondary font-light leading-relaxed mb-6">
                    I'm a pre-final-year CS student still figuring out what makes software good — I've interned at Firedesk,
                    dabbled in graph theory and EEG research, and try to keep a side project going whenever I can.
                </p>
                <PillLink to="/about" variant="outline">More about me</PillLink>
            </motion.div>

            {/* Closing CTA */}
            <motion.div
                {...revealOnView(prefersReducedMotion)}
                className="py-16 md:py-24 text-center border-t border-border"
            >
                <p className="font-handwritten text-2xl text-accent-warm mb-3">say hi?</p>
                <h2 className="text-3xl md:text-5xl font-display font-semibold tracking-tight mb-8">
                    Let's build something worth shipping.
                </h2>
                <PillLink to="/contact" variant="solid">Get in touch</PillLink>
            </motion.div>
        </div>
    );
};

export default Home;
