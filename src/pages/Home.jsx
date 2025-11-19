import { motion } from 'framer-motion';
import { personalInfo } from '../data';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-[80vh] flex flex-col justify-center">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <h1 className="text-7xl md:text-9xl font-display font-bold mb-8 tracking-tighter leading-none">
                    {personalInfo.name}
                </h1>
                <h2 className="text-2xl md:text-3xl text-text-secondary mb-12 max-w-2xl font-light leading-relaxed">
                    {personalInfo.tagline}
                </h2>
                <div className="flex gap-8">
                    <Link to="/projects" className="group flex items-center gap-3 text-xl font-medium hover:text-text-secondary transition-colors">
                        View Work
                        <motion.span
                            className="group-hover:translate-x-2 transition-transform duration-300"
                        >
                            <ArrowRight size={24} />
                        </motion.span>
                    </Link>
                    <Link to="/contact" className="group flex items-center gap-3 text-xl font-medium text-text-secondary hover:text-text-primary transition-colors">
                        Contact Me
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
