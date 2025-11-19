import { motion } from 'framer-motion';
import { projects } from '../data';
import { Github } from 'lucide-react';

const Projects = () => {
    return (
        <div className="py-12">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-display font-bold mb-16 tracking-tight"
            >
                Projects
            </motion.h1>

            <div className="grid gap-12">
                {projects.map((project, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group border border-border p-8 md:p-12 rounded-2xl hover:border-text-secondary/50 bg-bg-secondary/30 hover:bg-bg-secondary/50 transition-all duration-500"
                    >
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 mb-8">
                            <div>
                                <h3 className="text-3xl font-display font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">{project.title}</h3>
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

                        <ul className="space-y-3 text-lg text-text-secondary mb-8">
                            {project.description.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-2.5 w-1.5 h-1.5 bg-text-secondary rounded-full flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Projects;
