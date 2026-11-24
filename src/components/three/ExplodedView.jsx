import { useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

// Scroll progress → explode amount, with holds at "assembled" and at "fully
// labelled" (the exploded-view skill's scroll drive with holds).
const KEYS = [
    [0, 0],
    [0.12, 0],
    [0.45, 1],
    [0.76, 1],
    [0.93, 0],
    [1, 0],
];
function explodeAt(p) {
    for (let i = 1; i < KEYS.length; i++) {
        const [p0, v0] = KEYS[i - 1];
        const [p1, v1] = KEYS[i];
        if (p <= p1) return v0 + (v1 - v0) * ((p - p0) / (p1 - p0 || 1));
    }
    return 0;
}
function phaseAt(p) {
    if (p < 0.12) return 0;
    if (p < 0.45) return 1;
    if (p < 0.76) return 2;
    if (p < 0.93) return 3;
    return 4;
}

const TONE_SWATCH = {
    steel: 'bg-[#8a95ab]',
    blue: 'bg-blau',
    garnet: 'bg-garnet',
    gold: 'bg-[#edbb00]',
};

/**
 * A sticky, scroll-scrubbed 3D exploded view of a project's architecture.
 * Scroll down: the blaugrana casing opens, parts separate stage by stage and
 * get labelled; keep scrolling and it assembles again.
 */
const ExplodedView = ({ parts, caption }) => {
    const sectionRef = useRef(null);
    const stageRef = useRef(null);
    const labelsRef = useRef(null);
    const linesRef = useRef(null);
    const apiRef = useRef(null);
    const [phase, setPhase] = useState(0);
    const reducedMotion = usePrefersReducedMotion();
    const labelled = parts.filter((p) => p.label);

    useEffect(() => {
        let cancelled = false;
        let raf = 0;

        const update = () => {
            raf = 0;
            const el = sectionRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const span = rect.height - window.innerHeight;
            const p = span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0;
            apiRef.current?.setProgress(explodeAt(p));
            setPhase(phaseAt(p));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };

        import('../../three/exploded').then(({ createExploded }) => {
            if (cancelled || !stageRef.current) return;
            apiRef.current = createExploded(stageRef.current, {
                parts,
                labelsEl: labelsRef.current,
                linesEl: linesRef.current,
                reducedMotion,
            });
            update();
        });

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelled = true;
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            apiRef.current?.dispose();
            apiRef.current = null;
        };
    }, [parts, reducedMotion]);

    const captions = [
        'Assembled — scroll to take it apart',
        'Taking it apart…',
        `${labelled.length} parts, labelled`,
        'Putting it back together…',
        'Assembled.',
    ];

    return (
        <div ref={sectionRef} className="relative h-[150vh] md:h-[170vh]">
            <div className="sticky top-24 md:top-28 h-[calc(100svh-7.5rem)] max-h-[620px] pb-2 flex flex-col">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary">{caption}</p>
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gold text-right" aria-live="polite">
                        {captions[phase]}
                    </p>
                </div>
                <div className="relative flex-1 min-h-0 rounded-2xl border border-border bg-bg-secondary overflow-hidden">
                    <div ref={stageRef} className="absolute inset-0" aria-hidden="true" />
                    <svg ref={linesRef} className="xv-lines absolute inset-0 w-full h-full pointer-events-none hidden sm:block" aria-hidden="true" />
                    <div ref={labelsRef} className="absolute inset-0 pointer-events-none hidden sm:block" aria-hidden="true" />
                </div>
                {/* Phones: one compact legend instead of edge labels */}
                <ul className={`sm:hidden mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 transition-opacity duration-500 ${phase === 2 ? 'opacity-100' : 'opacity-40'}`}>
                    {labelled.map((p) => (
                        <li key={p.id} className="flex items-center gap-2 text-xs text-text-secondary min-w-0">
                            <span className={`w-2 h-2 rounded-sm shrink-0 ${TONE_SWATCH[p.tone] || TONE_SWATCH.steel}`} />
                            <span className="truncate">{p.label}</span>
                        </li>
                    ))}
                </ul>
                {/* Screen readers get the same information as a list */}
                <ul className="sr-only">
                    {labelled.map((p) => (
                        <li key={p.id}>
                            {p.label}: {p.note}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExplodedView;
