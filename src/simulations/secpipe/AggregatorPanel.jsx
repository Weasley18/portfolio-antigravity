import { useState } from 'react';
import { ChevronLeft, ChevronRight, GitMerge } from 'lucide-react';
import { Eyebrow } from '../SimFrame';
import { aggSteps, rawFindings, sevRank } from './data';

const norm = (p) => p.toLowerCase().replace(/[-_.]+/g, '-');

// The three dedupe rules from secpipe/aggregator/dedupe.py, run on the demo
// findings. `upto` is how many rules to apply (0 to 3).
function dedupe(findings, upto) {
    const parent = findings.map((_, i) => i);
    const tools = findings.map((f) => new Set([f.tool]));
    const find = (i) => {
        while (parent[i] !== i) {
            parent[i] = parent[parent[i]];
            i = parent[i];
        }
        return i;
    };
    const union = (a, b) => {
        const ra = find(a);
        const rb = find(b);
        if (ra === rb) return;
        const keep = Math.min(ra, rb);
        const drop = Math.max(ra, rb);
        parent[drop] = keep;
        tools[drop].forEach((t) => tools[keep].add(t));
    };
    const canMergeTools = (a, b) => {
        const ra = find(a);
        const rb = find(b);
        return ra !== rb && ![...tools[ra]].some((t) => tools[rb].has(t));
    };

    if (upto >= 1) {
        const seen = {};
        findings.forEach((f, i) => {
            if (!f.fingerprint) return;
            if (seen[f.fingerprint] === undefined) seen[f.fingerprint] = i;
            else union(seen[f.fingerprint], i);
        });
    }
    if (upto >= 2) {
        const seen = {};
        findings.forEach((f, i) => {
            if (!f.pkg || !['sca', 'container'].includes(f.category)) return;
            const key = `${norm(f.pkg)}|${f.advisory}`;
            if (seen[key] === undefined) seen[key] = i;
            else union(seen[key], i);
        });
    }
    if (upto >= 3) {
        const byFile = {};
        findings.forEach((f, i) => {
            if (['sast', 'secret'].includes(f.category) && f.file && f.line && f.cwe) (byFile[`${f.file}|${f.cwe}`] ||= []).push(i);
        });
        Object.values(byFile).forEach((idx) => {
            const pairs = [];
            idx.forEach((a, p) =>
                idx.slice(p + 1).forEach((b) => {
                    if (findings[a].tool !== findings[b].tool) pairs.push([Math.abs(findings[a].line - findings[b].line), a, b]);
                }),
            );
            pairs.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
            pairs.forEach(([d, a, b]) => {
                if (d <= 2 && canMergeTools(a, b)) union(a, b);
            });
        });
    }
    const groups = {};
    findings.forEach((f, i) => (groups[find(i)] ||= []).push(f));
    return Object.keys(groups)
        .map(Number)
        .sort((a, b) => a - b)
        .map((k) => groups[k]);
}

const sevStyle = { critical: 'bg-garnet text-white text-white', high: 'bg-[#FFC4CC]', medium: 'bg-[#EDBB00] text-[#0A1022]', low: 'bg-bg-secondary' };

export default function AggregatorPanel() {
    const [step, setStep] = useState(0);
    const rulesApplied = Math.min(3, Math.max(0, step));
    const groups = dedupe(rawFindings, rulesApplied);
    const enriched = step >= 4;
    const diffed = step >= 5;
    const decided = step >= 6;
    const blocking = groups.filter((g) => {
        const sev = Math.max(...g.map((f) => sevRank[f.severity]));
        return g[0].category === 'secret' || sev >= sevRank.medium;
    });

    return (
        <div className="grid gap-6 p-5 @2xl:p-6 @4xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex min-w-0 flex-col gap-3">
                <p className="leading-relaxed">
                    Eighteen scanners produce eighteen reports in eighteen formats. The aggregator turns them into one list and one decision. Step through it with ten raw
                    findings shaped like the real ones.
                </p>
                <ol className="flex list-none flex-col gap-1.5 p-0">
                    {aggSteps.map((s, i) => (
                        <li key={s.id}>
                            <button
                                type="button"
                                onClick={() => setStep(i)}
                                aria-current={step === i ? 'step' : undefined}
                                className={`w-full rounded-xl border px-3 py-2 text-left ${step === i ? 'border-border bg-[#EDBB00] text-[#0A1022]' : step > i ? 'border-border bg-bg-elevated' : 'border-border bg-bg-elevated text-text-secondary'}`}
                            >
                                <span className="flex items-center gap-2 font-bold">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current font-mono text-[11px]">{i + 1}</span>
                                    {s.name}
                                </span>
                                {step === i && <span className="mt-1 block pl-8 text-sm leading-snug">{s.what}</span>}
                            </button>
                        </li>
                    ))}
                </ol>
                <div className="flex gap-2">
                    <button type="button" className="btn-ghost !min-h-[44px] !px-3" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label="Previous step">
                        <ChevronLeft size={18} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn-primary !min-h-[44px]" onClick={() => setStep((s) => Math.min(aggSteps.length - 1, s + 1))} disabled={step === aggSteps.length - 1}>
                        Next step <ChevronRight size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3" aria-live="polite">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <Eyebrow className="!mb-0">findings.json</Eyebrow>
                    <p className="font-display text-3xl leading-none tracking-wide">
                        {rawFindings.length} raw → {groups.length} unique
                    </p>
                </div>
                <ul className="flex list-none flex-col gap-2 p-0">
                    {groups.map((g) => {
                        const sev = g.reduce((m, f) => (sevRank[f.severity] > sevRank[m] ? f.severity : m), 'low');
                        const head = g[0];
                        const isBlocking = blocking.includes(g);
                        return (
                            <li key={g.map((f) => f.id).join()} className={`rounded-xl border border-border bg-bg-elevated p-2.5 ${g.length > 1 ? 'shadow-[3px_3px_0_#111]' : ''}`}>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    {g.length > 1 && <GitMerge size={15} aria-label="merged" />}
                                    <span className={`rounded px-1.5 font-mono text-[10px] font-bold uppercase ${sevStyle[sev]}`}>{sev}</span>
                                    <span className="font-mono text-[10px] font-bold uppercase text-text-secondary">{head.category}</span>
                                    <span className="min-w-0 text-sm font-bold">{head.pkg ? `${norm(head.pkg)}@5.3.1 · ${head.advisory}` : head.title}</span>
                                    {decided && (
                                        <span className={`ml-auto rounded border border-border px-1.5 font-mono text-[10px] font-bold ${isBlocking ? 'bg-[#060B19] text-white' : 'bg-bg-secondary'}`}>
                                            {isBlocking ? (head.category === 'secret' ? 'BLOCK · secret' : `BLOCK · ≥ medium`) : 'WARN'}
                                        </span>
                                    )}
                                </div>
                                <ul className="mt-1.5 flex list-none flex-col gap-0.5 p-0">
                                    {g.map((f) => (
                                        <li key={f.id} className="flex flex-wrap gap-x-2 font-mono text-[11px] leading-snug">
                                            <span className="font-bold">{f.tool}</span>
                                            <span className="text-text-secondary">{f.file ? `${f.file}:${f.line}${f.cwe ? ` · ${f.cwe}` : ''}` : f.where}</span>
                                            {f.pkg && <span className="text-text-secondary">{f.title}</span>}
                                            {!f.pkg && f !== head && <span className="text-text-secondary">{f.title}</span>}
                                        </li>
                                    ))}
                                </ul>
                                {enriched && head.advisory && (
                                    <p className="mt-1.5 font-mono text-[11px] font-bold">EPSS 0.06 · under the 0.1 bump · stays {sev}</p>
                                )}
                                {diffed && <p className="mt-0.5 font-mono text-[11px] text-text-secondary">new against main</p>}
                            </li>
                        );
                    })}
                </ul>
                {decided && (
                    <div className="rounded-2xl border border-border bg-[#060B19] p-4 text-white" role="status">
                        <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#EDBB00]">secpipe gate · branch main · block_at_or_above: medium</p>
                        <p className="mt-1 font-display text-4xl tracking-wide">exit 1 · blocked</p>
                        <p className="mt-1 leading-snug text-white/85">
                            {blocking.length} of {groups.length} findings block. In the real run the same rules took 11,223 raw results to 7,516 unique (−33%).
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
