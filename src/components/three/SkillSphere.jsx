import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

/** React wrapper for the three.js skill sphere (loaded on demand). */
const SkillSphere = forwardRef(({ skills, colors, onSelect, className = '' }, ref) => {
    const stageRef = useRef(null);
    const apiRef = useRef(null);
    const onSelectRef = useRef(onSelect);
    const reducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        onSelectRef.current = onSelect;
    }, [onSelect]);

    useImperativeHandle(ref, () => ({
        setFilter: (c) => apiRef.current?.setFilter(c),
        select: (n) => apiRef.current?.select(n),
    }));

    useEffect(() => {
        let cancelled = false;
        // Wait for the display font so labels rasterise in it
        Promise.all([import('../../three/skillSphere'), document.fonts?.ready]).then(([{ createSkillSphere }]) => {
            if (cancelled || !stageRef.current) return;
            apiRef.current = createSkillSphere(stageRef.current, {
                skills,
                colors,
                reducedMotion,
                onSelect: (s) => onSelectRef.current?.(s),
            });
        });
        return () => {
            cancelled = true;
            apiRef.current?.dispose();
            apiRef.current = null;
        };
    }, [skills, colors, reducedMotion]);

    return <div ref={stageRef} className={className} aria-hidden="true" />;
});

SkillSphere.displayName = 'SkillSphere';
export default SkillSphere;
