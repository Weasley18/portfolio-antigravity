import { useEffect, useState } from 'react';

const getInitialValue = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }

    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(getInitialValue);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const handleChange = (event) => {
            setPrefersReducedMotion(event.matches);
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange);
        } else if (typeof mediaQuery.addListener === 'function') {
            mediaQuery.addListener(handleChange);
        }

        setPrefersReducedMotion(mediaQuery.matches);

        return () => {
            if (typeof mediaQuery.removeEventListener === 'function') {
                mediaQuery.removeEventListener('change', handleChange);
            } else if (typeof mediaQuery.removeListener === 'function') {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, []);

    return prefersReducedMotion;
};

export default usePrefersReducedMotion;
