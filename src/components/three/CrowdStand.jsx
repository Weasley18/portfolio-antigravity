import { useEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

/**
 * Workshop crowd (three.js, loaded on demand). Phone lights fill the stand as
 * it scrolls into view; the counter tracks the wave up to "200+".
 */
const CrowdStand = ({ count = 200, className = '' }) => {
    const stageRef = useRef(null);
    const counterRef = useRef(null);
    const apiRef = useRef(null);
    const reducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        let cancelled = false;
        const onProgress = (p) => {
            const el = counterRef.current;
            if (el) el.textContent = p >= 1 ? `${count}+` : String(Math.round(count * p));
        };
        import('../../three/crowdStand').then(({ createCrowdStand }) => {
            if (cancelled || !stageRef.current) return;
            apiRef.current = createCrowdStand(stageRef.current, { reducedMotion, onProgress });
        });
        return () => {
            cancelled = true;
            apiRef.current?.dispose();
            apiRef.current = null;
        };
    }, [count, reducedMotion]);

    return (
        <div className={`relative rounded-3xl overflow-hidden border border-border ${className}`}>
            <div ref={stageRef} className="absolute inset-0" aria-hidden="true" />
            <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-[#050913]/85 to-transparent pointer-events-none" aria-hidden="true" />
            <div className="absolute left-5 top-5 md:left-7 md:top-6 text-white">
                <p className="font-display text-6xl md:text-8xl font-extrabold leading-none tabular-nums">
                    <span ref={counterRef} aria-hidden="true">0</span>
                    <span className="sr-only">{count}+</span>
                </p>
                <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest text-[#EDBB00] mt-1">Batchmates &amp; juniors mentored</p>
            </div>
            {!reducedMotion && (
                <button
                    type="button"
                    onClick={() => apiRef.current?.replay()}
                    className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white/80 hover:text-[#EDBB00] hover:border-[#EDBB00] transition-colors"
                >
                    <RotateCcw size={12} /> Lights again
                </button>
            )}
        </div>
    );
};

export default CrowdStand;
