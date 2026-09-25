import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { projects, caseStudies } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import StickerTag from '../components/ui/StickerTag';
import NotebookCard from '../components/ui/NotebookCard';

const flagshipProjects = projects.filter((p) => p.isFlagship);
const otherProjects = projects.filter((p) => !p.isFlagship);

const FlagshipCard = ({ project, index, prefersReducedMotion }) => {
    const cs = caseStudies[project.slug];

    return (
        <motion.div {...revealOnView(prefersReducedMotion, { delay: index * 0.08 })}>
            <NotebookCard as={Link} to={`/work/${project.slug}`} rotate={index % 2 === 0 ? -1 : 1} torn className="block h-full p-6 md:p-7">
                <p className="font-mono text-xs text-text-secondary mb-2">{project.date}</p>
                <h3 className="text-2xl md:text-3xl font-display font-semibold mb-2">{project.title}</h3>
                <p className="text-text-secondary mb-4 leading-relaxed">{cs?.tagline || project.summary}</p>
                <div className="flex flex-wrap gap-2 mb-4">
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
};

const LightCard = ({ project, index, prefersReducedMotion }) => (
    <motion.div
        {...revealOnView(prefersReducedMotion, { delay: index * 0.06 })}
        className="col-span-1 md:col-span-3"
    >
        <NotebookCard className="h-full p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-xl font-display font-semibold">{project.title}</h3>
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
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-accent-cool flex-shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
            {(project.videoPdfLink || project.githubRepoLink) && (
                <div className="flex flex-wrap gap-2">
                    {project.videoPdfLink && (
                        <a href={project.videoPdfLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:border-accent-warm hover:text-accent-warm transition-colors">
                            <ExternalLink size={13} /> Video / PDF
                        </a>
                    )}
                    {project.githubRepoLink && (
                        <a href={project.githubRepoLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium hover:border-accent-warm hover:text-accent-warm transition-colors">
                            <Github size={13} /> Repo
                        </a>
                    )}
                </div>
            )}
        </NotebookCard>
    </motion.div>
);

const Work = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-6 md:py-10">
            <motion.div {...revealOnView(prefersReducedMotion)} className="mb-10 md:mb-12 max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">Case Files</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold tracking-tight mb-4">Work</h1>
                <p className="text-lg text-text-secondary font-light">
                    Four projects get a fuller write-up — problem, approach, architecture, results. The rest are smaller builds,
                    hackathon projects, and experiments I learned a lot from.
                </p>
            </motion.div>

            <div className="mb-14 md:mb-16">
                <SectionHeading index="01" title="Case Studies" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    {flagshipProjects.map((project, index) => (
                        <FlagshipCard key={project.slug} project={project} index={index} prefersReducedMotion={prefersReducedMotion} />
                    ))}
                </div>
            </div>

            <div>
                <SectionHeading index="02" title="More Builds" />
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {otherProjects.map((project, index) => (
                        <LightCard key={project.title} project={project} index={index} prefersReducedMotion={prefersReducedMotion} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Work;
