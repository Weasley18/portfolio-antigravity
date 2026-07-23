import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col relative">
            <div className="noise-overlay" />
            <Navbar />
            <main className="flex-grow pt-28 md:pt-32 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full relative z-10">
                <Outlet />
            </main>
            <footer className="p-8 text-center text-sm text-text-secondary relative z-10">
                © {new Date().getFullYear()} Harsh Ringsia. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;
