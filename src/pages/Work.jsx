import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, ArrowRight, PlayCircle } from 'lucide-react';
import { projects, caseStudies } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import StickerTag from '../components/ui/StickerTag';
import NotebookCard from '../components/ui/NotebookCard';
import Tilt3D from '../components/ui/Tilt3D';
import VideoModal from '../components/ui/VideoModal';

const flagshipProjects = projects.filter((p) => p.isFlagship);
const otherProjects = projects.filter((p) => !p.isFlagship);

const linkClass =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:border-accent-warm hover:text-accent-warm transition-colors';

const FlagshipCard = ({ project, index, prefersReducedMotion }) => {
    const cs = caseStudies[project.slug];

    return (
        <motion.div {...revealOnView(prefersReducedMotion, { delay: index * 0.06 })}>
            <Tilt3D max={6}>
            <NotebookCard as={Link} to={`/work/${project.slug}`} className="block h-full p-6 md:p-7 overflow-hidden">
                <span className="kit-number absolute right-5 top-3 font-display font-extrabold text-[6.5rem] leading-none select-none" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="relative">
                    <p className="font-mono text-xs text-text-secondary mb-2">{project.date}</p>
                    <h3 className="text-4xl font-display font-bold uppercase tracking-tight leading-none mb-1">{project.title}</h3>
                    <p className="text-sm text-text-secondary mb-3">{project.subtitle}</p>
                    <p className="text-text-secondary mb-5 leading-relaxed">{cs?.tagline || project.summary}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                        {project.tags.map((tag, i) => (
                            <StickerTag key={tag} tone={i === 0 ? 'warm' : 'cool'}>{tag}</StickerTag>
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
};

const LightCard = ({ project, index, prefersReducedMotion, onVideo }) => (
    <motion.div {...revealOnView(prefersReducedMotion, { delay: index * 0.04 })} className="col-span-1 md:col-span-3">
        <NotebookCard className="h-full p-6 flex flex-col hover:!translate-y-0">
            <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="text-2xl font-display font-bold uppercase tracking-tight leading-none">{project.title}</h3>
                <span className="font-mono text-[11px] text-text-secondary shrink-0 pt-1">{project.date}</span>
            </div>
            <p className="text-sm text-text-secondary mb-4">{project.subtitle}</p>
            <div className="flex flex-wrap gap-2 mb-5">
                {project.tags.map((tag) => (
                    <StickerTag key={tag} tone="ink">{tag}</StickerTag>
                ))}
            </div>
            <ul className="space-y-2 text-sm text-text-secondary mb-5">
                {project.description.slice(0, 2).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="mt-2 w-1 h-1 rounded-full bg-accent-cool flex-shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
            <div className="flex flex-wrap gap-2 mt-auto">
                {project.slug && caseStudies[project.slug] && (
                    <Link to={`/work/${project.slug}`} className={`${linkClass} text-accent-warm`}>
                        Case study <ArrowRight size={13} />
                    </Link>
                )}
                {project.videoPdfLink && (
                    <button type="button" onClick={() => onVideo(project)} className={linkClass}>
                        <PlayCircle size={13} /> Watch
                    </button>
                )}
                {project.githubRepoLink && (
                    <a href={project.githubRepoLink} target="_blank" rel="noreferrer" className={linkClass}>
                        <Github size={13} /> Repo
                    </a>
                )}
                {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noreferrer" className={linkClass}>
                        <ExternalLink size={13} /> Live
                    </a>
                )}
            </div>
        </NotebookCard>
    </motion.div>
);

const Work = () => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [video, setVideo] = useState(null);

    return (
        <div className="py-6 md:py-10">
            <motion.div {...revealOnView(prefersReducedMotion)} className="mb-12 md:mb-16 max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">The squad</p>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight leading-none mb-5">Work</h1>
                <p className="text-lg text-text-secondary font-light">
                    Four projects get the full write-up: problem, approach, architecture, results. The rest are earlier
                    builds and hackathon projects I learned a lot from.
                </p>
            </motion.div>

            <div className="mb-16 md:mb-20">
                <SectionHeading index="01" kicker="Case studies" title="Starting XI" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {flagshipProjects.map((project, index) => (
                        <FlagshipCard key={project.slug} project={project} index={index} prefersReducedMotion={prefersReducedMotion} />
                    ))}
                </div>
            </div>

            <div>
                <SectionHeading index="02" kicker="More builds" title="The Bench" />
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {otherProjects.map((project, index) => (
                        <LightCard key={project.title} project={project} index={index} prefersReducedMotion={prefersReducedMotion} onVideo={setVideo} />
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {video && <VideoModal link={video.videoPdfLink} title={`${video.title} — demo`} onClose={() => setVideo(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default Work;
