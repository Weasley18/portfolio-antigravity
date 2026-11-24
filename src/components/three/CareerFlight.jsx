import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const KIND_LABEL = { education: 'Education', work: 'Work', project: 'Project', award: 'Trophy', next: 'Next' };
const KIND_CLASS = {
    education: 'text-[#5E9EFF]',
    work: 'text-[#F0467E]',
    project: 'text-[#EDBB00]',
    award: 'text-[#EDBB00]',
    next: 'text-[#3FBF86]',
};

// Scroll → position along the path, in gate units, with a hold at every gate:
// the first 45% of each gate's slice of scroll sits still, the rest travels.
function gateUnitsAt(p, count) {
    const x = p * (count - 1);
    const k = Math.floor(x);
    const f = x - k;
    const hold = 0.45;
    if (f < hold) return k;
    const t = (f - hold) / (1 - hold);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    return Math.min(count - 1, k + e);
}

/**
 * The Experience page's main event: a sticky three.js flythrough. Scroll to
 * fly from gate to gate; the card shows the milestone you're at.
 */
const CareerFlight = ({ milestones }) => {
    const sectionRef = useRef(null);
    const stageRef = useRef(null);
    const apiRef = useRef(null);
    const [active, setActive] = useState(0);
    const reducedMotion = usePrefersReducedMotion();
    const count = milestones.length;

    useEffect(() => {
        let cancelled = false;
        let raf = 0;
        const update = () => {
            raf = 0;
            const el = sectionRef.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            const span = r.height - window.innerHeight;
            const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
            const g = gateUnitsAt(p, count);
            apiRef.current?.setPosition(g);
            setActive(Math.round(g));
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        import('../../three/careerPath').then(({ createCareerPath }) => {
            if (cancelled || !stageRef.current) return;
            apiRef.current = createCareerPath(stageRef.current, { milestones, reducedMotion });
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
    }, [milestones, count, reducedMotion]);

    const jumpTo = (i) => {
        const el = sectionRef.current;
        if (!el) return;
        const span = el.offsetHeight - window.innerHeight;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + (i / (count - 1)) * span + 2, behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    const m = milestones[active];

    return (
        <div ref={sectionRef} className="relative" style={{ height: `${count * 60 + 40}vh` }}>
            <div className="sticky top-24 md:top-28 h-[calc(100svh-7rem)] md:h-[calc(100svh-8rem)] max-h-[760px] pb-3">
                <div className="h-full grid grid-rows-[minmax(0,1fr)_auto] lg:grid-rows-1 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] gap-4 lg:gap-6">
                    {/* Text column (under the rings on phones, beside them on desktop) */}
                    <div className="order-2 lg:order-1 flex flex-col min-h-0 gap-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={active}
                                initial={reducedMotion ? false : { opacity: 0, y: 18, rotateX: -18 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                exit={reducedMotion ? undefined : { opacity: 0, y: -12, rotateX: 12 }}
                                transition={{ duration: 0.3, ease: 'easeOut' }}
                                style={{ transformPerspective: 900 }}
                                className="rounded-2xl border border-border bg-bg-elevated p-5 md:p-6"
                                aria-live="polite"
                            >
                                <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest mb-2">
                                    <span className={KIND_CLASS[m.kind]}>{KIND_LABEL[m.kind]}</span>
                                    <span className="text-text-secondary">{m.label}</span>
                                    <span className="ml-auto text-text-secondary">
                                        {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                                    </span>
                                </p>
                                <h3 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight leading-none mb-1">{m.title}</h3>
                                <p className="text-sm text-text-secondary mb-3 md:mb-4">{m.org}</p>
                                <ul className="space-y-1.5 md:space-y-2">
                                    {m.points.map((pt) => (
                                        <li key={pt} className="flex gap-2.5 text-sm text-text-secondary leading-relaxed">
                                            <span className="mt-2 w-1 h-1 rounded-full bg-gold shrink-0" />
                                            {pt}
                                        </li>
                                    ))}
                                </ul>
                                {m.link && (
                                    <Link to={m.link} className="mt-3 md:mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-accent-warm hover:underline">
                                        {m.kind === 'next' ? 'Get in touch' : 'Open the case study'} <ArrowRight size={13} />
                                    </Link>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Milestone list: desktop only, click to fly there */}
                        <nav aria-label="Jump to milestone" className="hidden lg:block min-h-0 overflow-y-auto rounded-2xl border border-border p-2">
                            {milestones.map((ms, i) => (
                                <button
                                    key={`${ms.label}-${ms.title}`}
                                    type="button"
                                    onClick={() => jumpTo(i)}
                                    aria-current={i === active ? 'step' : undefined}
                                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-1.5 text-left transition-colors ${
                                        i === active ? 'bg-bg-secondary text-text-primary' : 'text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${i === active ? 'bg-gold' : 'bg-border'}`} />
                                    <span className="font-mono text-[10px] uppercase tracking-widest w-16 shrink-0">{ms.label}</span>
                                    <span className="text-sm truncate">{ms.title}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* The rings */}
                    <div className="order-1 lg:order-2 relative min-h-0 rounded-3xl overflow-hidden border border-border">
                        <div ref={stageRef} className="absolute inset-0" aria-hidden="true" />
                        <p className="hidden sm:block absolute left-4 top-4 font-mono text-[10px] uppercase tracking-widest text-white/50">
                            Scroll to fly · {count} gates
                        </p>
                        <div className="absolute inset-x-4 bottom-3 h-1 rounded-full bg-white/10 overflow-hidden" aria-hidden="true">
                            <div className="h-full bg-[#EDBB00] transition-[width] duration-300" style={{ width: `${((active + 1) / count) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerFlight;
