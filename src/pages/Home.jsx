import { motion } from 'framer-motion';
import { personalInfo } from '../data';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const Home = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="min-h-[80vh] flex items-center">
            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.7, ease: "easeOut" }}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-10 md:gap-16 w-full"
            >
                {/* Left: Name + About Me */}
                <div className="max-w-xl">
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-display font-bold tracking-tighter leading-none text-balance mb-2">
                        {personalInfo.name}
                    </h1>
                    <h2 className="text-sm font-medium uppercase tracking-widest text-text-secondary mb-4">
                        About Me
                    </h2>
                    <p className="text-base md:text-2xl text-text-secondary mb-10 md:mb-12 font-light leading-relaxed">
                        {personalInfo.tagline}
                    </p>
                    <div className="flex flex-wrap gap-4 md:gap-8">
                        <Link to="/projects" className="group flex items-center gap-3 text-lg md:text-xl font-medium hover:text-text-secondary transition-colors">
                            View Work
                            <motion.span
                                className="group-hover:translate-x-2 transition-transform duration-300"
                            >
                                <ArrowRight size={24} />
                            </motion.span>
                        </Link>
                        <Link to="/contact" className="group flex items-center gap-3 text-lg md:text-xl font-medium text-text-secondary hover:text-text-primary transition-colors">
                            Contact Me
                        </Link>
                    </div>
                </div>

                {/* Right: Picture + Details, pushed to the far edge */}
                <div className="flex flex-col items-center md:items-end md:ml-auto shrink-0">
                    <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden mb-6">
                        <img
                            src={personalInfo.image}
                            alt={personalInfo.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-text-secondary space-y-1 text-center md:text-right text-sm md:text-base">
                        <p className="text-base md:text-lg font-medium text-text-primary">{personalInfo.role}</p>
                        <p>{personalInfo.location}</p>
                        <p className="break-all">{personalInfo.email}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
