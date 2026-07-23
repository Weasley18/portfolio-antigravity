import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const links = [
        { path: '/', label: 'Home' },
        { path: '/about', label: 'About' },
        { path: '/experience', label: 'Experience' },
        { path: '/projects', label: 'Projects' },
        { path: '/contact', label: 'Contact' },
    ];

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    return (
        <header className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-40">
            <nav className="p-3 md:p-4 flex justify-between items-center bg-bg-primary/70 backdrop-blur-md border border-white/10 rounded-full shadow-sm">
                <Link to="/" className="text-xl font-display font-bold tracking-tighter px-2 md:px-4">
                    HR.
                </Link>

                <div className="flex items-center gap-2 md:gap-8 px-1 md:px-4">
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
                    <button
                        type="button"
                        className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden mt-2 p-4 bg-bg-primary/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg"
                    >
                        <ul className="flex flex-col gap-1">
                            {links.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`block px-4 py-3 rounded-xl text-sm font-medium uppercase tracking-wider transition-colors ${
                                            location.pathname === link.path
                                                ? 'bg-accent text-text-primary'
                                                : 'text-text-secondary hover:bg-accent/50 hover:text-text-primary'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
