import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * HashRouter doesn't reset scroll position on navigation like a fresh page
 * load would. This snaps the window back to the top whenever the route
 * changes, so every page is entered from the top.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;
