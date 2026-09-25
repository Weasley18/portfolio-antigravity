import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
    return (
        <div id="top" className="min-h-screen flex flex-col relative">
            <div className="noise-overlay" />
            <Navbar />
            <main className="flex-grow pt-28 md:pt-32 px-4 sm:px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full relative z-10">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
