import { useState } from 'react';
import { ArrowDown, Ban, Check, GitPullRequest, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import usePlayback from '../usePlayback';
import { Eyebrow } from '../SimFrame';
import { flaws, jobs, realRuns, SCAN_STAGES } from './data';

const ALL = flaws.map((f) => f.n);

function evaluate(selected) {
    const picked = flaws.filter((f) => selected.includes(f.n));
    const caught = Object.fromEntries(jobs.map((j) => [j.id, picked.filter((f) => f.stages.includes(j.id))]));
    const atGate1 = picked.filter((f) => f.stages.some((s) => SCAN_STAGES.includes(s)));
    const missed = picked.filter((f) => !f.stages.length);
    return { picked, caught, block: atGate1.length > 0, atGate1, missed };
}

function timeline(block) {
    const ev = [{ at: 0, phase: 'scan' }];
    jobs.forEach((j, i) => ev.push({ at: 450 + i * 260, job: j.id }));
    ev.push({ at: 1900, phase: 'gate1' });
    if (block) ev.push({ at: 2500, phase: 'gate2' });
    else ev.push({ at: 2500, phase: 'publish' }, { at: 3200, phase: 'deploy' }, { at: 3900, phase: 'gate2' });
    return ev;
}

function Box({ state, title, sub, children }) {
    const style = {
        idle: 'border-border bg-bg-elevated text-text-secondary',
        running: 'border-border bg-[#EDBB00] text-[#0A1022] animate-pulse',
        pass: 'border-border bg-[#BFF0C8]',
        found: 'border-border bg-[#FFC4CC]',
        block: 'border-border bg-[#060B19] text-white',
        skipped: 'border-dashed border-border bg-bg-elevated text-text-secondary line-through decoration-2',
    }[state];
    return (
        <div className={`rounded-xl border px-3 py-2 transition-colors ${style}`}>
            <p className="font-mono text-sm font-bold">{title}</p>
            {sub && <p className="text-xs leading-snug">{sub}</p>}
            {children}
        </div>
    );
}

export default function PullRequestPanel() {
    const [selected, setSelected] = useState(ALL);
    const [jobsDone, setJobsDone] = useState([]);
    const [phase, setPhase] = useState('idle');
    const { play, stop, playing } = usePlayback();
    const r = evaluate(selected);
    const order = ['idle', 'scan', 'gate1', 'publish', 'deploy', 'gate2'];
    const reached = (p) => order.indexOf(phase) >= order.indexOf(p);
    const preset = selected.length === 14 ? 'vulnerable' : selected.length === 0 ? 'main' : null;

    const reset = (next = selected) => {
        stop();
        setSelected(next);
        setJobsDone([]);
        setPhase('idle');
    };
    const toggle = (n) => reset(selected.includes(n) ? selected.filter((x) => x !== n) : [...selected, n].sort((a, b) => a - b));

    const run = () => {
        reset();
        play(timeline(r.block), (e) => {
            if (e.phase) setPhase(e.phase);
            if (e.job) setJobsDone((d) => [...d, e.job]);
        });
    };

    const done = phase === 'gate2' && !playing;

    return (
        <div className="grid gap-6 p-5 @2xl:p-6 @4xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                    {[
                        ['vulnerable', 'vulnerable branch (all 14)', ALL],
                        ['main', 'main (clean)', []],
                    ].map(([id, label, set]) => (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={preset === id}
                            onClick={() => reset(set)}
                            className={`min-h-[44px] rounded-xl border border-border px-3 font-mono text-sm font-bold ${preset === id ? 'bg-blau text-white text-white' : 'bg-bg-elevated hover:bg-bg-secondary'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <fieldset>
                    <legend className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">Planted flaws in this PR · {selected.length}/14</legend>
                    <ul className="grid list-none gap-1 p-0 @lg:grid-cols-2 @4xl:grid-cols-1">
                        {flaws.map((f) => (
                            <li key={f.n}>
                                <label className={`flex min-h-[40px] cursor-pointer items-start gap-2 rounded-lg border px-2 py-1.5 text-sm leading-snug ${selected.includes(f.n) ? 'border-border bg-bg-elevated' : 'border-border bg-bg-elevated text-text-secondary'}`}>
                                    <input type="checkbox" checked={selected.includes(f.n)} onChange={() => toggle(f.n)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0B57B0]" />
                                    <span className="w-6 shrink-0 font-mono text-xs font-bold">#{f.n}</span>
                                    <span>{f.label}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <div className="rounded-xl border border-border bg-[#060B19] p-3 text-white">
                    <p className="mb-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#EDBB00]">
                        <GitPullRequest size={15} aria-hidden="true" /> {preset === 'main' ? 'main: nothing planted' : 'The diff'}
                    </p>
                    <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed">
                        {r.picked.length
                            ? r.picked.map((f) => `# flaw #${f.n}\n${f.code.split('\n').map((l) => `+ ${l}`).join('\n')}`).join('\n')
                            : '  (the hardened SecNotes app, as merged)'}
                    </pre>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button type="button" className="btn-primary" onClick={run} disabled={playing}>
                        <Play size={18} aria-hidden="true" /> {done ? 'Push again' : 'Open the pull request'}
                    </button>
                    {phase !== 'idle' && (
                        <button type="button" className="btn-ghost" onClick={() => reset()}>
                            <RotateCcw size={18} aria-hidden="true" /> Reset
                        </button>
                    )}
                </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3" aria-live="polite">
                <Eyebrow>Nine CI jobs, every action pinned by SHA</Eyebrow>
                <div className="grid grid-cols-1 gap-2 @lg:grid-cols-2">
                    {jobs.map((j) => {
                        const finished = jobsDone.includes(j.id);
                        const hits = r.caught[j.id];
                        const state = !reached('scan') ? 'idle' : !finished ? 'running' : hits.length ? 'found' : 'pass';
                        return (
                            <Box key={j.id} state={state} title={j.name} sub={j.tools}>
                                {finished && (
                                    <p className="mt-1 flex flex-wrap gap-1 font-mono text-[11px] font-bold">
                                        {hits.length ? hits.map((f) => <span key={f.n} className="rounded border border-border bg-bg-elevated px-1">#{f.n}</span>) : 'clean'}
                                    </p>
                                )}
                            </Box>
                        );
                    })}
                </div>
                <ArrowDown size={20} aria-hidden="true" className="mx-auto" />
                <Box
                    state={!reached('gate1') ? 'idle' : r.block ? 'block' : 'pass'}
                    title="Gate 1 · aggregator + policy.yaml"
                    sub={reached('gate1') ? (r.block ? `exit 1 · ${r.atGate1.length} planted flaw${r.atGate1.length === 1 ? '' : 's'} found by the scans · merge blocked` : 'exit 0 · nothing at or above medium that is new') : 'dedupe, EPSS and KEV, diff against main, then policy'}
                />
                <ArrowDown size={20} aria-hidden="true" className="mx-auto" />
                <div className="grid gap-2 @lg:grid-cols-2">
                    <Box
                        state={!reached('gate1') ? 'idle' : r.block ? 'skipped' : reached('publish') ? 'pass' : 'idle'}
                        title="publish"
                        sub={reached('gate1') && r.block ? 'never ran' : 'push by digest, Cosign keyless signature, SBOM attestation, SLSA provenance'}
                    />
                    <Box
                        state={!reached('gate1') ? 'idle' : r.block ? 'skipped' : reached('deploy') ? 'pass' : 'idle'}
                        title="deploy-dast"
                        sub={reached('gate1') && r.block ? 'never ran' : 'kind via Terraform, Kyverno checks the signature, admission and NetworkPolicy tests, ZAP'}
                    />
                </div>
                <ArrowDown size={20} aria-hidden="true" className="mx-auto" />
                <Box
                    state={!reached('gate2') ? 'idle' : r.block ? 'block' : 'pass'}
                    title="Gate 2 · PR comment, SARIF, Issues, metrics"
                    sub={reached('gate2') ? (r.block ? 'required check failed: secpipe-gate' : 'required check passed: secpipe-gate') : 'reports everywhere a reviewer looks'}
                />

                {done && (
                    <div className="rounded-2xl border border-border bg-bg-elevated" role="status">
                        <div className={`flex items-center gap-2 rounded-t-xl border-b border-border px-4 py-2 font-bold ${r.block ? 'bg-[#FFC4CC]' : 'bg-[#BFF0C8]'}`}>
                            {r.block ? <Ban size={18} aria-hidden="true" /> : <ShieldCheck size={18} aria-hidden="true" />}
                            secpipe-bot: {r.block ? 'merge blocked' : 'all checks passed'}
                        </div>
                        <div className="flex flex-col gap-2 p-4 text-sm leading-snug">
                            {r.atGate1.map((f) => (
                                <p key={f.n}>
                                    <span className="font-mono font-bold">#{f.n}</span> {f.label}
                                    {f.severity && <span className="ml-1 rounded border border-border bg-[#EDBB00] text-[#0A1022] px-1 font-mono text-[10px] font-bold uppercase">{f.severity}</span>}
                                    <span className="block text-xs text-text-secondary">
                                        {f.tools.join(' · ')}
                                        {f.policy ? ` · ${f.policy}` : ''}
                                        {f.note ? ` · ${f.note}` : ''}
                                    </span>
                                </p>
                            ))}
                            {r.missed.map((f) => (
                                <p key={f.n} className="rounded-lg border border-dashed border-border bg-bg-secondary p-2">
                                    <span className="font-mono font-bold">#{f.n}</span> {f.label}: <span className="font-bold">not caught.</span> {f.note}
                                </p>
                            ))}
                            {!r.picked.length && <p>No new findings at or above medium. The image was signed, admitted and scanned live.</p>}
                        </div>
                    </div>
                )}

                {done && (
                    <div className="rounded-xl border border-border bg-bg-secondary p-3">
                        {preset ? (
                            <>
                                <Eyebrow className="flex items-center gap-1.5 !text-text-primary">
                                    <Check size={14} aria-hidden="true" /> {realRuns[preset].title}
                                </Eyebrow>
                                <dl className="grid gap-1 text-sm leading-snug">
                                    {realRuns[preset].rows.map(([k, v]) => (
                                        <div key={k} className="grid grid-cols-[120px_1fr] gap-2">
                                            <dt className="font-bold">{k}</dt>
                                            <dd>{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </>
                        ) : (
                            <p className="text-sm leading-snug text-text-secondary">
                                A custom mix shows which jobs catch which flaws. Pick “vulnerable branch” or “main” to see the numbers from the real runs.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
