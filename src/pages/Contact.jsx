import { motion } from 'framer-motion';
import { personalInfo } from '../data';
import { Mail, Phone, Linkedin, Github, MapPin } from 'lucide-react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import NotebookCard from '../components/ui/NotebookCard';
import ResumeButton from '../components/ui/ResumeButton';

const ContactItem = ({ icon: Icon, label, value, href, rotate }) => (
    <NotebookCard
        as="a"
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        rotate={rotate}
        className="flex items-center gap-4 md:gap-6 p-5 md:p-7 group min-w-0"
    >
        <div className="p-3 md:p-4 bg-accent-warmSoft text-accent-warm rounded-full group-hover:bg-accent-warm group-hover:text-bg-elevated transition-colors duration-300 shrink-0">
            <Icon className="size-5 md:size-6" />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-text-secondary mb-1 uppercase tracking-wider font-medium">{label}</p>
            <p className="text-base md:text-xl font-semibold break-all group-hover:text-accent-warm transition-colors duration-300">{value}</p>
        </div>
    </NotebookCard>
);

const Contact = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-8 md:py-12">
            <motion.div {...revealOnView(prefersReducedMotion)} className="mb-12 md:mb-16 max-w-2xl">
                <p className="font-handwritten text-2xl text-accent-warm mb-2 -rotate-2 inline-block">say hi</p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold tracking-tight mb-4">Get in Touch</h1>
                <p className="text-lg text-text-secondary font-light">
                    Got a project, a hard problem, or just want to talk shop? My inbox is open.
                </p>
            </motion.div>

            <motion.div {...revealOnView(prefersReducedMotion, { delay: 0.05 })} className="grid md:grid-cols-2 gap-6 mb-10">
                <ContactItem icon={Mail} label="Email" value={personalInfo.email} href={`mailto:${personalInfo.email}`} rotate={-1} />
                <ContactItem icon={Phone} label="Phone" value={personalInfo.phone} href={`tel:${personalInfo.phone}`} rotate={1} />
                <ContactItem icon={Linkedin} label="LinkedIn" value="linkedin.com/in/harshringsia" href={personalInfo.linkedin} rotate={1} />
                <ContactItem icon={Github} label="GitHub" value="github.com/Weasley18" href={personalInfo.github} rotate={-1} />
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
