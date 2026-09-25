import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, ArrowUp } from 'lucide-react';
import { personalInfo } from '../../data';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const Footer = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    };

    return (
        <footer className="relative z-10 border-t border-border mt-20">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 lg:px-24 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-text-secondary">
                <p>Made in Bengaluru · © {new Date().getFullYear()} Harsh Ringsia</p>

                <ul className="flex items-center gap-6 font-medium uppercase tracking-wider text-xs">
                    <li><Link to="/work" className="hover:text-accent-warm transition-colors">Work</Link></li>
                    <li><Link to="/about" className="hover:text-accent-warm transition-colors">About</Link></li>
                    <li><Link to="/contact" className="hover:text-accent-warm transition-colors">Contact</Link></li>
                </ul>

                <div className="flex items-center gap-4">
                    <a href={personalInfo.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-accent-warm transition-colors">
                        <Github size={18} />
                    </a>
                    <a href={personalInfo.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-accent-warm transition-colors">
                        <Linkedin size={18} />
                    </a>
                    <a href={`mailto:${personalInfo.email}`} aria-label="Email" className="hover:text-accent-warm transition-colors">
                        <Mail size={18} />
                    </a>
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="font-handwritten text-accent-warm text-base flex items-center gap-1 hover:underline"
                    >
                        back to top <ArrowUp size={14} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
