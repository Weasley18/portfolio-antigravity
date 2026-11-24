import { useState } from 'react';
import { Bug, Check, Play, ShieldAlert } from 'lucide-react';
import usePlayback from '../usePlayback';
import { Eyebrow } from '../SimFrame';
import { evalCases, evalChecks, fairness, harnessBugs } from './data';

const ROW_GAP = 110;

function Dot({ state }) {
    const style = state === 'pass' ? 'bg-[#2FB36B]' : state === 'edge' ? 'bg-[#EDBB00] text-[#0A1022]' : 'bg-bg-elevated';
    return <span className={`h-3.5 w-3.5 rounded-full border border-border ${style}`} aria-hidden="true" />;
}

function BugCard({ bug }) {
    const [fixed, setFixed] = useState(false);
    const out = fixed ? bug.after : bug.before;
    return (
        <li className="flex flex-col gap-3 rounded-xl border border-border bg-bg-elevated p-4">
            <p className="flex items-start gap-2 font-bold leading-snug">
                <Bug size={18} aria-hidden="true" className="mt-0.5 shrink-0" /> {bug.title}
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">{bug.bug}</p>
            <div className="flex rounded-xl border border-border p-0.5" role="group" aria-label={`Harness version for: ${bug.title}`}>
                {[
                    [false, 'With the bug'],
                    [true, 'Fixed'],
                ].map(([v, label]) => (
                    <button
                        key={label}
                        type="button"
                        aria-pressed={fixed === v}
                        onClick={() => setFixed(v)}
                        className={`min-h-[36px] flex-1 rounded-lg px-2 text-sm font-bold ${fixed === v ? 'bg-[#060B19] text-white' : 'bg-bg-elevated'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="rounded-lg border border-border bg-[#060B19] p-2.5 font-mono text-[12px] leading-relaxed text-white" aria-live="polite">
                <span
                    className={`mr-2 rounded px-1.5 font-bold ${out.verdict === 'PASS' ? 'bg-[#8EF0A4] text-text-primary' : out.verdict === 'CRASH' ? 'bg-garnet text-white text-white' : 'bg-[#EDBB00] text-[#0A1022] text-text-primary'}`}
                >
                    {out.verdict}
                </span>
                {out.text}
            </div>
            {fixed && (
                <pre className="whitespace-pre-wrap break-all rounded-lg border border-border bg-bg-secondary p-2.5 font-mono text-[11px] leading-relaxed">
                    {bug.diff.map((d) => (
                        <span key={d} className={`block ${d.startsWith('-') ? 'text-accent-warm' : 'text-[#1E8F52]'}`}>
                            {d}
                        </span>
                    ))}
                </pre>
            )}
        </li>
    );
}

export default function EvalPanel() {
    const [rows, setRows] = useState(0);
    const { play, stop, playing } = usePlayback();
    const done = rows >= evalCases.length;

    const run = () => {
        stop();
        setRows(0);
        play(
            evalCases.map((_, i) => ({ at: 150 + i * ROW_GAP, n: i + 1 })),
            (e) => setRows(e.n),
        );
    };

    const flagged = evalCases.filter((c) => c.flag);

    return (
        <div className="flex flex-col gap-6 p-5 @2xl:p-6">
            <div className="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
                {[
                    ['24 × 5', 'cases × runs: 120 real analyses'],
                    ['21/24', 'cases pass every check'],
                    ['3', 'flagged, none a wrong answer'],
                    ['0', 'prompt injections that worked'],
                ].map(([v, l]) => (
                    <div key={l} className="rounded-xl border border-border bg-bg-secondary p-3">
                        <div className="font-display text-4xl leading-none tracking-wide">{v}</div>
                        <div className="mt-1 text-sm leading-snug">{l}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 @4xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
                <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <Eyebrow className="!mb-0">The real suite · GPT-6 Luna · 5 runs per case</Eyebrow>
                        <button type="button" className="btn-primary !min-h-[40px] text-sm" onClick={run} disabled={playing}>
                            <Play size={16} aria-hidden="true" /> {done ? 'Replay it again' : 'Replay the real run'}
                        </button>
                    </div>
                    <ol className="flex list-none flex-col gap-1 rounded-xl border border-border bg-bg-elevated p-2 @lg:p-3">
                        {evalCases.map((c, i) => {
                            const reached = rows > i;
                            const state = !reached ? 'idle' : c.flag ? 'flag' : 'pass';
                            return (
                                <li key={c.id} className={`rounded-lg px-2 py-1 ${state === 'flag' ? 'bg-[#EDBB00]/20' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 shrink-0 font-mono text-[11px] font-bold text-text-secondary">{String(i + 1).padStart(2, '0')}</span>
                                        <span className="min-w-0 flex-1 truncate text-sm" title={c.label}>
                                            {c.label}
                                            {c.injection && <ShieldAlert size={13} aria-label="prompt-injection case" className="ml-1 inline align-[-2px] text-accent-warm" />}
                                        </span>
                                        <span className="flex shrink-0 gap-1">
                                            {[0, 1, 2, 3, 4].map((r) => (
                                                <Dot key={r} state={!reached ? 'idle' : c.edgeRun === r ? 'edge' : 'pass'} />
                                            ))}
                                        </span>
                                        <span className="hidden w-14 shrink-0 text-right font-mono text-[11px] font-bold @lg:inline">{reached ? c.range || '' : ''}</span>
                                        <span
                                            className={`w-12 shrink-0 rounded border text-center font-mono text-[10px] font-bold ${state === 'pass' ? 'border-border bg-[#BFF0C8]' : state === 'flag' ? 'border-border bg-[#EDBB00] text-[#0A1022]' : 'border-border text-text-secondary'
                                                }`}
                                        >
                                            {state === 'idle' ? '—' : state === 'pass' ? 'PASS' : 'FLAG'}
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                        Score ranges are the ones the HireLens README reports for this run; blank where it gives none. A yellow dot is a single run that sat on the consistency rule’s edge.
                    </p>
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                    <div>
                        <Eyebrow>Every run is checked for</Eyebrow>
                        <ul className="flex list-none flex-col gap-1.5 p-0">
                            {evalChecks.map((c) => (
                                <li key={c.name} className="flex gap-2 text-sm leading-snug">
                                    <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-[#1E8F52]" />
                                    <span>
                                        <span className="font-bold">{c.name}:</span> {c.what}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-border bg-bg-elevated p-3">
                        <Eyebrow>Fairness pairs · average gap vs the 5-point limit</Eyebrow>
                        <ul className="flex list-none flex-col gap-2 p-0">
                            {fairness.map((f) => (
                                <li key={f.pair}>
                                    <div className="flex justify-between text-sm">
                                        <span>{f.label}</span>
                                        <span className="font-mono font-bold">{done ? `${f.diff} pts` : '…'}</span>
                                    </div>
                                    <div className="relative mt-1 h-3 rounded-full border border-border bg-bg-secondary">
                                        <div className="h-full rounded-full bg-blau text-white transition-[width] duration-500" style={{ width: done ? `${(f.diff / 5) * 100}%` : '0%' }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {done && (
                        <div className="rounded-xl border border-border bg-[#EDBB00]/20 p-3" role="status">
                            <Eyebrow className="!text-text-primary">Why three cases are flagged</Eyebrow>
                            <ul className="flex list-none flex-col gap-2 p-0 text-sm leading-snug">
                                {flagged.map((c) => (
                                    <li key={c.id}>
                                        <span className="font-bold">{c.label}:</span> {c.flag}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-2 text-sm leading-snug">Documented rather than tuned away. The next step is a score band, or the median of three calls.</p>
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="font-display text-3xl tracking-wide">Testing the tests</h3>
                <p className="mb-3 max-w-3xl leading-relaxed text-text-secondary">
                    Real runs found three bugs, all in the harness rather than the model. Flip each one between the buggy harness and the fix.
                </p>
                <ul className="grid list-none gap-4 p-0 @2xl:grid-cols-3">
                    {harnessBugs.map((b) => (
                        <BugCard key={b.id} bug={b} />
                    ))}
                </ul>
            </div>
        </div>
    );
}
