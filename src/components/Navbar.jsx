import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const location = useLocation();

    const links = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/experience', label: 'Experience' },
        { path: '/projects', label: 'Projects' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl p-4 flex justify-between items-center z-40 bg-bg-primary/70 backdrop-blur-md border border-white/10 rounded-full shadow-sm">
            <Link to="/" className="text-xl font-display font-bold tracking-tighter px-4">
                HR.
            </Link>

            <div className="flex items-center gap-8 px-4">
                <ul className="hidden md:flex gap-8">
                    {links.map((link) => (
                        <li key={link.path}>
                            <Link to={link.path} className="relative text-sm font-medium uppercase tracking-wider hover:text-text-secondary transition-colors">
                                {link.label}
                                {location.pathname === link.path && (
                                    <motion.div
                                        layoutId="underline"
                                        className="absolute left-0 right-0 -bottom-1 h-[1px] bg-text-primary"
                                    />
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
                <ThemeToggle />
            </div>
        </nav>
    );
};

export default Navbar;
