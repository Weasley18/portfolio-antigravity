import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MousePointerClick } from 'lucide-react';
import { skills } from '../data';
import { allSkills, CATEGORY_COLORS } from '../lib/skillUsage';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import Tilt3D from '../components/ui/Tilt3D';
import SkillSphere from '../components/three/SkillSphere';

const Skills = () => {
    const reduced = usePrefersReducedMotion();
    const sphereRef = useRef(null);
    const [filter, setFilter] = useState(null);
    const [selected, setSelected] = useState(null);

    const choose = (skill) => {
        setSelected(skill);
        sphereRef.current?.select(skill?.name ?? null);
    };
    const toggleFilter = (cat) => {
        const next = filter === cat ? null : cat;
        setFilter(next);
        sphereRef.current?.setFilter(next);
    };

    return (
        <div className="py-6 md:py-10">
            <motion.div {...revealOnView(reduced)} className="mb-10 max-w-2xl">
                <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">The toolkit</p>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight leading-none mb-5">Skills</h1>
                <p className="text-lg text-text-secondary font-light">
                    {allSkills.length} skills on one sphere. Drag it to spin, click any skill to see exactly where I&apos;ve used it.
                </p>
            </motion.div>

            {/* Sphere + inspector */}
            <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mb-20 md:mb-28">
                <div className="relative rounded-3xl border border-border bg-[#050913] overflow-hidden h-[460px] md:h-[600px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,87,176,0.25),transparent_60%)]" aria-hidden="true" />
                    <SkillSphere ref={sphereRef} skills={allSkills} colors={CATEGORY_COLORS} onSelect={setSelected} className="absolute inset-0" />
                    <p className="absolute left-4 bottom-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-white/50 pointer-events-none">
                        <MousePointerClick size={13} /> Drag to spin · click a skill
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    <div>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-3">Filter by position</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(skills).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleFilter(cat)}
                                    aria-pressed={filter === cat}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                        filter === cat ? 'border-transparent bg-bg-secondary text-text-primary' : 'border-border text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 rounded-3xl border border-border bg-bg-elevated p-6 md:p-7 min-h-[16rem]" aria-live="polite">
                        <AnimatePresence mode="wait">
                            {selected ? (
                                <motion.div
                                    key={selected.name}
                                    initial={reduced ? false : { opacity: 0, rotateY: -25, x: 20 }}
                                    animate={{ opacity: 1, rotateY: 0, x: 0 }}
                                    exit={reduced ? undefined : { opacity: 0, rotateY: 20, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ transformPerspective: 900 }}
                                >
                                    <p className="font-mono text-[11px] uppercase tracking-widest mb-2" style={{ color: CATEGORY_COLORS[selected.category] }}>
                                        {selected.category}
                                    </p>
                                    <h2 className="font-display text-5xl font-extrabold uppercase tracking-tight leading-none mb-6">{selected.name}</h2>
                                    {selected.usedIn.length ? (
                                        <>
                                            <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-3">
                                                Used in {selected.usedIn.length} {selected.usedIn.length === 1 ? 'place' : 'places'}
                                            </p>
                                            <ul className="space-y-2">
                                                {selected.usedIn.map((u) => (
                                                    <li key={u.title}>
                                                        <Link to={u.to} className="group flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 hover:border-accent-warm transition-colors">
                                                            <span>
                                                                <span className="block font-semibold">{u.title}</span>
                                                                <span className="block font-mono text-[10px] uppercase tracking-widest text-text-secondary">
                                                                    {u.kind === 'project' ? 'Case study' : 'Experience'}
                                                                </span>
                                                            </span>
                                                            <ArrowRight size={16} className="text-accent-warm transition-transform group-hover:translate-x-1" />
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    ) : (
                                        <p className="text-text-secondary">Part of the everyday toolkit: coursework, contests and the smaller builds on the Work page.</p>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div key="empty" initial={false} animate={{ opacity: 1 }} className="h-full flex flex-col justify-center">
                                    <p className="font-display text-3xl font-bold uppercase tracking-tight mb-2">Pick a skill</p>
                                    <p className="text-text-secondary">Click one on the sphere, or in the lists below, to see the projects and roles behind it.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Line-up by category */}
            <section>
                <SectionHeading index="02" kicker="By position" title="The line-up" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {Object.keys(skills).map((cat, ci) => (
                        <motion.div key={cat} {...revealOnView(reduced, { delay: ci * 0.05 })}>
                            <Tilt3D max={6} className="group rounded-2xl border border-border bg-bg-elevated p-6 overflow-hidden">
                                <span className="absolute inset-x-0 top-0 h-1" style={{ background: CATEGORY_COLORS[cat] }} aria-hidden="true" />
                                <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-1">
                                    {cat}
                                </h3>
                                <p className="font-mono text-[10px] uppercase tracking-widest text-text-secondary mb-5">{skills[cat].length} skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {allSkills
                                        .filter((s) => s.category === cat)
                                        .map((s) => (
                                            <button
                                                key={s.name}
                                                type="button"
                                                onClick={() => {
                                                    choose(s);
                                                    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
                                                }}
                                                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                                                    selected?.name === s.name ? 'border-accent-warm text-accent-warm' : 'border-border text-text-secondary hover:text-text-primary'
                                                }`}
                                            >
                                                {s.name}
                                                {s.usedIn.length > 0 && <span className="text-gold">· {s.usedIn.length}</span>}
                                            </button>
                                        ))}
                                </div>
                            </Tilt3D>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Skills;
