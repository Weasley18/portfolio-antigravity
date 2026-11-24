import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

/**
 * Mounts the "assemble" energy core behind the Home hero. three.js loads on
 * demand; a static gradient shows until it's ready or if WebGL is missing.
 */
const HeroField = ({ className = '' }) => {
    const ref = useRef(null);
    const [ready, setReady] = useState(false);
    const reducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        let api = null;
        let cancelled = false;
        import('../../three/energyCore').then(({ createEnergyCore }) => {
            if (cancelled || !ref.current) return;
            api = createEnergyCore(ref.current, { reducedMotion, onReady: () => setReady(true) });
        });
        return () => {
            cancelled = true;
            api?.dispose();
        };
    }, [reducedMotion]);

    return (
        <div className={`absolute inset-0 ${className}`} aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_50%,#0e2a5c_0%,#0a1226_35%,#050913_70%)]" />
            <div ref={ref} className={`absolute inset-0 transition-opacity duration-[1500ms] ${ready ? 'opacity-100' : 'opacity-0'}`} />
        </div>
    );
};

export default HeroField;
