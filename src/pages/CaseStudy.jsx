import { lazy, Suspense } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { caseStudies, projects } from '../data';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import CaseStudyHero from '../components/case-study/CaseStudyHero';
import CaseStudySection from '../components/case-study/CaseStudySection';
import ResultsGrid from '../components/case-study/ResultsGrid';
import CaseStudyNav from '../components/case-study/CaseStudyNav';
import AnnotationText from '../components/ui/AnnotationText';
import StickerTag from '../components/ui/StickerTag';
import Tilt3D from '../components/ui/Tilt3D';
import ProjectVideo from '../components/ui/ProjectVideo';
import ArchitectureDiagram from '../components/illustrations/ArchitectureDiagram';
import CodeWindow from '../components/illustrations/CodeWindow';
import TerminalWindow from '../components/illustrations/TerminalWindow';
import DBSchemaDiagram from '../components/illustrations/DBSchemaDiagram';
import APICard from '../components/illustrations/APICard';
import PhoneFrame, { ChatBubble } from '../components/illustrations/PhoneFrame';
import PlayCard from '../components/illustrations/PlayCard';
import ExplodedView from '../components/three/ExplodedView';

// Interactive simulations, each loaded only on its own page
const SIMS = {
    hirelens: lazy(() => import('../simulations/HireLensSim')),
    docket: lazy(() => import('../simulations/DocketSim')),
    secpipe: lazy(() => import('../simulations/SecPipeSim')),
    parafootball: lazy(() => import('../simulations/ParaFootballSim')),
};

// Every project that has a case study, in the order projects.js lists them
const caseStudySlugs = projects.map((p) => p.slug).filter((slug) => slug && caseStudies[slug]);

const renderHero = (hero) => {
    if (!hero) return null;
    switch (hero.type) {
        case 'architecture':
            return <ArchitectureDiagram rows={hero.rows} />;
        case 'phone':
            return (
                <PhoneFrame>
                    {hero.messages.map((message, i) => (
                        <ChatBubble key={i} {...message} />
                    ))}
                </PhoneFrame>
            );
        case 'terminal':
            return <TerminalWindow title={hero.title} lines={hero.lines} />;
        case 'play':
            return <PlayCard url={hero.url} />;
        default:
            return null;
    }
};

const CaseStudy = () => {
    const { slug } = useParams();
    const reduced = usePrefersReducedMotion();
    const study = caseStudies[slug];

    if (!study) {
        return <Navigate to="/work" replace />;
    }

    const currentIndex = caseStudySlugs.indexOf(slug);
    const count = caseStudySlugs.length;
    const prev = projects.find((p) => p.slug === caseStudySlugs[(currentIndex - 1 + count) % count]);
    const next = projects.find((p) => p.slug === caseStudySlugs[(currentIndex + 1) % count]);

    const heroIsDiagram = study.hero.type === 'architecture';
    const diagramRows = study.architecture?.rows || (heroIsDiagram && !study.exploded ? study.hero.rows : null);
    const hasArchitecture = Boolean(study.exploded || diagramRows || study.architecture?.bullets || study.schema || study.apiCard);
    const Sim = study.simulation ? SIMS[study.simulation] : null;

    // Sections present on this page, numbered in order, for the jump bar
    const sections = [
        { id: 'overview', label: 'Overview' },
        { id: 'how', label: 'How it works' },
        hasArchitecture && { id: 'architecture', label: 'Architecture' },
        Sim && { id: 'try', label: 'Try it' },
        (study.incidents?.length > 0 || study.runTable) && { id: 'broke', label: study.incidents?.length ? 'What broke' : 'The numbers' },
        { id: 'lessons', label: 'Lessons' },
    ]
        .filter(Boolean)
        .map((sec, i) => ({ ...sec, n: String(i + 1).padStart(2, '0') }));
    const num = (id) => sections.find((sec) => sec.id === id)?.n;

    return (
        <div className="py-4 md:py-8">
            <CaseStudyHero
                title={study.title}
                codename={study.codename}
                tagline={study.tagline}
                role={study.role}
                timeline={study.timeline}
                tags={study.tags}
                links={study.links}
                illustration={renderHero(study.hero)}
            />

            {/* Jump bar */}
            <nav aria-label="On this page" className="mb-2 -mx-1 flex gap-2 overflow-x-auto pb-2">
                {sections.map((sec) => (
                    <button
                        key={sec.id}
                        type="button"
                        onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })}
                        className="shrink-0 rounded-full border border-border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-text-secondary hover:border-accent-warm hover:text-accent-warm transition-colors"
                    >
                        <span className="text-accent-warm mr-1.5">{sec.n}</span>
                        {sec.label}
                    </button>
                ))}
            </nav>

            {/* Overview: problem + stats, video beside it */}
            <CaseStudySection id="overview" index={num('overview')} title="Overview">
                <div className={`grid gap-6 lg:gap-10 ${study.video ? 'lg:grid-cols-2' : ''} items-start`}>
                    <div>
                        {study.villain && (
                            <p className="mb-4 rounded-xl border-l-2 border-accent-warm bg-bg-secondary px-4 py-3">
                                <span className="block font-mono text-[10px] uppercase tracking-widest text-accent-warm mb-1">The opponent</span>
                                <span className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight leading-tight">{study.villain}</span>
                            </p>
                        )}
                        <p className="text-[15px] md:text-base text-text-secondary leading-relaxed mb-6">{study.problem}</p>
                        <ResultsGrid results={study.results} compact />
                    </div>
                    {study.video && (
                        <div id="watch" className="scroll-mt-28 lg:sticky lg:top-28">
                            <ProjectVideo video={study.video} title={study.title} />
                        </div>
                    )}
                </div>
            </CaseStudySection>

            <CaseStudySection id="how" index={num('how')} title="How it works">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {study.approach.map((beat, i) => (
                        <Tilt3D key={i} max={5} className="group rounded-2xl border border-border bg-bg-elevated p-5">
                            <span className="kit-number absolute right-4 top-2 font-display font-extrabold text-5xl leading-none select-none" aria-hidden="true">
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <h3 className="relative text-xl font-display font-bold uppercase tracking-tight leading-tight mb-2 pr-12">{beat.heading}</h3>
                            <p className="relative text-sm text-text-secondary leading-relaxed">{beat.body}</p>
                        </Tilt3D>
                    ))}
                </div>
            </CaseStudySection>

            {hasArchitecture && (
                <CaseStudySection id="architecture" index={num('architecture')} title="Architecture" aside={study.exploded ? 'Scroll: the casing opens and every part gets labelled.' : null}>
                    {study.exploded ? (
                        <ExplodedView parts={study.exploded.parts} caption={study.exploded.caption} />
                    ) : (
                        diagramRows && <ArchitectureDiagram rows={diagramRows} />
                    )}
                    {(study.architecture?.bullets || study.codeSnippet) && (
                        <div className={`mt-6 grid gap-6 ${study.codeSnippet && study.architecture?.bullets ? 'lg:grid-cols-2' : ''} items-start`}>
                            {study.architecture?.bullets && (
                                <ul className="space-y-2.5">
                                    {study.architecture.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-cool flex-shrink-0" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {study.codeSnippet && <CodeWindow {...study.codeSnippet} />}
                        </div>
                    )}
                    {(study.schema || study.apiCard) && (
                        <div className="mt-6 grid md:grid-cols-2 gap-6">
                            {study.schema && <DBSchemaDiagram tables={study.schema.tables} />}
                            {study.apiCard && <APICard {...study.apiCard} />}
                        </div>
                    )}
                </CaseStudySection>
            )}

            {Sim && (
                <CaseStudySection id="try" index={num('try')} title="Try it yourself" aside={study.simIntro}>
                    <div className="@container">
                        <Suspense fallback={<div className="panel h-96 animate-pulse" />}>
                            <Sim mission={{ links: { live: study.links.demo } }} />
                        </Suspense>
                    </div>
                </CaseStudySection>
            )}

            {(study.incidents?.length > 0 || study.runTable) && (
                <CaseStudySection id="broke" index={num('broke')} title={study.incidents?.length ? 'What broke' : 'The numbers'}>
                    <div className={`grid gap-6 ${study.incidents?.length && study.runTable ? 'lg:grid-cols-2' : study.incidents?.length > 1 ? 'md:grid-cols-2' : ''} items-start`}>
                        {study.incidents?.length > 0 && (
                            <div className={`grid gap-4 ${!study.runTable && study.incidents.length > 1 ? 'md:col-span-2 md:grid-cols-2' : ''}`}>
                                {study.incidents.map((inc) => (
                                    <Tilt3D key={inc.title} max={4} className="group rounded-2xl border border-border bg-bg-elevated p-5">
                                        <div className="flex items-start gap-3 mb-2">
                                            <AlertTriangle size={18} className="text-gold mt-0.5 shrink-0" aria-hidden="true" />
                                            <h3 className="text-xl font-display font-bold uppercase tracking-tight leading-tight">{inc.title}</h3>
                                        </div>
                                        <p className="text-sm text-text-secondary leading-relaxed">{inc.body}</p>
                                    </Tilt3D>
                                ))}
                            </div>
                        )}
                        {study.runTable && (
                            <div className="rounded-2xl border border-border bg-bg-elevated overflow-hidden">
                                <p className="px-5 py-3 border-b border-border bg-bg-secondary font-mono text-[11px] uppercase tracking-widest text-accent-warm">{study.runTable.title}</p>
                                <dl className="divide-y divide-border">
                                    {study.runTable.rows.map(([k, v]) => (
                                        <div key={k} className="px-5 py-3">
                                            <dt className="font-display text-base font-bold uppercase tracking-tight mb-0.5">{k}</dt>
                                            <dd className="text-sm text-text-secondary leading-relaxed">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}
                    </div>
                </CaseStudySection>
            )}

            <CaseStudySection id="lessons" index={num('lessons')} title="Lessons">
                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
                    {study.lessons ? (
                        <ol className="space-y-4">
                            {study.lessons.map((l, i) => (
                                <li key={i} className="flex gap-4">
                                    <span className="font-display text-2xl font-extrabold text-gold leading-none w-6 shrink-0">{i + 1}</span>
                                    <p className="text-text-secondary leading-relaxed">{l}</p>
                                </li>
                            ))}
                        </ol>
                    ) : (
                        study.annotation && <AnnotationText>{study.annotation.text}</AnnotationText>
                    )}
                    {study.stack && (
                        <div className="rounded-2xl border border-border bg-bg-elevated p-5">
                            <p className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-3">Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {study.stack.map((tech) => (
                                    <StickerTag key={tech} tone="ink">
                                        {tech}
                                    </StickerTag>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CaseStudySection>

            <CaseStudyNav prev={prev} next={next} />
        </div>
    );
};

export default CaseStudy;
