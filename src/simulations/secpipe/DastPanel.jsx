import { useState } from 'react';
import { Check, Play, Unplug, X } from 'lucide-react';
import usePlayback from '../usePlayback';
import { Eyebrow, LogLine } from '../SimFrame';
import { dastModes } from './data';

const LINE_GAP = 700;

export default function DastPanel() {
    const [modeId, setModeId] = useState('before');
    const [shown, setShown] = useState(0);
    const [urls, setUrls] = useState(0);
    const { play, stop, playing } = usePlayback();
    const mode = dastModes.find((m) => m.id === modeId);
    const finished = shown >= mode.log.length;

    const pick = (id) => {
        stop();
        setModeId(id);
        setShown(0);
        setUrls(0);
    };

    const run = () => {
        stop();
        setShown(0);
        setUrls(0);
        const steps = 12;
        const ev = mode.log.map((_, i) => ({ at: 150 + i * LINE_GAP, n: i + 1 }));
        const span = LINE_GAP * (mode.log.length - 1);
        for (let k = 1; k <= steps; k += 1) ev.push({ at: 150 + (span * k) / steps, u: Math.round((mode.stopAt * k) / steps) });
        play(ev, (e) => {
            if (e.n) setShown(e.n);
            if (e.u) setUrls(e.u);
        });
    };

    const silent = mode.id !== 'healthy' && shown >= 2;

    return (
        <div className="grid gap-6 p-5 @2xl:p-6 @4xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col gap-4">
                <p className="leading-relaxed">
                    DAST attacks the running app, so it depends on reaching it. SecPipe once trusted a scan whose target had quietly disappeared. This is that bug, and the fix.
                </p>
                <fieldset>
                    <legend className="mb-2 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">Pick a run</legend>
                    <div className="flex flex-col gap-2">
                        {dastModes.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                aria-pressed={modeId === m.id}
                                onClick={() => pick(m.id)}
                                className={`flex min-h-[48px] items-center gap-2 rounded-xl border border-border px-3 py-2 text-left font-bold ${modeId === m.id ? 'bg-blau text-white text-white' : m.id === 'before' ? 'bg-[#EDBB00] text-[#0A1022]' : 'bg-bg-elevated hover:bg-bg-secondary'}`}
                            >
                                {m.id !== 'healthy' && <Unplug size={17} aria-hidden="true" className="shrink-0" />}
                                {m.label}
                            </button>
                        ))}
                    </div>
                </fieldset>
                <button type="button" className="btn-primary self-start" onClick={run} disabled={playing}>
                    <Play size={18} aria-hidden="true" /> {finished ? 'Scan again' : 'Start the ZAP scan'}
                </button>
            </div>

            <div className="flex min-w-0 flex-col gap-4">
                <div className="rounded-xl border border-border bg-bg-elevated p-3">
                    <Eyebrow>ZAP → {mode.transport} → SecNotes ({mode.id === 'healthy' ? 'vulnerable build' : 'planted SQL injection inside'})</Eyebrow>
                    <div className="flex items-center gap-2">
                        <span className="rounded-lg border border-border bg-[#060B19] px-2 py-1 font-mono text-xs font-bold text-[#EDBB00]">ZAP</span>
                        <span className={`h-1 flex-1 rounded ${silent ? 'border-t border-dashed border-accent-warm bg-transparent' : 'bg-[#060B19]'}`} aria-hidden="true" />
                        <span className={`rounded-lg border border-border px-2 py-1 font-mono text-xs font-bold ${silent ? 'bg-[#FFC4CC]' : 'bg-[#BFF0C8]'}`}>{silent ? 'no answer' : 'SecNotes'}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="h-4 flex-1 rounded-full border border-border bg-bg-secondary">
                            <div className="h-full rounded-full bg-blau text-white transition-[width] duration-300" style={{ width: `${(urls / mode.total) * 100}%` }} />
                        </div>
                        <span className="w-32 text-right font-mono text-xs font-bold">{mode.id === 'healthy' ? `${urls} URLs` : silent ? 'probes unanswered' : urls ? 'scanning…' : ''}</span>
                    </div>
                </div>

                <ol className="flex min-h-[160px] list-none flex-col gap-1 rounded-xl border border-border bg-[#060B19] p-4" aria-live="polite" aria-label="CI log">
                    {shown === 0 && <LogLine>$ scripts/ci/zap.sh … api</LogLine>}
                    {mode.log.slice(0, shown).map((l, i) => (
                        <LogLine key={i} tone={l.tone}>
                            {l.text}
                        </LogLine>
                    ))}
                </ol>

                {finished && (
                    <div className={`flex gap-3 rounded-2xl border border-border p-4 ${mode.outcome.tone === 'good' ? 'bg-[#BFF0C8]' : 'bg-[#FFC4CC]'}`} role="status">
                        {mode.outcome.tone === 'good' ? <Check size={26} aria-hidden="true" className="shrink-0" /> : <X size={26} aria-hidden="true" className="shrink-0" />}
                        <div>
                            <p className="font-display text-3xl tracking-wide">{mode.outcome.title}</p>
                            <p className="mt-1 leading-relaxed">{mode.outcome.body}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
