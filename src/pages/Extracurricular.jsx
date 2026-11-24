import { motion } from 'framer-motion';
import { Gavel, Github, Code2, Presentation } from 'lucide-react';
import { maverick, workshops, munsoc } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import CareerTabs from '../components/ui/CareerTabs';
import Tilt3D from '../components/ui/Tilt3D';
import PitchSteps from '../components/illustrations/PitchSteps';
import CrowdStand from '../components/three/CrowdStand';

const TOPIC_ICONS = { GitHub: Github, 'Competitive coding': Code2 };

const Extracurricular = () => {
    const reduced = usePrefersReducedMotion();
    return (
        <div className="py-6 md:py-10">
            <motion.div {...revealOnView(reduced)} className="mb-12 md:mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="max-w-2xl">
                    <p className="font-mono text-xs uppercase tracking-widest text-garnet mb-4">Off the pitch</p>
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight leading-none mb-5 break-words">
                        Extra&shy;curricular
                    </h1>
                    <p className="text-lg text-text-secondary font-light">Pitching to investors, teaching a room of 200+, and running the show behind MUN events.</p>
                </div>
                <CareerTabs />
            </motion.div>

            {/* 01 · The pitch */}
            <section className="mb-16 md:mb-24 grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 lg:gap-12 items-center">
                <motion.div {...revealOnView(reduced)}>
                    <SectionHeading index="01" kicker="The pitch" title={maverick.event} className="!mb-5" />
                    <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-4">{maverick.host}</p>
                    <p className="text-text-secondary leading-relaxed mb-6">{maverick.body}</p>
                    <div className="flex gap-6">
                        {[
                            ['3', 'Elimination rounds'],
                            ['Top 8', 'Finish'],
                            ['6', 'Angel investors'],
                        ].map(([v, k]) => (
                            <div key={k}>
                                <p className="font-display text-4xl font-extrabold text-gold leading-none">{v}</p>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary mt-1">{k}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
                <div className="rounded-3xl border border-border bg-[#060B19] p-4 md:p-6">
                    <PitchSteps steps={maverick.steps} />
                </div>
            </section>

            {/* 02 · The workshops */}
            <section className="mb-16 md:mb-24">
                <SectionHeading index="02" kicker="The workshops" title="Invited speaker" />
                <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-5 lg:gap-6">
                    <CrowdStand count={workshops.count} className="h-[48vh] min-h-[320px] max-h-[520px]" />
                    <motion.div {...revealOnView(reduced)} className="rounded-3xl border border-border bg-bg-elevated p-6 md:p-7 flex flex-col">
                        <Presentation size={22} className="text-gold mb-4" />
                        <p className="text-text-secondary leading-relaxed mb-6">{workshops.body}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary mb-3">Topics</p>
                        <ul className="flex flex-col gap-2 mt-auto">
                            {workshops.topics.map((t) => {
                                const Icon = TOPIC_ICONS[t] || Code2;
                                return (
                                    <li key={t} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 font-display text-lg font-semibold uppercase tracking-wide">
                                        <Icon size={18} className="text-accent-warm" /> {t}
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* 03 · The committee */}
            <section className="mb-8">
                <SectionHeading index="03" kicker="The committee" title="Organiser" />
                <motion.div {...revealOnView(reduced)}>
                    <Tilt3D max={5} className="group overflow-hidden rounded-3xl border border-border bg-[#060B19] text-[#EEF2FB] p-7 md:p-10">
                        <span className="absolute -right-20 -bottom-24 w-72 h-72 rounded-full blur-3xl opacity-40 bg-garnet" aria-hidden="true" />
                        <span className="absolute -left-16 -top-20 w-56 h-56 rounded-full blur-3xl opacity-30 bg-blau" aria-hidden="true" />
                        <div className="relative grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
                            <motion.div
                                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border border-[#EDBB00]/40 grid place-items-center bg-white/5"
                                animate={reduced ? undefined : { rotate: [0, -14, 0, 0] }}
                                transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, times: [0, 0.15, 0.3, 1] }}
                            >
                                <Gavel size={44} className="text-[#EDBB00]" />
                            </motion.div>
                            <div>
                                <p className="font-mono text-[11px] uppercase tracking-widest text-[#EDBB00] mb-2">Model United Nations Society</p>
                                <h3 className="font-display text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-none mb-3">{munsoc.org}</h3>
                                <p className="text-white/75 max-w-xl leading-relaxed">{munsoc.body}</p>
                            </div>
                        </div>
                    </Tilt3D>
                </motion.div>
            </section>
        </div>
    );
};

export default Extracurricular;
