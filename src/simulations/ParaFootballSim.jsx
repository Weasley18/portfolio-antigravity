import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize, Pause, Play, RotateCcw } from 'lucide-react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';
import { Eyebrow, SimFrame } from './SimFrame';
import { createBoard, LEVELS, TEAMS } from './parafootball/brain';

const tabs = [
    { id: 'brain', label: 'The CPU brain' },
    { id: 'game', label: 'Play the real game' },
];

const jobs = [
    ['PRESS', 'The outfielder nearest the ball goes for it. Far off, he first cuts the carrier off from goal.'],
    ['COVER', 'The back gets on the line between the carrier and his own goal, and steps in when the carrier arrives.'],
    ['MARK', 'With the ball loose, the back stands goal-side of the nearest forward.'],
    ['WIDTH / SLANT', 'In possession, the forward alternates holding the width with slanting in behind.'],
    ['CARRY', 'With the ball: run at goal, go round whoever is in the way, then pass or shoot at the side the keeper left.'],
    ['KEEPER · SHOW', 'The keeper narrows the angle and gets across to shots. When he has it, teammates spread wide to show for it.'],
];

const levelRows = [
    ['Top speed', (k) => `${(k.speed / 50).toFixed(1)} m/s`],
    ['Thinks every', (k) => `${k.think} s`],
    ['Shot scatter', (k) => `±${((k.err / 2) * 57.3).toFixed(0)}°`],
    ['Holds the ball', (k) => `${k.hold} s`],
    ['Poke chance', (k) => `${Math.round(k.poke * 100)}% a think`],
    ['Keeper saves', (k) => `${Math.round(k.save * 100)}%`],
];

function Segmented({ label, value, options, onChange }) {
    return (
        <div role="group" aria-label={label} className="flex rounded-xl border border-border bg-bg-elevated p-0.5">
            {options.map(([v, text]) => (
                <button
                    key={v}
                    type="button"
                    aria-pressed={value === v}
                    onClick={() => onChange(v)}
                    className={`min-h-[36px] flex-1 rounded-lg px-2.5 text-sm font-bold capitalize ${value === v ? 'bg-[#060B19] text-white' : ''}`}
                >
                    {text}
                </button>
            ))}
        </div>
    );
}

function Toggle({ label, checked, onChange }) {
    return (
        <label className="flex min-h-[40px] cursor-pointer items-center gap-2 rounded-xl border border-border bg-bg-elevated px-3 text-sm font-bold">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#0B57B0]" />
            {label}
        </label>
    );
}

function Board() {
    const reduced = usePrefersReducedMotion();
    const canvasRef = useRef(null);
    const wrapRef = useRef(null);
    const boardRef = useRef(null);
    const canFullscreen = typeof document !== 'undefined' && !!document.fullscreenEnabled;
    const [levels, setLevels] = useState(['medium', 'medium']);
    const [opts, setOpts] = useState({ jobs: true, targets: true, slow: false });
    const [paused, setPaused] = useState(reduced);
    const [stats, setStats] = useState({ stepsPerSec: 0, fps: 0, score: [0, 0] });
    const initial = useRef({ levels, reduced });

    useEffect(() => {
        const board = createBoard(canvasRef.current, { onStats: setStats, levels: initial.current.levels, reducedMotion: initial.current.reduced });
        boardRef.current = board;
        return () => board.dispose();
    }, []);

    const setLevel = (team, lv) => {
        setLevels((l) => l.map((x, i) => (i === team ? lv : x)));
        boardRef.current?.setLevel(team, lv);
    };
    const setOpt = (key, v) => {
        setOpts((o) => ({ ...o, [key]: v }));
        boardRef.current?.setOption(key, v);
    };
    const togglePause = () => {
        const next = !paused;
        setPaused(next);
        boardRef.current?.setPaused(next);
    };

    return (
        <div className="flex flex-col gap-5 p-5 @2xl:p-6">
            <div ref={wrapRef} className="board-wrap overflow-hidden rounded-xl border border-border">
                <canvas
                    ref={canvasRef}
                    className="block w-full cursor-crosshair touch-none select-none"
                    style={{ aspectRatio: '1540 / 700' }}
                    role="img"
                    aria-label={`Top-down three-a-side match, ${TEAMS[0].name} ${stats.score[0]}, ${TEAMS[1].name} ${stats.score[1]}. Click the court to drop the ball there.`}
                />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn-primary !min-h-[44px]" onClick={togglePause}>
                    {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />} {paused ? 'Play' : 'Pause'}
                </button>
                <button type="button" className="btn-ghost !min-h-[44px]" onClick={() => boardRef.current?.restart()}>
                    <RotateCcw size={18} aria-hidden="true" /> Kick off again
                </button>
                {canFullscreen && (
                    <button type="button" className="btn-ghost !min-h-[44px]" onClick={() => wrapRef.current?.requestFullscreen?.().catch(() => {})}>
                        <Maximize size={18} aria-hidden="true" /> Full screen
                    </button>
                )}
                <Toggle label="Show each kid’s job" checked={opts.jobs} onChange={(v) => setOpt('jobs', v)} />
                <Toggle label="Show where they’re heading" checked={opts.targets} onChange={(v) => setOpt('targets', v)} />
                <Toggle label="Slow motion" checked={opts.slow} onChange={(v) => setOpt('slow', v)} />
                <p className="font-mono text-xs font-bold text-text-secondary" aria-live="off">
                    {stats.stepsPerSec} physics steps/s · {stats.fps} frames/s
                </p>
            </div>
            <p className="-mt-2 text-sm text-text-secondary">Click or tap anywhere on the court to drop the ball there, and watch everyone pick a new job.</p>

            <div className="grid gap-5 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-xl border border-border bg-bg-elevated p-4">
                    <Eyebrow>The three tiers, straight from the game</Eyebrow>
                    <div className="mb-3 grid gap-2 @lg:grid-cols-2">
                        {TEAMS.map((t, i) => (
                            <div key={t.name}>
                                <p className="mb-1 flex items-center gap-1.5 text-sm font-bold">
                                    <span className="h-3 w-3 rounded-full border border-border" style={{ background: t.kit }} aria-hidden="true" />
                                    {t.name}
                                </p>
                                <Segmented
                                    label={`${t.name} difficulty`}
                                    value={levels[i]}
                                    onChange={(v) => setLevel(i, v)}
                                    options={Object.keys(LEVELS).map((k) => [k, k])}
                                />
                            </div>
                        ))}
                    </div>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="font-mono text-[11px] uppercase text-text-secondary">
                                <th className="py-1 font-bold"> </th>
                                {TEAMS.map((t, i) => (
                                    <th key={t.name} className="py-1 font-bold">
                                        {t.name} · {levels[i]}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {levelRows.map(([label, fmt]) => (
                                <tr key={label} className="border-t border-border">
                                    <th scope="row" className="py-1 pr-2 font-bold">
                                        {label}
                                    </th>
                                    {levels.map((lv, i) => (
                                        <td key={i} className="py-1 font-mono">
                                            {fmt(LEVELS[lv])}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                        In the real game the CPU side plays at the tier you pick, and your own CPU teammate always plays at Hard. The physics runs 120 fixed steps a second
                        whatever the screen does; slow motion just feeds it less time, so the same rules play out slower.
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-bg-secondary p-4">
                    <Eyebrow>Who does what</Eyebrow>
                    <dl className="flex flex-col gap-2 text-sm leading-snug">
                        {jobs.map(([k, v]) => (
                            <div key={k}>
                                <dt className="inline rounded border border-border bg-bg-elevated px-1.5 font-mono text-[11px] font-bold">{k}</dt> <dd className="inline">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    );
}

function RealGame({ url }) {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="p-5 @2xl:p-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-[#060B19]">
                {loaded ? (
                    <iframe src={url} title="Para Football, a 3D Kolkata street football game" className="absolute inset-0 h-full w-full" allow="autoplay; fullscreen; gamepad" />
                ) : (
                    <div className="halftone-accent absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
                        <p className="font-display text-5xl tracking-wide text-white" style={{ textShadow: '4px 4px 0 #111' }}>
                            Para Football
                        </p>
                        <p className="max-w-md font-bold text-white">The full 3D game: one web page, no image or model files, every sound made live. It waits for your click.</p>
                        <button type="button" className="btn-pop" onClick={() => setLoaded(true)}>
                            <Play size={18} aria-hidden="true" /> Load the game
                        </button>
                    </div>
                )}
            </div>
            <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 font-bold">
                Open it full screen <ExternalLink size={16} aria-hidden="true" />
            </a>
        </div>
    );
}

export default function ParaFootballSim({ mission }) {
    const [tab, setTab] = useState('brain');
    return (
        <SimFrame
            title="Watch the CPU think"
            label="REAL TIERS AND RULES · TOP-DOWN PORT"
            tabs={tabs}
            active={tab}
            onTab={setTab}
            footer="A flattened port of the game’s CPU brain: same constants, tiers and formation, same decisions about who presses, covers and runs. Fouls, fights, free kicks and replays live only in the real game."
        >
            {tab === 'brain' ? <Board /> : <RealGame url={mission.links.live} />}
        </SimFrame>
    );
}
