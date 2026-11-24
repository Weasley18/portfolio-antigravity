import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const CAREER_PAGES = [
    { to: '/experience', label: 'Experience' },
    { to: '/achievements', label: 'Achievements' },
    { to: '/extracurricular', label: 'Extracurricular' },
];

/** Segmented switcher shared by the three career pages. */
const CareerTabs = ({ className = '' }) => {
    const { pathname } = useLocation();
    return (
        <nav aria-label="Career pages" className={`inline-flex max-w-full overflow-x-auto rounded-full border border-border bg-bg-elevated p-1 ${className}`}>
            {CAREER_PAGES.map((p) => {
                const on = pathname.startsWith(p.to);
                return (
                    <Link
                        key={p.to}
                        to={p.to}
                        aria-current={on ? 'page' : undefined}
                        className={`relative shrink-0 rounded-full px-4 py-1.5 font-display text-sm md:text-base font-semibold uppercase tracking-wider transition-colors ${
                            on ? 'text-[#060B19]' : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                        {on && <motion.span layoutId="career-tab" className="absolute inset-0 rounded-full bg-gold" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                        <span className="relative">{p.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default CareerTabs;
