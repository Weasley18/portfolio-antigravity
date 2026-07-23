import { motion } from 'framer-motion';
import { personalInfo } from '../data';
import { Mail, Phone, Linkedin, Github, MapPin } from 'lucide-react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const ContactItem = ({ icon: Icon, label, value, href }) => (
    <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        className="flex items-center gap-4 md:gap-8 p-5 md:p-8 border border-border rounded-2xl hover:bg-bg-secondary/50 hover:border-text-secondary/50 transition-all duration-300 group min-w-0"
    >
        <div className="p-3 md:p-5 bg-bg-secondary rounded-full group-hover:bg-text-primary group-hover:text-bg-primary transition-colors duration-300 shrink-0">
            <Icon className="size-[22px] md:size-7" />
        </div>
        <div className="min-w-0">
            <p className="text-sm text-text-secondary mb-1 uppercase tracking-wider font-medium">{label}</p>
            <p className="text-lg md:text-2xl font-bold break-all group-hover:translate-x-1 transition-transform duration-300">{value}</p>
        </div>
    </a>
);

const Contact = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-12">
            <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.45, ease: 'easeOut' }}
                className="text-4xl md:text-7xl font-display font-bold mb-10 md:mb-16 tracking-tight"
            >
                Get in Touch
            </motion.h1>

            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.45, delay: 0.1 }}
                className="grid md:grid-cols-2 gap-6"
            >
                <ContactItem
                    icon={Mail}
                    label="Email"
                    value={personalInfo.email}
                    href={`mailto:${personalInfo.email}`}
                />
                <ContactItem
                    icon={Phone}
                    label="Phone"
                    value={personalInfo.phone}
                    href={`tel:${personalInfo.phone}`}
                />
                <ContactItem
                    icon={Linkedin}
                    label="LinkedIn"
                    value="linkedin.com/in/harshringsia"
                    href={personalInfo.linkedin}
                />
                <ContactItem
                    icon={Github}
                    label="GitHub"
                    value="github.com/Weasley18"
                    href={personalInfo.github}
                />
            </motion.div>

            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.45, delay: 0.2 }}
                className="mt-16 flex items-center gap-3 text-text-secondary text-lg"
            >
                <MapPin size={24} />
                <p>{personalInfo.location}</p>
            </motion.div>
        </div>
    );
};

export default Contact;
