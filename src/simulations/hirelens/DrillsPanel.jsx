import { useState } from 'react';
import { Check, Database, Play, X, Zap } from 'lucide-react';
import usePlayback from '../usePlayback';
import { Eyebrow, LogLine } from '../SimFrame';
import { drills } from './data';

const BUDGET = 60;
const LINE_GAP = 650;

function BudgetBar({ drill, shown }) {
    const segments = drill.budget || [];
    const total = drill.log.length;
    const progress = total ? shown / total : 0;
    return (
        <div>
            <Eyebrow>One analysis gets 60 seconds in total</Eyebrow>
            <div className="relative h-12 rounded-xl border border-border bg-bg-elevated">
                {segments.map((s) => (
                    <div
                        key={s.label}
                        className={`absolute top-1 bottom-1 flex items-center overflow-hidden rounded-md border border-border px-1.5 font-mono text-[10px] font-bold transition-opacity ${s.tone === 'bad' ? 'bg-[#FFC4CC]' : 'bg-[#BFF0C8]'
                            }`}
                        style={{
                            left: `${(s.from / BUDGET) * 100}%`,
                            width: `${Math.max(1.2, ((s.to - s.from) / BUDGET) * 100)}%`,
                            opacity: progress > 0 ? 1 : 0.25,
                        }}
                    >
                        <span className="truncate">{s.label}</span>
                    </div>
                ))}
                <div className="absolute top-0 bottom-0 border-l border-dashed border-accent-warm" style={{ left: `${(50 / BUDGET) * 100}%` }} aria-hidden="true" />
            </div>
            <div className="relative mt-1 h-4 font-mono text-[11px] font-bold text-text-secondary">
                <span className="absolute left-0">0 s</span>
                <span className="absolute -translate-x-full whitespace-nowrap pr-1 text-accent-warm" style={{ left: `${(50 / BUDGET) * 100}%` }}>
                    a retry must start by 50 s
                </span>
                <span className="absolute right-0">60 s</span>
            </div>
        </div>
    );
}

export default function DrillsPanel() {
    const [drillId, setDrillId] = useState('schema');
    const [shown, setShown] = useState(0);
    const { play, stop, playing } = usePlayback();
    const drill = drills.find((d) => d.id === drillId);
    const finished = shown >= drill.log.length;

    const pick = (id) => {
        stop();
        setDrillId(id);
        setShown(0);
    };

    const run = () => {
        stop();
        setShown(0);
        play(
            drill.log.map((_, i) => ({ at: 200 + i * LINE_GAP, n: i + 1 })),
            (e) => setShown(e.n),
        );
    };

    return (
        <div className="grid gap-6 p-5 @2xl:p-6 @4xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col gap-4">
                <p className="leading-relaxed">
                    The job flows through a queue, a worker and two services, so things go wrong in between. Each drill below follows the real code path in the HireLens repo.
                </p>
                <fieldset>
                    <legend className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">Pick a failure</legend>
                    <div className="flex flex-col gap-2">
                        {drills.map((d) => (
                            <button
                                key={d.id}
                                type="button"
                                aria-pressed={drillId === d.id}
                                onClick={() => pick(d.id)}
                                className={`flex min-h-[52px] items-start gap-2.5 rounded-xl border border-border px-3 py-2 text-left ${drillId === d.id ? 'bg-blau text-white text-white' : 'bg-bg-elevated hover:bg-bg-secondary'}`}
                            >
                                {d.id === 'ingest' ? <Database size={18} aria-hidden="true" className="mt-0.5 shrink-0" /> : <Zap size={18} aria-hidden="true" className="mt-0.5 shrink-0" />}
                                <span>
                                    <span className="block font-bold">{d.label}</span>
                                    <span className="block text-sm leading-snug">{d.blurb}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </fieldset>
                <button type="button" className="btn-primary self-start" onClick={run} disabled={playing}>
                    <Play size={18} aria-hidden="true" /> {finished ? 'Run it again' : 'Run the drill'}
                </button>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                {drill.budget ? (
                    <BudgetBar drill={drill} shown={shown} />
                ) : (
                    <div>
                        <Eyebrow>Rows in "KnowledgeChunk"</Eyebrow>
                        <div className="flex flex-col gap-2">
                            {drill.rows.map((n, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="w-14 font-mono text-xs font-bold">run {i + 1}</span>
                                    <div className="h-8 flex-1 rounded-lg border border-border bg-bg-elevated">
                                        <div
                                            className="flex h-full items-center rounded-[5px] bg-blau text-white px-2 font-mono text-xs font-bold text-white transition-[width] duration-500"
                                            style={{ width: shown > i * 2 + 1 ? `${(n / 146) * 100}%` : '0%' }}
                                        >
                                            {shown > i * 2 + 1 ? n : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <p className="font-mono text-[11px] font-bold text-text-secondary">bar width is out of 146, what a naive re-run would leave</p>
                        </div>
                    </div>
                )}

                <ol className="flex min-h-[176px] list-none flex-col gap-1 rounded-xl border border-border bg-[#060B19] p-4" aria-live="polite" aria-label="Worker log">
                    {shown === 0 && <LogLine>$ waiting for the drill…</LogLine>}
                    {drill.log.slice(0, shown).map((l, i) => (
                        <LogLine key={i} t={l.t} tone={l.tone}>
                            {l.text}
                        </LogLine>
                    ))}
                </ol>

                {finished && (
                    <div className={`flex gap-3 rounded-2xl border border-border p-4 ${drill.outcome.tone === 'good' ? 'bg-[#BFF0C8]' : 'bg-[#FFC4CC]'}`} role="status">
                        {drill.outcome.tone === 'good' ? <Check size={26} aria-hidden="true" className="shrink-0" /> : <X size={26} aria-hidden="true" className="shrink-0" />}
                        <div>
                            <p className="font-display text-3xl tracking-wide">{drill.outcome.title}</p>
                            <p className="mt-1 leading-relaxed">{drill.outcome.body}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
