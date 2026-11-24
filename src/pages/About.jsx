import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Mic, BadgeCheck, ArrowRight } from 'lucide-react';
import { education, achievements, personalInfo } from '../data';
import { allSkills } from '../lib/skillUsage';
import Tilt3D from '../components/ui/Tilt3D';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { revealOnView } from '../lib/motion';
import SectionHeading from '../components/ui/SectionHeading';
import ResumeButton from '../components/ui/ResumeButton';

const GROUP_ICONS = [Trophy, Mic, BadgeCheck];
const SKILL_COUNT = allSkills.length;

const About = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    return (
        <div className="py-8 md:py-12">
            <motion.div
                {...revealOnView(prefersReducedMotion)}
                className="mb-20 md:mb-28 grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-start"
            >
                <div className="max-w-3xl">
                    <p className="font-mono text-xs uppercase tracking-widest text-accent-warm mb-4">Player profile</p>
                    <h1 className="text-6xl sm:text-7xl md:text-8xl font-display font-extrabold uppercase tracking-tight leading-none mb-8">
                        About me
                    </h1>
                    <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed mb-4">
                        I&apos;m a final-year Computer Science (Cyber Security) student at RNSIT, Bengaluru, and I mostly
                        build backend systems and AI tools. At Firedesk I shipped 10+ REST APIs with JWT and role-based
                        access, owned PostgreSQL schemas for 10+ modules (cutting query latency by 40%), and built the
                        shared component library that halved feature build time.
                    </p>
                    <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed">
                        On my own I&apos;ve built an LLM résumé assessor with a tested eval harness, a multiplayer AI
                        courtroom, a DevSecOps gate that fails closed, and, out of pure Kolkata para nostalgia, a
                        street football game in three.js.
                    </p>
                </div>
                <div className="relative w-48 md:w-64 mx-auto md:mx-0">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-bg-secondary">
                        <img
                            src={personalInfo.image}
                            alt={personalInfo.name}
                            width="675"
                            height="900"
                            loading="eager"
                            decoding="async"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="stripe-rule mt-3" aria-hidden="true" />
                </div>
            </motion.div>

            {/* Two dedicated pages, each with its own 3D scene */}
            <section className="mb-20 md:mb-28 grid md:grid-cols-2 gap-5">
                {[
                    { to: '/experience', kicker: 'Career mode', title: 'Experience', body: 'Fly through every milestone, from IIT Roorkee to Firedesk to HireLens, in a scroll-driven 3D path.', tone: 'bg-garnet' },
                    { to: '/skills', kicker: 'The toolkit', title: 'Skills', body: `A 3D sphere of ${SKILL_COUNT} skills. Spin it, click one, and see exactly which project or role used it.`, tone: 'bg-blau' },
                ].map((c) => (
                    <Link key={c.to} to={c.to} className="block">
                        <Tilt3D max={7} className="group overflow-hidden rounded-3xl border border-border bg-[#060B19] p-7 md:p-9 text-[#EEF2FB] min-h-[15rem] flex flex-col justify-end">
                            <span className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl opacity-50 ${c.tone}`} aria-hidden="true" />
                            <p className="relative font-mono text-[11px] uppercase tracking-widest text-[#EDBB00] mb-2" style={{ transform: 'translateZ(30px)' }}>{c.kicker}</p>
                            <h2 className="relative font-display text-5xl md:text-6xl font-extrabold uppercase tracking-tight leading-none mb-3" style={{ transform: 'translateZ(40px)' }}>
                                {c.title}
                            </h2>
                            <p className="relative text-white/70 max-w-sm mb-4">{c.body}</p>
                            <span className="relative inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#EDBB00]">
                                Enter <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                            </span>
                        </Tilt3D>
                    </Link>
                ))}
            </section>

            <section className="mb-20 md:mb-28">
                <SectionHeading index="01" kicker="Education" title="Academy" />
                <div className="grid gap-6">
                    {education.map((edu, index) => (
                        <motion.div
                            key={edu.institution}
                            {...revealOnView(prefersReducedMotion, { delay: index * 0.06 })}
                            className="flex flex-col md:flex-row justify-between md:items-start gap-2 border-b border-border pb-6"
                        >
                            <div>
                                <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tight mb-1">{edu.institution}</h3>
                                <p className="text-text-secondary">{edu.degree}</p>
                            </div>
                            <div className="text-left md:text-right shrink-0">
                                <p className="font-mono text-sm font-medium">{edu.year}</p>
                                <p className="text-sm text-text-secondary">{edu.location}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="mb-16 md:mb-20">
                <SectionHeading index="02" kicker="Achievements & certifications" title="Trophies" />
                <div className="grid md:grid-cols-3 gap-5">
                    {achievements.map(({ group, items }, index) => {
                        const Icon = GROUP_ICONS[index % GROUP_ICONS.length];
                        return (
                            <motion.div key={group} {...revealOnView(prefersReducedMotion, { delay: index * 0.05 })}>
                                <Tilt3D max={5} className="group p-6 rounded-2xl border border-border bg-bg-elevated">
                                <div className="flex items-center gap-3 mb-5">
                                    <Icon size={18} className="text-gold shrink-0" />
                                    <h3 className="font-display text-xl font-bold uppercase tracking-tight">{group}</h3>
                                </div>
                                <ul className="space-y-3">
                                    {items.map((item) => (
                                        <li key={item} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-warm shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                </Tilt3D>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            <div className="text-center pt-4">
                <ResumeButton variant="solid" />
            </div>
        </div>
    );
};

export default About;
