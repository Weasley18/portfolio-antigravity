import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const NUM = /\d[\d,]*(?:\.\d+)?/g;

/**
 * Renders a value like "21/24", "-33%" or "11,223" and rolls every number in
 * it up from zero the first time it scrolls into view.
 */
const AnimatedValue = ({ value, duration = 1400, className = '' }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-40px' });
    const reduced = usePrefersReducedMotion();
    const [t, setT] = useState(0);

    useEffect(() => {
        if (!inView || reduced) return undefined;
        let raf = 0;
        const start = performance.now();
        const tick = (now) => {
            const k = Math.min(1, (now - start) / duration);
            setT(1 - Math.pow(1 - k, 3));
            if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [inView, reduced, duration]);

    const progress = reduced ? 1 : t;
    const text = String(value).replace(NUM, (m) => {
        const n = parseFloat(m.replace(/,/g, ''));
        const decimals = (m.split('.')[1] || '').length;
        const v = n * progress;
        const s = decimals ? v.toFixed(decimals) : String(Math.round(v));
        return m.includes(',') ? Number(s).toLocaleString('en-US') : s;
    });

    return (
        <span ref={ref} className={`tabular-nums ${className}`} aria-label={String(value)}>
            <span aria-hidden="true">{text}</span>
        </span>
    );
};

export default AnimatedValue;
