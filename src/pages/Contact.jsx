import { motion } from 'framer-motion';
import { personalInfo } from '../data';
import { Mail, Phone, Linkedin, Github, MapPin } from 'lucide-react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import NotebookCard from '../components/ui/NotebookCard';
import ResumeButton from '../components/ui/ResumeButton';
import Tilt3D from '../components/ui/Tilt3D';
import Football from '../components/three/Football';

const ContactItem = ({ icon: Icon, label, value, href }) => (
    <Tilt3D max={6} glare={false}>
    <NotebookCard
        as="a"
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="flex items-center gap-4 md:gap-6 p-5 md:p-7 group min-w-0"
    >
        <div className="p-3 md:p-4 bg-accent-warmSoft text-accent-warm rounded-full group-hover:bg-garnet group-hover:text-white transition-colors duration-300 shrink-0">
            <Icon className="size-5 md:size-6" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">{label}</p>
            <p className="text-base md:text-xl font-semibold break-all group-hover:text-accent-warm transition-colors duration-300">{value}</p>
        </div>
    </NotebookCard>
    </Tilt3D>
);

const Contact = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-8 md:py-12">
            <div className="mb-12 md:mb-16 grid md:grid-cols-[1fr_auto] items-center gap-8">
            <motion.div {...revealOnView(prefersReducedMotion)} className="max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">Kick-off</p>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight leading-none mb-5">Get in touch</h1>
                <p className="text-lg text-text-secondary font-light">
                    Hiring, building something, or just want to talk football and backend systems? My inbox is open.
                </p>
            </motion.div>
                <div className="relative mx-auto md:mx-0">
                    <Football className="w-60 h-60 md:w-72 md:h-72" />
                    <p className="text-center font-mono text-[10px] uppercase tracking-widest text-text-secondary -mt-2">Drag to spin · click to kick</p>
                </div>
            </div>

            <motion.div {...revealOnView(prefersReducedMotion, { delay: 0.05 })} className="grid md:grid-cols-2 gap-6 mb-10">
                <ContactItem icon={Mail} label="Email" value={personalInfo.email} href={`mailto:${personalInfo.email}`} />
                <ContactItem icon={Phone} label="Phone" value={personalInfo.phone} href={`tel:${personalInfo.phone}`} />
                <ContactItem icon={Linkedin} label="LinkedIn" value="linkedin.com/in/harshringsia" href={personalInfo.linkedin} />
                <ContactItem icon={Github} label="GitHub" value="github.com/Weasley18" href={personalInfo.github} />
            </motion.div>

            <motion.div
                {...revealOnView(prefersReducedMotion, { delay: 0.1 })}
                className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-border"
            >
                <div className="flex items-center gap-3 text-text-secondary">
                    <MapPin size={20} />
                    <p>{personalInfo.location}</p>
                </div>
                <ResumeButton variant="outline" />
            </motion.div>
        </div>
    );
};

export default Contact;
