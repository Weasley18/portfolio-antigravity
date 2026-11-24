import { motion } from 'framer-motion';
import { BadgeCheck, Star } from 'lucide-react';
import { trophies, ratings, certifications } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import CareerTabs from '../components/ui/CareerTabs';
import AnimatedValue from '../components/ui/AnimatedValue';
import TrophyTurntable from '../components/three/TrophyTurntable';

const Achievements = () => {
    const reduced = usePrefersReducedMotion();
    return (
        <div className="py-6 md:py-10">
            <motion.div {...revealOnView(reduced)} className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <p className="font-mono text-xs uppercase tracking-widest text-gold mb-4">Trophy cabinet</p>
                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight leading-none mb-5">Achievements</h1>
                    <p className="text-lg text-text-secondary font-light">
                        Two first places, two contest ratings and ten-plus hackathons, each one on its own plinth. Spin the cabinet.
                    </p>
                </div>
                <CareerTabs />
            </motion.div>

            <TrophyTurntable items={trophies} />

            {/* Ratings: a stadium scoreboard per site */}
            <section className="pt-16 md:pt-20">
                <SectionHeading index="02" kicker="Competitive programming" title="Scoreboard" />
                <div className="grid md:grid-cols-2 gap-5">
                    {ratings.map((r, i) => (
                        <motion.div
                            key={r.site}
                            {...revealOnView(reduced, { delay: i * 0.08 })}
                            className="relative overflow-hidden rounded-3xl border border-border bg-[#060B19] text-[#EEF2FB] p-6 md:p-8"
                        >
                            <div
                                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '6px 6px' }}
                                aria-hidden="true"
                            />
                            <div className="relative flex items-start justify-between gap-4 mb-6">
                                <p className="font-display text-2xl font-bold uppercase tracking-wider">{r.site}</p>
                                {r.stars && (
                                    <span className="flex gap-0.5" aria-label={`${r.stars} stars`}>
                                        {Array.from({ length: 7 }, (_, k) => (
                                            <motion.span
                                                key={k}
                                                initial={reduced ? false : { opacity: 0, scale: 0.4, rotate: -90 }}
                                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.3 + k * 0.08 }}
                                            >
                                                <Star size={16} className={k < r.stars ? 'fill-[#EDBB00] text-[#EDBB00]' : 'text-white/20'} />
                                            </motion.span>
                                        ))}
                                    </span>
                                )}
                            </div>
                            <p className="relative font-mono text-6xl md:text-7xl font-bold text-[#EDBB00] leading-none mb-6" style={{ textShadow: '0 0 24px rgba(237,187,0,0.45)' }}>
                                <AnimatedValue value={String(r.rating)} duration={1600} />
                            </p>
                            <dl className="relative grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
                                {r.lines.map((l) => (
                                    <div key={l.k}>
                                        <dt className="font-mono text-[10px] uppercase tracking-widest text-white/50 mb-1">{l.k}</dt>
                                        <dd className="font-display text-2xl font-bold">{l.v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Certifications: cards that flip on hover, focus or tap */}
            <section className="pt-16 md:pt-20">
                <SectionHeading index="03" kicker="Hover or tap to flip" title="Certifications" />
                <div className="grid md:grid-cols-3 gap-5">
                    {certifications.map((c, i) => (
                        <motion.div key={c.name} {...revealOnView(reduced, { delay: i * 0.06 })} className="group h-52 [perspective:1000px]">
                            <button
                                type="button"
                                className="relative w-full h-full text-left transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] focus-visible:[transform:rotateY(180deg)] motion-reduce:transition-none"
                                onClick={(e) => e.currentTarget.classList.toggle('[transform:rotateY(180deg)]')}
                            >
                                <span className="absolute inset-0 rounded-3xl border border-border bg-bg-elevated p-6 flex flex-col [backface-visibility:hidden]">
                                    <BadgeCheck size={22} className="text-gold mb-auto" />
                                    <span className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-1">{c.issuer}</span>
                                    <span className="font-display text-2xl font-bold uppercase tracking-tight leading-tight">{c.name}</span>
                                </span>
                                <span className="absolute inset-0 rounded-3xl border border-gold/40 bg-[#060B19] text-[#EEF2FB] p-6 flex flex-col justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#EDBB00] mb-2">{c.issuer}</span>
                                    <span className="text-white/80 leading-relaxed">{c.detail}</span>
                                </span>
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Achievements;
