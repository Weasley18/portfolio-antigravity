import { motion } from 'framer-motion';
import { projects } from '../data';
import { ExternalLink, Github } from 'lucide-react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const Projects = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-12">
            <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.5, ease: 'easeOut' }}
                className="text-4xl md:text-7xl font-display font-bold mb-10 md:mb-16 tracking-tight"
            >
                Projects
            </motion.h1>

            <div className="grid gap-12">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                        animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                        transition={prefersReducedMotion ? undefined : { duration: 0.45, ease: 'easeOut', delay: index * 0.06 }}
                        className="group border border-border p-5 md:p-12 rounded-2xl hover:border-text-secondary/50 bg-bg-secondary/30 hover:bg-bg-secondary/50 transition-all duration-500"
                    >
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-8">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-display font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">{project.title}</h3>
                                <p className="text-xl text-text-secondary">{project.subtitle}</p>
                            </div>
                            <span className="text-sm font-medium px-4 py-2 bg-bg-primary border border-border rounded-full self-start whitespace-nowrap">
                                {project.date}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-3 mb-8">
                            {project.tags.map((tag) => (
                                <span key={tag} className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 border border-border rounded bg-bg-primary/50">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <ul className="space-y-3 text-base md:text-lg text-text-secondary mb-8">
                            {project.description.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-2.5 w-1.5 h-1.5 bg-text-secondary rounded-full flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>

                        {(project.videoPdfLink || project.githubRepoLink) && (
                            <div className="flex flex-wrap gap-3">
                                {project.videoPdfLink && (
                                    <a
                                        href={project.videoPdfLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-bg-primary/70 text-sm font-medium text-text-primary hover:border-text-secondary/60 hover:bg-bg-primary transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                        Video / PDF
                                    </a>
                                )}
                                {project.githubRepoLink && (
                                    <a
                                        href={project.githubRepoLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-bg-primary/70 text-sm font-medium text-text-primary hover:border-text-secondary/60 hover:bg-bg-primary transition-colors"
                                    >
                                        <Github size={16} />
                                        GitHub Repo
                                    </a>
                                )}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
