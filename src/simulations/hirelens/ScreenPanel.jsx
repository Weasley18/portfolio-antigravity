import { useRef, useState } from 'react';
import { AlertTriangle, Braces, Check, FileText, Play, RotateCcw, ShieldCheck, X } from 'lucide-react';
import usePlayback from '../usePlayback';
import { Eyebrow } from '../SimFrame';
import { candidates, consistencyIssues, fieldOrder, job, pipeline, skillAliases } from './data';

const STAGE_GAP = 480;
const FIELD_GAP = 520;

function buildEvents() {
    const events = pipeline.slice(0, 6).map((_, i) => ({ at: i * STAGE_GAP, stage: i }));
    const streamStart = 5 * STAGE_GAP + 380;
    fieldOrder.forEach((f, i) => events.push({ at: streamStart + i * FIELD_GAP, field: f }));
    const end = streamStart + fieldOrder.length * FIELD_GAP;
    events.push({ at: end, stage: 6 });
    events.push({ at: end + 520, stage: 7 });
    return events;
}
const EVENTS = buildEvents();

const severityStyle = {
    severe: 'bg-[#FFC4CC]',
    moderate: 'bg-[#EDBB00] text-[#0A1022]',
    minor: 'bg-bg-secondary',
};

function textOf(c) {
    return c.lines.map((l) => l.text).join('\n');
}

function extractSkills(text) {
    const lower = text.toLowerCase();
    return Object.entries(skillAliases)
        .filter(([, spellings]) => spellings.some((s) => new RegExp(`(^|[^a-z])${s.replace(/[.+]/g, '\\$&')}`).test(lower)))
        .map(([name]) => name);
}

// The output as the API returns it: the schema's fields only, no page-only cites.
function analysisJson(a, fields) {
    const out = {};
    fieldOrder.forEach((f) => {
        if (!fields.includes(f)) return;
        const v = a[f];
        out[f] = Array.isArray(v)
            ? v.map((x) => {
                if (f === 'strengths') return x.text;
                const { cites: _c, ...rest } = x;
                return rest;
            })
            : v;
    });
    return JSON.stringify(out, null, 2);
}

function ScoreRing({ score }) {
    const r = 34;
    const c = 2 * Math.PI * r;
    const tone = score >= 85 ? '#2FB36B' : score >= 65 ? '#5E9EFF' : score >= 40 ? '#E8A400' : '#E5484D';
    return (
        <svg viewBox="0 0 84 84" className="h-24 w-24 shrink-0" role="img" aria-label={`Fit score ${score} out of 100`}>
            <circle cx="42" cy="42" r={r} fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="3" />
            <circle cx="42" cy="42" r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth="9" />
            <circle
                cx="42"
                cy="42"
                r={r}
                fill="none"
                stroke={tone}
                strokeWidth="9"
                strokeDasharray={`${(score / 100) * c} ${c}`}
                transform="rotate(-90 42 42)"
                style={{ transition: 'stroke-dasharray 600ms ease-out' }}
            />
            <text x="42" y="49" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontSize="26" fontWeight="700" fill="var(--text-primary)">
                {score}
            </text>
        </svg>
    );
}

function DocLine({ line, lit }) {
    return (
        <li
            className={`flex gap-2 rounded-lg px-2 py-1.5 text-[15px] leading-snug transition-colors ${lit ? 'bg-[#EDBB00] text-[#0A1022] outline outline-[3px] outline-accent-warm' : ''} ${line.injection ? 'text-accent-warm' : ''
                }`}
        >
            <span className="w-6 shrink-0 font-mono text-xs font-bold text-text-secondary">{line.id}</span>
            <span>
                {line.text}
                {line.injection && <span className="ml-1 rounded border border-accent-warm px-1 font-mono text-[10px] font-bold uppercase">instruction in the document</span>}
            </span>
        </li>
    );
}

function Cites({ cites }) {
    const all = [...cites.jd, ...cites.resume];
    return <span className="font-mono text-[11px] font-bold text-text-secondary">[{all.length ? all.join(', ') : 'no evidence'}]</span>;
}

export default function ScreenPanel() {
    const [candidateId, setCandidateId] = useState('ronak');
    const [stage, setStage] = useState(-1);
    const [fields, setFields] = useState([]);
    const [focus, setFocus] = useState(null);
    const [showJson, setShowJson] = useState(false);
    const { play, stop, playing, reduced } = usePlayback();
    const runRef = useRef(null);

    const candidate = candidates.find((c) => c.id === candidateId);
    const a = candidate.analysis;
    const text = textOf(candidate);
    const skills = extractSkills(text);
    const keywordHits = job.lines.filter((l) => text.toLowerCase().includes(l.keyword));
    const check = consistencyIssues(a);
    const done = stage >= 7;
    const has = (f) => fields.includes(f);

    const reset = (id = candidateId) => {
        stop();
        setCandidateId(id);
        setStage(-1);
        setFields([]);
        setFocus(null);
        setShowJson(false);
    };

    const run = () => {
        reset();
        // On narrow layouts the pipeline sits below the documents: bring it into view.
        const el = runRef.current;
        if (el && el.getBoundingClientRect().top > window.innerHeight * 0.75) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
        play(EVENTS, (e) => {
            if (e.stage !== undefined) setStage(e.stage);
            if (e.field) setFields((f) => [...f, e.field]);
        });
    };

    const focusProps = (cites) => ({
        onMouseEnter: () => setFocus(cites),
        onMouseLeave: () => setFocus(null),
        onFocus: () => setFocus(cites),
        onBlur: () => setFocus(null),
        tabIndex: 0,
    });

    const lit = (id) => !!focus && (focus.jd.includes(id) || focus.resume.includes(id));

    const json = showJson ? analysisJson(a, fields) : '';

    return (
        <div className="grid gap-6 p-5 @2xl:p-6 @4xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            {/* Documents */}
            <div className="flex min-w-0 flex-col gap-4">
                <fieldset>
                    <legend className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">Pick a resume (all made up)</legend>
                    <div className="grid grid-cols-2 gap-2">
                        {candidates.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                aria-pressed={candidateId === c.id}
                                onClick={() => reset(c.id)}
                                className={`flex min-h-[56px] flex-col items-start rounded-xl border border-border px-3 py-2 text-left ${candidateId === c.id ? 'bg-blau text-white text-white' : 'bg-bg-elevated hover:bg-bg-secondary'}`}
                            >
                                <span className="font-bold">{c.name}</span>
                                <span className="text-xs leading-tight">{c.blurb}</span>
                            </button>
                        ))}
                    </div>
                </fieldset>

                <div className="rounded-xl border border-border bg-bg-elevated p-4">
                    <p className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                        <FileText size={15} aria-hidden="true" /> Job description · {job.title}
                    </p>
                    <ol className="flex list-none flex-col gap-0.5 p-0">
                        {job.lines.map((l) => (
                            <DocLine key={l.id} line={l} lit={lit(l.id)} />
                        ))}
                    </ol>
                </div>

                <div className="rounded-xl border border-border bg-bg-secondary p-4">
                    <p className="mb-2 flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
                        <FileText size={15} aria-hidden="true" /> {candidate.name}’s resume
                        <span className="rounded border border-border bg-bg-elevated px-1.5 normal-case tracking-normal">{candidate.evalCase}</span>
                    </p>
                    <ol className="flex list-none flex-col gap-0.5 p-0">
                        {candidate.lines.map((l) => (
                            <DocLine key={l.id} line={l} lit={lit(l.id)} />
                        ))}
                    </ol>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button type="button" className="btn-primary" onClick={run} disabled={playing}>
                        <Play size={18} aria-hidden="true" /> {done ? 'Assess again' : playing ? 'Assessing…' : 'Assess this resume'}
                    </button>
                    {(done || playing) && (
                        <button type="button" className="btn-ghost" onClick={() => reset()}>
                            <RotateCcw size={18} aria-hidden="true" /> Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Run */}
            <div ref={runRef} className="flex min-w-0 scroll-mt-24 flex-col gap-4">
                <ol className="flex list-none flex-col gap-1.5 p-0" aria-label="Pipeline">
                    {pipeline.map((p, i) => {
                        const state = stage > i ? 'done' : stage === i ? 'active' : 'idle';
                        let detail = null;
                        if (state !== 'idle') {
                            if (p.id === 'browser') detail = `${text.length.toLocaleString()} characters of text sent; the PDF stays on the device`;
                            if (p.id === 'api') detail = 'access token in memory only · documents expire in 15:00';
                            if (p.id === 'queue') detail = 'job picked up · attempt 1 · budget 60 s';
                            if (p.id === 'skills')
                                detail = (
                                    <span className="flex flex-wrap gap-1">
                                        {skills.map((s) => (
                                            <span key={s} className="rounded border border-border bg-bg-elevated px-1.5 font-mono text-[11px] font-bold">
                                                {s}
                                            </span>
                                        ))}
                                    </span>
                                );
                            if (p.id === 'rag')
                                detail = (
                                    <ul className="flex list-none flex-col gap-0.5 p-0">
                                        {candidate.retrieved.map((r) => (
                                            <li key={r} className="truncate font-mono text-[11px]" title={r}>
                                                ↳ {r}
                                            </li>
                                        ))}
                                    </ul>
                                );
                            if (p.id === 'llm') detail = `${fields.length} of 5 fields complete`;
                            if (p.id === 'schema') detail = done ? 'valid · draft promoted to result' : 'checking the whole answer…';
                        }
                        return (
                            <li
                                key={p.id}
                                className={`rounded-xl border px-3 py-2 transition-colors ${state === 'done' ? 'border-border bg-bg-elevated' : state === 'active' ? 'border-border bg-[#EDBB00] text-[#0A1022]' : 'border-border bg-bg-elevated text-text-secondary'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] font-bold ${state === 'done' ? 'border-border bg-blau text-white text-white' : 'border-current'
                                            }`}
                                    >
                                        {state === 'done' ? <Check size={13} aria-hidden="true" /> : i + 1}
                                    </span>
                                    <span className="font-bold">{p.name}</span>
                                    {state === 'idle' && <span className="hidden min-w-0 truncate text-sm @lg:inline">· {p.what}</span>}
                                </div>
                                {detail && <div className="mt-1.5 pl-[34px] text-sm leading-snug">{detail}</div>}
                            </li>
                        );
                    })}
                </ol>

                {stage < 0 && (
                    <p className="rounded-xl border border-dashed border-border p-4 text-text-secondary">
                        Run the assessment, then hover or tab through the results. Each one lights up the lines it is grounded in.
                    </p>
                )}

                {fields.length > 0 && (
                    <div className="rounded-2xl border border-border bg-bg-elevated" aria-live="polite">
                        <div
                            className={`flex flex-wrap items-center gap-2 rounded-t-xl border-b border-border px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider ${done ? 'bg-[#BFF0C8]' : 'bg-[#EDBB00] text-[#0A1022]'
                                }`}
                        >
                            {done ? <ShieldCheck size={15} aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />}
                            {done ? 'Validated against analysis.schema.json' : 'Draft assessment · awaiting final validation'}
                        </div>

                        <div className="flex flex-col gap-4 p-4">
                            {has('fitScore') && (
                                <div className="flex items-center gap-4">
                                    <ScoreRing score={a.fitScore} />
                                    <div className="min-w-0">
                                        <p className="font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">fitScore · verdict</p>
                                        <p className="mt-1 font-bold leading-snug">{has('verdict') ? a.verdict : '…'}</p>
                                    </div>
                                </div>
                            )}

                            {has('gaps') && (
                                <div>
                                    <Eyebrow>Gaps worth probing</Eyebrow>
                                    <ul className="flex list-none flex-col gap-1.5 p-0">
                                        {a.gaps.map((g) => (
                                            <li key={g.skill} {...focusProps(g.cites)} className="flex flex-col gap-1.5 rounded-xl @lg:flex-row @lg:gap-2.5 border border-border p-2.5 hover:bg-bg-secondary focus:bg-bg-secondary">
                                                <span className={`h-fit w-fit shrink-0 rounded-md border border-border px-1.5 font-mono text-[11px] font-bold uppercase ${severityStyle[g.severity]}`}>
                                                    {g.severity}
                                                </span>
                                                <span className="text-[15px] leading-snug">
                                                    <span className="font-bold">{g.skill}:</span> {g.note} <Cites cites={g.cites} />
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {has('strengths') && (
                                <div>
                                    <Eyebrow>Evidenced strengths</Eyebrow>
                                    <ul className="flex list-none flex-col gap-1.5 p-0">
                                        {a.strengths.map((s) => (
                                            <li key={s.text} {...focusProps(s.cites)} className="flex gap-2.5 rounded-xl border border-border p-2.5 hover:bg-bg-secondary focus:bg-bg-secondary">
                                                <Check size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[#1E8F52]" />
                                                <span className="text-[15px] leading-snug">
                                                    {s.text} <Cites cites={s.cites} />
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {has('interviewQuestions') && (
                                <div>
                                    <Eyebrow>Interview questions</Eyebrow>
                                    <ol className="flex list-none flex-col gap-2 p-0">
                                        {a.interviewQuestions.map((q, i) => (
                                            <li key={q.question} {...focusProps(q.cites)} className="rounded-xl border border-border bg-bg-secondary p-2.5 hover:bg-bg-elevated focus:bg-bg-elevated">
                                                <p className="text-[15px] leading-snug">
                                                    <span className="font-display text-lg tracking-wide">Q{i + 1}.</span> {q.question}
                                                </p>
                                                <p className="mt-1 flex flex-wrap gap-1.5 font-mono text-[11px] font-bold">
                                                    <span className="rounded border border-border bg-bg-elevated px-1.5">targets: {q.targets}</span>
                                                    <span className="rounded border border-border bg-bg-elevated px-1.5">{q.difficulty}</span>
                                                    <Cites cites={q.cites} />
                                                </p>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {done && (
                    <div className="grid gap-3 @lg:grid-cols-2">
                        <div className="rounded-xl border border-border bg-bg-elevated p-3">
                            <p className="font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">A keyword screen says</p>
                            <p className="mt-1 font-display text-3xl tracking-wide">
                                {keywordHits.length}/{job.lines.length} keywords
                            </p>
                            <p className="mt-1 flex flex-wrap gap-1">
                                {job.lines.map((l) => {
                                    const hit = keywordHits.includes(l);
                                    return (
                                        <span
                                            key={l.id}
                                            className={`rounded border px-1.5 font-mono text-[11px] font-bold ${hit ? 'border-border bg-[#EDBB00] text-[#0A1022]' : 'border-border text-text-secondary line-through'}`}
                                        >
                                            {l.keyword}
                                        </span>
                                    );
                                })}
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-bg-elevated p-3">
                            <p className="font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">Consistency check (the real rule)</p>
                            <p className="mt-1 flex items-center gap-1.5 font-bold">
                                {check.issues.length ? <X size={18} aria-hidden="true" /> : <Check size={18} aria-hidden="true" className="text-[#1E8F52]" />}
                                {check.issues.length ? check.issues.join('; ') : 'No contradictions'}
                            </p>
                            <p className="mt-1 text-sm leading-snug text-text-secondary">
                                Gap weight {check.weight} (severe 4, moderate 2, minor 1). A score of 70 or more with weight 8 or more is flagged.
                            </p>
                        </div>
                    </div>
                )}

                {done && candidate.note && (
                    <p className="flex gap-2.5 rounded-xl border border-border bg-[#BFE3FF] p-3 text-[15px] leading-snug">
                        <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0" /> {candidate.note}
                    </p>
                )}

                {fields.length > 0 && (
                    <div>
                        <button type="button" className="btn-ghost !min-h-[40px] text-sm" aria-expanded={showJson} onClick={() => setShowJson((v) => !v)}>
                            <Braces size={16} aria-hidden="true" /> {showJson ? 'Hide' : 'Show'} the raw JSON
                        </button>
                        {showJson && (
                            <pre className="mt-2 max-h-80 overflow-auto rounded-xl border border-border bg-[#060B19] p-3 font-mono text-[12px] leading-relaxed text-white">{json}</pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
