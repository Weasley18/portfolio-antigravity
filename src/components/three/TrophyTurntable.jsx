import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import AnimatedValue from '../ui/AnimatedValue';

/**
 * The Achievements page's centrepiece: a three.js trophy turntable (loaded on
 * demand) with the selected trophy's story beside it. Drag, click a trophy,
 * use the arrows or the ← → keys.
 */
const TrophyTurntable = ({ items }) => {
    const stageRef = useRef(null);
    const apiRef = useRef(null);
    const [active, setActive] = useState(0);
    const reducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        let cancelled = false;
        Promise.all([import('../../three/trophyCabinet'), document.fonts?.ready]).then(([{ createTrophyCabinet }]) => {
            if (cancelled || !stageRef.current) return;
            apiRef.current = createTrophyCabinet(stageRef.current, { items, reducedMotion, onSelect: setActive });
        });
        return () => {
            cancelled = true;
            apiRef.current?.dispose();
            apiRef.current = null;
        };
    }, [items, reducedMotion]);

    const go = (i) => {
        const n = (i + items.length) % items.length;
        setActive(n);
        apiRef.current?.setActive(n);
    };
    const t = items[active];

    return (
        <div
            className="grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-4 lg:gap-6"
            onKeyDown={(e) => {
                if (e.key === 'ArrowRight') go(active + 1);
                if (e.key === 'ArrowLeft') go(active - 1);
            }}
        >
            <div className="relative h-[52vh] min-h-[340px] max-h-[560px] rounded-3xl overflow-hidden border border-border">
                <div ref={stageRef} className="absolute inset-0" aria-hidden="true" />
                <p className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-white/50">Drag to spin · click a trophy</p>
                <div className="absolute right-4 bottom-4 flex items-center gap-3">
                    <button type="button" onClick={() => go(active - 1)} aria-label="Previous trophy" className="w-10 h-10 grid place-items-center rounded-full border border-white/20 bg-black/40 text-white hover:border-[#EDBB00] hover:text-[#EDBB00] transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex gap-1.5" role="tablist" aria-label="Trophies">
                        {items.map((it, i) => (
                            <button
                                key={it.id}
                                type="button"
                                role="tab"
                                aria-selected={i === active}
                                aria-label={it.title}
                                onClick={() => go(i)}
                                className={`h-2 rounded-full transition-all ${i === active ? 'w-6 bg-[#EDBB00]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                    <button type="button" onClick={() => go(active + 1)} aria-label="Next trophy" className="w-10 h-10 grid place-items-center rounded-full border border-white/20 bg-black/40 text-white hover:border-[#EDBB00] hover:text-[#EDBB00] transition-colors">
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={t.id}
                    initial={reducedMotion ? false : { opacity: 0, rotateY: -25, x: 20 }}
                    animate={{ opacity: 1, rotateY: 0, x: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, rotateY: 20, x: -12 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{ transformPerspective: 900 }}
                    className="rounded-3xl border border-border bg-bg-elevated p-6 md:p-7 flex flex-col"
                    aria-live="polite"
                >
                    <p className="flex justify-between font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-4">
                        <span className="text-gold">Trophy {String(active + 1).padStart(2, '0')}</span>
                        <span>{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
                    </p>
                    <p className="font-display text-6xl md:text-7xl font-extrabold text-gold leading-none mb-1">{t.rank}</p>
                    <h3 className="font-display text-3xl font-bold uppercase tracking-tight leading-none mb-1">{t.title}</h3>
                    <p className="text-sm text-text-secondary mb-5">{t.org}</p>
                    <p className="text-text-secondary leading-relaxed mb-6">{t.body}</p>
                    <div className="mt-auto flex items-end justify-between gap-4 border-t border-border pt-4">
                        <div>
                            <p className="font-display text-4xl font-bold leading-none">
                                <AnimatedValue value={t.stat} duration={900} />
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary mt-1">{t.statLabel}</p>
                        </div>
                        {t.link && (
                            <Link to={t.link} className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-accent-warm hover:underline">
                                The project <ArrowRight size={13} />
                            </Link>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default TrophyTurntable;
