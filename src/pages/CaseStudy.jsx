import { useParams, Navigate } from 'react-router-dom';
import { caseStudies, projects } from '../data';
import CaseStudyHero from '../components/case-study/CaseStudyHero';
import CaseStudySection from '../components/case-study/CaseStudySection';
import ResultsGrid from '../components/case-study/ResultsGrid';
import CaseStudyNav from '../components/case-study/CaseStudyNav';
import AnnotationText from '../components/ui/AnnotationText';
import ArchitectureDiagram from '../components/illustrations/ArchitectureDiagram';
import CodeWindow from '../components/illustrations/CodeWindow';
import TerminalWindow from '../components/illustrations/TerminalWindow';
import DBSchemaDiagram from '../components/illustrations/DBSchemaDiagram';
import APICard from '../components/illustrations/APICard';
import PhoneFrame, { ChatBubble } from '../components/illustrations/PhoneFrame';

const flagshipSlugs = projects.filter((p) => p.isFlagship).map((p) => p.slug);

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
        default:
            return null;
    }
};

const CaseStudy = () => {
    const { slug } = useParams();
    const study = caseStudies[slug];

    if (!study) {
        return <Navigate to="/work" replace />;
    }

    const currentIndex = flagshipSlugs.indexOf(slug);
    const prevSlug = flagshipSlugs[(currentIndex - 1 + flagshipSlugs.length) % flagshipSlugs.length];
    const nextSlug = flagshipSlugs[(currentIndex + 1) % flagshipSlugs.length];
    const prev = projects.find((p) => p.slug === prevSlug);
    const next = projects.find((p) => p.slug === nextSlug);

    const hasSecondArchitecture = study.hero.type !== 'architecture' && study.architecture;

    return (
        <div className="py-4 md:py-8">
            <CaseStudyHero
                title={study.title}
                tagline={study.tagline}
                role={study.role}
                timeline={study.timeline}
                tags={study.tags}
                links={study.links}
                illustration={renderHero(study.hero)}
            />

            <CaseStudySection index="01" title="The Problem">
                <p className="text-lg text-text-secondary leading-relaxed max-w-3xl">{study.problem}</p>
            </CaseStudySection>

            <CaseStudySection index="02" title="The Approach">
                {(() => {
                    const showCodeHere = study.codeSnippet && study.hero.type === 'architecture';
                    return (
                        <div className={showCodeHere ? 'grid md:grid-cols-2 gap-8 md:gap-10' : 'max-w-2xl'}>
                            <div className="space-y-8">
                                {study.approach.map((beat, i) => (
                                    <div key={i}>
                                        <h3 className="text-lg font-display font-semibold mb-2">{beat.heading}</h3>
                                        <p className="text-text-secondary leading-relaxed">{beat.body}</p>
                                    </div>
                                ))}
                            </div>
                            {showCodeHere && <CodeWindow {...study.codeSnippet} />}
                        </div>
                    );
                })()}
            </CaseStudySection>

            <CaseStudySection index="03" title="Architecture">
                {study.hero.type === 'architecture' ? (
                    <>
                        <ArchitectureDiagram rows={study.hero.rows} />
                        {study.architecture?.bullets && (
                            <ul className="mt-8 space-y-3 max-w-2xl">
                                {study.architecture.bullets.map((bullet, i) => (
                                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-cool flex-shrink-0" />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                ) : (
                    hasSecondArchitecture && (
                        <>
                            <ArchitectureDiagram rows={study.architecture.rows} />
                            {study.architecture.bullets && (
                                <ul className="mt-8 space-y-3 max-w-2xl">
                                    {study.architecture.bullets.map((bullet, i) => (
                                        <li key={i} className="flex items-start gap-3 text-text-secondary">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent-cool flex-shrink-0" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )
                )}

                {(study.schema || study.apiCard || study.codeSnippet) && study.hero.type !== 'architecture' && (
                    <div className="mt-10">{study.codeSnippet && <CodeWindow {...study.codeSnippet} />}</div>
                )}

                {(study.schema || study.apiCard) && (
                    <div className="mt-10 grid md:grid-cols-2 gap-6">
                        {study.schema && <DBSchemaDiagram tables={study.schema.tables} />}
                        {study.apiCard && <APICard {...study.apiCard} />}
                    </div>
                )}
            </CaseStudySection>

            <CaseStudySection index="04" title="Results">
                <ResultsGrid results={study.results} />
                {study.annotation && (
                    <p className="mt-8">
                        <AnnotationText>{study.annotation.text}</AnnotationText>
                    </p>
                )}
            </CaseStudySection>

            <CaseStudyNav prev={prev} next={next} />
        </div>
    );
};

export default CaseStudy;
