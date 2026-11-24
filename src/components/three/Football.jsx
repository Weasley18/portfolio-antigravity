import { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

/** The Contact page's 3D football. Drag to spin, click to kick. */
const Football = ({ className = '' }) => {
    const ref = useRef(null);
    const reducedMotion = usePrefersReducedMotion();
    useEffect(() => {
        let api = null;
        let cancelled = false;
        import('../../three/football').then(({ createFootball }) => {
            if (!cancelled && ref.current) api = createFootball(ref.current, { reducedMotion });
        });
        return () => {
            cancelled = true;
            api?.dispose();
        };
    }, [reducedMotion]);
    return <div ref={ref} className={className} aria-hidden="true" />;
};

export default Football;
