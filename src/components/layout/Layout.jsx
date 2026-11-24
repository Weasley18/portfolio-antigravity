import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    const { pathname } = useLocation();
    const reduced = usePrefersReducedMotion();
    return (
        <div id="top" className="min-h-screen flex flex-col relative">
            <Navbar />
            <main className="flex-grow pt-28 md:pt-32 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full relative z-10">
                <motion.div
                    key={pathname}
                    initial={reduced ? false : { opacity: 0, y: 16, rotateX: 4, transformPerspective: 1200 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: '50% 0%' }}
                >
                    <Outlet />
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
