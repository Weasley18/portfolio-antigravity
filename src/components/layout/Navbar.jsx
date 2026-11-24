import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ResumeButton from '../ui/ResumeButton';

const Navbar = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPathname, setMenuPathname] = useState(location.pathname);

    const links = [
        { path: '/', label: 'Home' },
        { path: '/work', label: 'Work' },
        { path: '/experience', label: 'Experience' },
        { path: '/skills', label: 'Skills' },
        { path: '/about', label: 'About' },
        { path: '/contact', label: 'Contact' },
    ];

    // Close mobile menu when the route changes (React render-time state adjust)
    if (location.pathname !== menuPathname) {
        setMenuPathname(location.pathname);
        setMenuOpen(false);
    }

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

    const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

    return (
        <header className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-40">
            <nav className="p-3 md:p-4 flex justify-between items-center bg-bg-primary/80 backdrop-blur-md border border-border rounded-full shadow-paper">
                <Link to="/" className="flex items-center gap-2.5 leading-none px-2 md:px-4" aria-label="Harsh Ringsia — home">
                    <span
                        className="w-6 h-6 rounded-md"
                        style={{ background: 'repeating-linear-gradient(90deg, var(--fill-blue) 0 6px, var(--fill-garnet) 6px 12px)' }}
                        aria-hidden="true"
                    />
                    <span className="text-2xl font-display font-bold uppercase tracking-tight">Harsh<span className="text-accent-warm">.</span></span>
                </Link>

                <div className="flex items-center gap-2 md:gap-6 px-1 md:px-4">
                    <ul className="hidden lg:flex gap-6">
                        {links.map((link) => (
                            <li key={link.path}>
                                <Link to={link.path} className="relative font-display text-lg font-semibold uppercase tracking-wider hover:text-accent-warm transition-colors">
                                    {link.label}
                                    {isActive(link.path) && (
                                        <motion.div
                                            layoutId="underline"
                                            className="absolute left-0 right-0 -bottom-0.5 h-[2px] bg-accent-warm rounded-full"
                                        />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <ResumeButton variant="outline" className="hidden lg:inline-flex !py-1.5 !px-4 !text-xs" />
                    <ThemeToggle />
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-full hover:bg-accent-warmSoft transition-colors"
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
                        className="lg:hidden mt-2 p-4 bg-bg-primary/95 backdrop-blur-md border border-border rounded-2xl shadow-paper"
                    >
                        <ul className="flex flex-col gap-1">
                            {links.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        onClick={() => setMenuOpen(false)}
                                        className={`block px-4 py-3 rounded-xl text-sm font-medium uppercase tracking-wider transition-colors ${
                                            isActive(link.path)
                                                ? 'bg-accent-warmSoft text-accent-warm'
                                                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="pt-2">
                                <ResumeButton variant="solid" className="w-full justify-center" />
                            </li>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
