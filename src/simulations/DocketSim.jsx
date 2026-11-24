import { useEffect, useRef, useState } from 'react';
import { Gavel, Lock, MessageSquare, RotateCcw, Scale, Send, ShieldCheck, Unlock, Users } from 'lucide-react';
import usePlayback from './usePlayback';
import { Eyebrow, SimFrame } from './SimFrame';
import {
    ATTACK_PATTERN,
    BANNED_TOKENS,
    caseFile,
    DEBATE_SPEECHES,
    DEFLECTION,
    GAME_TTL,
    genericReplies,
    JAILBREAK_RAW,
    MAX_QUESTIONS,
    otherJurors,
    presetQuestions,
    QUESTION_COOLDOWN,
    SECRET_KEYS,
    speeches,
} from './docket/data';

const GAME_ID = 'K7Q2';
// Wall-clock reads happen in event handlers only.
const clock = () => Date.now();
const THINK = 950;

const counsel = {
    prosecution: { ...caseFile.prosecution, short: 'Prosecution', icon: Scale, style: 'bg-[#FFC4CC]' },
    defense: { ...caseFile.defense, short: 'Defense', icon: ShieldCheck, style: 'bg-[#BFE3FF]' },
};

// The real output filter, trimmed to the parts this demo can trigger.
function filterOutput(text) {
    const lower = text.toLowerCase();
    const hit = BANNED_TOKENS.find((t) => lower.includes(t));
    if (hit) return { text: DEFLECTION, caught: hit };
    if (lower.includes(caseFile.solution.toLowerCase())) return { text: DEFLECTION, caught: 'solution text' };
    return { text, caught: null };
}

// evidence_check from app/graph/nodes.py: at most one exhibit per turn, in order.
function evidenceCheck(revealed, round, text) {
    for (const item of caseFile.evidence) {
        if (revealed.includes(item.id)) continue;
        if (item.reveal.type === 'round_gte' && round >= item.reveal.value) return item;
        if (item.reveal.type === 'keyword' && text.toLowerCase().includes(item.reveal.value)) return item;
    }
    return null;
}

function fmtTtl(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

/* ---------- side panels ---------- */

const NODES = {
    classify_intent: { x: 180, y: 20, label: 'classify_intent' },
    next_argument: { x: 46, y: 84, label: 'next_argument' },
    counsel_respond: { x: 135, y: 84, label: 'counsel_respond' },
    call_vote: { x: 225, y: 84, label: 'call_vote' },
    cast_vote: { x: 314, y: 84, label: 'cast_vote' },
    evidence_check: { x: 135, y: 140, label: 'evidence_check' },
    END: { x: 225, y: 192, label: 'END' },
};
const EDGES = [
    ['classify_intent', 'next_argument'],
    ['classify_intent', 'counsel_respond'],
    ['classify_intent', 'call_vote'],
    ['classify_intent', 'cast_vote'],
    ['counsel_respond', 'evidence_check'],
    ['next_argument', 'END'],
    ['evidence_check', 'END'],
    ['call_vote', 'END'],
    ['cast_vote', 'END'],
];

function GraphView({ path }) {
    const on = (id) => path.includes(id);
    const edgeOn = (a, b) => on(a) && (on(b) || (b === 'END' && path.length > 0 && path[path.length - 1] === a));
    return (
        <div className="rounded-xl border border-border bg-bg-elevated p-3">
            <Eyebrow>LangGraph · one turn per event</Eyebrow>
            <svg viewBox="0 0 360 210" className="w-full" role="img" aria-label={path.length ? `Active path: ${path.join(' to ')}` : 'Turn graph, idle'}>
                {EDGES.map(([a, b]) => {
                    const A = NODES[a];
                    const B = NODES[b];
                    const lit = edgeOn(a, b);
                    return <line key={a + b} x1={A.x} y1={A.y + 11} x2={B.x} y2={B.y - 11} stroke={lit ? '#5E9EFF' : 'var(--border)'} strokeWidth={lit ? 3 : 1.5} />;
                })}
                {Object.entries(NODES).map(([id, n]) => {
                    const lit = on(id) || (id === 'END' && path.length > 0);
                    const w = id === 'END' ? 44 : 86;
                    return (
                        <g key={id}>
                            <rect x={n.x - w / 2} y={n.y - 11} width={w} height={22} rx={6} fill={lit ? '#EDBB00' : 'var(--bg-elevated)'} stroke="var(--border)" strokeWidth={lit ? 2.5 : 1.5} />
                            <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8.5" fontWeight="700" fill={lit ? '#0A1022' : 'var(--text-primary)'}>
                                {n.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <p className="text-xs leading-snug text-text-secondary">State is checkpointed to SQLite after every turn, so a restart picks the trial up where it was.</p>
        </div>
    );
}

// SMIL animations added after load must be started by hand.
function Pulse({ from }) {
    const motion = useRef(null);
    const fade = useRef(null);
    useEffect(() => {
        motion.current?.beginElement();
        fade.current?.beginElement();
    }, []);
    return (
        <circle r="6" fill="#EDBB00" stroke="#060B19" strokeWidth="2" opacity="0">
            <animateMotion ref={motion} begin="indefinite" dur="0.9s" fill="freeze" path={from === 'A' ? 'M70 74 L170 112 L270 74' : 'M270 74 L170 112 L70 74'} />
            <animate ref={fade} attributeName="opacity" begin="indefinite" values="1;1;0" keyTimes="0;0.85;1" dur="0.9s" fill="freeze" />
        </circle>
    );
}

function WireView({ pulses, frames, ttl, joined, reduced }) {
    const chip = (name, x, y, here) => (
        <g key={name} opacity={here ? 1 : 0.25}>
            <rect x={x} y={y} width={46} height={18} rx={9} fill={name === 'You' ? '#0B57B0' : 'var(--bg-elevated)'} stroke="var(--border)" strokeWidth="1.5" />
            <text x={x + 23} y={y + 12.5} textAnchor="middle" fontSize="9" fontWeight="700" fontFamily="Barlow, sans-serif" fill={name === 'You' ? '#fff' : 'var(--text-primary)'}>
                {name}
            </text>
        </g>
    );
    return (
        <div className="rounded-xl border border-border bg-bg-elevated p-3">
            <Eyebrow>On the wire · 2 workers, 1 Redis</Eyebrow>
            <svg viewBox="0 0 340 150" className="w-full" role="img" aria-label="Two FastAPI workers sharing events through Redis pub/sub">
                <path d="M70 74 L170 112 L270 74" fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
                <rect x="10" y="8" width="120" height="66" rx="8" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
                <text x="70" y="24" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill="var(--text-primary)">worker A</text>
                {chip('You', 20, 36, joined.includes('you'))}
                {chip('Asha', 74, 36, joined.includes('asha'))}
                <rect x="210" y="8" width="120" height="66" rx="8" fill="var(--bg-secondary)" stroke="var(--border)" strokeWidth="2" />
                <text x="270" y="24" textAnchor="middle" fontSize="9.5" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill="var(--text-primary)">worker B</text>
                {chip('Dev', 247, 36, joined.includes('dev'))}
                <rect x="100" y="104" width="140" height="38" rx="8" fill="#060B19" stroke="var(--border)" />
                <text x="170" y="119" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#EDBB00" fontFamily="JetBrains Mono, monospace">Redis pub/sub</text>
                <text x="170" y="133" textAnchor="middle" fontSize="8.5" fill="#fff" fontFamily="JetBrains Mono, monospace">game:{GAME_ID}:ws</text>
                {!reduced && pulses.map((p) => <Pulse key={p.id} from={p.from} />)}
            </svg>
            <p className="mt-1 font-mono text-[11px] font-bold">
                SET game:{GAME_ID}:public · TTL {fmtTtl(ttl)} <span className="font-normal text-text-secondary">(refreshed on every move)</span>
            </p>
            <Eyebrow className="mt-3">Frames your browser received · newest first</Eyebrow>
            <ol className="flex max-h-48 list-none flex-col gap-1 overflow-auto rounded-lg bg-[#060B19] p-2" aria-live="polite">
                {frames.length === 0 && <li className="font-mono text-[11px] text-white/60">no socket yet</li>}
                {[...frames].reverse().map((f) => (
                    <li key={f.id} className="font-mono text-[11px] leading-snug text-white">
                        <span className={f.via === 'redis' ? 'text-[#EDBB00]' : 'text-[#8EF0A4]'}>{f.via === 'redis' ? '⇠ redis' : '⇠ local'}</span>{' '}
                        <span className="break-all">{f.json}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
}

function SealedView({ finished, frames, guard }) {
    const leaked = frames.filter((f) => !f.final && SECRET_KEYS.some((k) => f.json.includes(`"${k}"`))).length;
    const redact = (s) => s.replace(/[^\s]/g, '█');
    return (
        <div className={`rounded-xl border border-border p-3 ${finished ? 'bg-[#EDBB00]/20' : 'bg-bg-elevated'}`}>
            <Eyebrow className="flex items-center gap-1.5 !text-text-primary">
                {finished ? <Unlock size={14} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />} Sealed on the server
            </Eyebrow>
            <dl className="flex flex-col gap-1.5 font-mono text-[12px] leading-snug">
                <div>
                    <dt className="inline font-bold">verdict_truth: </dt>
                    <dd className="inline">{finished ? `"${caseFile.verdictTruth}"` : redact('not_guilty')}</dd>
                </div>
                <div>
                    <dt className="inline font-bold">solution: </dt>
                    <dd className="inline break-words">{finished ? `"${caseFile.solution}"` : `${redact(caseFile.solution.slice(0, 60))}…`}</dd>
                </div>
                <div>
                    <dt className="inline font-bold">briefs: </dt>
                    <dd className="inline">4 lines each, only inside that counsel’s own prompt</dd>
                </div>
            </dl>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold">
                <ShieldCheck size={16} aria-hidden="true" className="text-[#1E8F52]" />
                {finished ? 'Revealed in the verdict frame, as designed.' : `Secret keys in frames sent so far: ${leaked}`}
            </p>

            {guard && (
                <ol className="mt-3 flex list-none flex-col gap-1.5 border-t border-dashed border-border p-0 pt-3 text-[13px] leading-snug" aria-label="How the attack was stopped">
                    <li>
                        <span className="font-bold">1 · Prompt:</span> the counsel never sees verdict_truth or the solution, and carries a security block against requests like this.
                    </li>
                    <li>
                        <span className="font-bold">2 · Say the model is jailbroken anyway:</span>{' '}
                        <span className="rounded bg-[#FFC4CC] px-1 font-mono text-[12px]">{guard.raw}</span>
                    </li>
                    <li>
                        <span className="font-bold">3 · Output filter:</span> matched <span className="font-mono">“{guard.caught}”</span>, so the jury hears the deflection instead.
                    </li>
                    <li>
                        <span className="font-bold">4 · Serializer:</span> even a miss leaks nothing, because no frame carries the sealed fields until the trial is over.
                    </li>
                </ol>
            )}
        </div>
    );
}

/* ---------- courtroom ---------- */

function Entry({ e }) {
    if (e.kind === 'system')
        return <li className="text-center font-mono text-xs font-bold uppercase tracking-wider text-text-secondary">{e.text}</li>;
    if (e.kind === 'evidence')
        return (
            <li className="rounded-xl border border-dashed border-border bg-[#EDBB00]/20 px-3 py-2 text-[15px] leading-snug">
                <span className="font-mono text-xs font-bold uppercase">Evidence entered: </span>
                {e.text}
            </li>
        );
    const c = counsel[e.role];
    const Icon = c.icon;
    return (
        <li className="flex flex-col gap-2">
            {e.question && (
                <p className="ml-auto max-w-[85%] rounded-xl border border-border bg-bg-elevated px-3 py-2 text-[15px] leading-snug">
                    <span className="block font-mono text-[11px] font-bold uppercase text-text-secondary">You, to the {c.short.toLowerCase()}</span>
                    {e.question}
                </p>
            )}
            <div className="flex gap-2.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border ${c.style}`}>
                    <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        {c.name} · {e.question ? 'answer' : `speech ${e.n}/${DEBATE_SPEECHES}`}
                    </p>
                    <p className={`mt-0.5 rounded-xl border border-border px-3 py-2 leading-snug ${e.deflected ? 'bg-bg-secondary italic' : 'bg-bg-elevated'}`}>{e.text}</p>
                </div>
            </div>
        </li>
    );
}

export default function DocketSim() {
    const [status, setStatus] = useState('lobby');
    const [joined, setJoined] = useState([]);
    const [debateRound, setDebateRound] = useState(0);
    const [round, setRound] = useState(0);
    const [transcript, setTranscript] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [asked, setAsked] = useState(0);
    const [cooldownUntil, setCooldownUntil] = useState(0);
    const [now, setNow] = useState(0);
    const [ttlFrom, setTtlFrom] = useState(0);
    const [votes, setVotes] = useState({});
    const [frames, setFrames] = useState([]);
    const [path, setPath] = useState([]);
    const [pulses, setPulses] = useState([]);
    const [guard, setGuard] = useState(null);
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState('prosecution');
    const [draft, setDraft] = useState('');
    const [result, setResult] = useState(null);
    const seq = useRef(0);
    const listRef = useRef(null);
    const { play, stop, reduced } = usePlayback();

    // A 1-second clock for the cooldown and the lobby TTL.
    useEffect(() => {
        if (!joined.length) return undefined;
        const t = setInterval(() => setNow(clock()), 1000);
        return () => clearInterval(t);
    }, [joined.length]);

    // Keep the newest line in view.
    useEffect(() => {
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [transcript.length]);

    const cooldown = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
    const ttl = ttlFrom ? Math.max(0, GAME_TTL - Math.floor((now - ttlFrom) / 1000)) : GAME_TTL;
    const finished = status === 'finished';

    const touch = () => {
        const t = clock();
        setTtlFrom(t);
        setNow(t);
    };
    const frame = (type, payload, { via = 'local', final = false } = {}) => {
        seq.current += 1;
        const id = seq.current;
        setFrames((f) => [...f.slice(-7), { id, via, final, json: JSON.stringify({ type, payload }) }]);
    };
    const pulse = (from = 'A') => {
        seq.current += 1;
        const id = seq.current;
        setPulses((p) => [...p.slice(-3), { id, from }]);
    };
    const say = (entry) => setTranscript((t) => [...t, entry]);

    const reset = () => {
        stop();
        setStatus('lobby');
        setJoined([]);
        setDebateRound(0);
        setRound(0);
        setTranscript([]);
        setRevealed([]);
        setAsked(0);
        setCooldownUntil(0);
        setTtlFrom(0);
        setVotes({});
        setFrames([]);
        setPath([]);
        setPulses([]);
        setGuard(null);
        setBusy(false);
        setDraft('');
        setResult(null);
    };

    const openCourt = () => {
        setBusy(true);
        play(
            [
                { at: 0, who: 'you' },
                { at: 450, who: 'asha' },
                { at: 900, who: 'dev' },
            ],
            (e) => {
                setJoined((j) => [...j, e.who]);
                touch();
                if (e.who === 'you') {
                    frame('history', { status: 'lobby', debate_round: 0, transcript: [], evidence_revealed: [], vote_count: 0, max_questions: MAX_QUESTIONS });
                    say({ kind: 'system', text: `Game ${GAME_ID} created · you joined on worker A` });
                } else {
                    const j = otherJurors.find((x) => x.id === e.who);
                    say({ kind: 'system', text: `${j.name} joined on worker ${j.worker}` });
                    pulse(j.worker);
                }
            },
            () => setBusy(false),
        );
    };

    const deliverSpeech = (n) => {
        const role = n % 2 === 0 ? 'prosecution' : 'defense';
        const next = n + 1;
        const nextStatus = next >= DEBATE_SPEECHES ? 'questioning' : 'debating';
        say({ kind: 'argument', role, text: speeches[n], n: next });
        frame('argument', { agent_id: role, text: `${speeches[n].slice(0, 38)}…`, debate_round: next, status: nextStatus });
        frame('status', { status: nextStatus, debate_round: next });
        pulse('A');
        touch();
        setDebateRound(next);
        setRound((r) => r + 1);
        setStatus(nextStatus);
        if (nextStatus === 'questioning') say({ kind: 'system', text: 'Debate over · jurors may question either counsel' });
    };

    const nextArgument = () => {
        if (busy) return;
        setBusy(true);
        setPath(['classify_intent', 'next_argument']);
        if (status === 'lobby') setStatus('debating');
        const n = debateRound;
        play([{ at: THINK }], () => deliverSpeech(n), () => setBusy(false));
    };

    const skipDebate = () => {
        if (busy) return;
        for (let n = debateRound; n < DEBATE_SPEECHES; n += 1) deliverSpeech(n);
        setPath(['classify_intent', 'next_argument']);
    };

    const ask = (text, to, preset) => {
        const q = text.trim();
        if (!q || busy || status !== 'questioning') return;
        const t = clock();
        setNow(t);
        if (t < cooldownUntil) {
            frame('error', { detail: 'rate_limited', cooldown: QUESTION_COOLDOWN });
            return;
        }
        if (asked >= MAX_QUESTIONS) {
            frame('error', { detail: 'question_limit', questions_asked: asked, max_questions: MAX_QUESTIONS });
            return;
        }
        setBusy(true);
        setCooldownUntil(t + QUESTION_COOLDOWN * 1000);
        setPath(['classify_intent', 'counsel_respond', 'evidence_check']);
        setDraft('');

        const attack = preset?.attack || (!preset && ATTACK_PATTERN.test(q));
        let reply = preset?.reply || genericReplies[to];
        let deflected = false;
        if (attack) {
            const out = filterOutput(JAILBREAK_RAW);
            reply = out.text;
            deflected = true;
            setGuard({ raw: JAILBREAK_RAW, caught: out.caught });
        }
        const newRound = round + 1;
        const item = evidenceCheck(revealed, newRound, q);
        const nextRevealed = item ? [...revealed, item.id] : revealed;
        const count = asked + 1;

        play(
            [{ at: THINK }],
            () => {
                say({ kind: 'qa', role: to, question: q, text: reply, deflected });
                frame('agent_reply', { agent_id: to, text: `${reply.slice(0, 40)}…`, questions_asked: count, max_questions: MAX_QUESTIONS });
                pulse('A');
                if (item) {
                    say({ kind: 'evidence', text: item.text });
                    frame('evidence_revealed', { items: caseFile.evidence.filter((x) => nextRevealed.includes(x.id)).map((x) => ({ id: x.id, text: `${x.text.slice(0, 24)}…` })) });
                }
                setRevealed(nextRevealed);
                setRound(newRound);
                setAsked(count);
                touch();
            },
            () => setBusy(false),
        );
    };

    const callVote = () => {
        if (busy) return;
        setPath(['classify_intent', 'call_vote']);
        setStatus('voting');
        frame('status', { status: 'voting' });
        pulse('A');
        touch();
        say({ kind: 'system', text: 'The vote is called · guilty or not guilty?' });
    };

    const castVote = (v) => {
        if (busy || votes.you) return;
        setBusy(true);
        setPath(['classify_intent', 'cast_vote']);
        const all = { you: v };
        setVotes({ ...all });
        frame('vote_progress', { vote_count: 1, expected_voters: 3, status: 'voting' });
        pulse('A');
        touch();
        play(
            otherJurors.map((j) => ({ at: j.delay, j })),
            ({ j }) => {
                all[j.id] = j.vote;
                const n = Object.keys(all).length;
                setVotes({ ...all });
                setPath(['classify_intent', 'cast_vote']);
                const done = n >= 3;
                frame('vote_progress', { vote_count: n, expected_voters: 3, status: done ? 'finished' : 'voting' }, { via: j.worker === 'B' ? 'redis' : 'local' });
                pulse(j.worker);
                touch();
                say({ kind: 'system', text: `${j.name} has voted (${n}/3)` });
                if (done) {
                    const g = Object.values(all).filter((x) => x === 'guilty').length;
                    const majority = g * 2 > 3 ? 'guilty' : 'not_guilty';
                    const correct = majority === caseFile.verdictTruth;
                    setResult({ majority, correct, votes: { ...all } });
                    setStatus('finished');
                    frame(
                        'verdict',
                        { correct, yes_or_no: correct ? 'Yes' : 'No', majority, vote_reason: 'majority', verdict_truth: caseFile.verdictTruth, solution: `${caseFile.solution.slice(0, 30)}…` },
                        { via: 'redis', final: true },
                    );
                }
            },
            () => setBusy(false),
        );
    };

    const statusLabel = { lobby: 'Lobby', debating: 'Debate', questioning: 'Questioning', voting: 'Voting', finished: 'Verdict' }[status];

    return (
        <SimFrame
            title="Sit on the jury"
            label="SCRIPTED COUNSEL · REAL RULES AND MESSAGES"
            footer={
                <>
                    Your fellow jurors and both counsel are simulated here; in the live game each speech is a fresh LLM call and the jurors are real people. Play it at{' '}
                    <a href="https://docket.harshringsia.me/" target="_blank" rel="noreferrer" className="font-bold text-text-primary">
                        docket.harshringsia.me
                    </a>
                    .
                </>
            }
        >
            <div className="grid gap-6 p-5 @2xl:p-6 @4xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <div className="flex min-w-0 flex-col gap-4">
                    <div className="rounded-xl border border-border bg-[#060B19] p-4 text-white">
                        <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#EDBB00]">
                            Level {caseFile.level} · {caseFile.setting}
                        </p>
                        <p className="mt-1 font-display text-3xl tracking-wide">{caseFile.title}</p>
                        <p className="mt-1 leading-snug text-white/90">{caseFile.charge}</p>
                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px] font-bold">
                            <span className="rounded border border-[#EDBB00] px-1.5 text-[#EDBB00]">{statusLabel}</span>
                            <span className="rounded border border-white/50 px-1.5">
                                speeches {debateRound}/{DEBATE_SPEECHES}
                            </span>
                            <span className="rounded border border-white/50 px-1.5">
                                questions {asked}/{MAX_QUESTIONS}
                            </span>
                            <span className="flex items-center gap-1 rounded border border-white/50 px-1.5">
                                <Users size={12} aria-hidden="true" /> jurors {joined.length}/3
                            </span>
                        </div>
                    </div>

                    <ol ref={listRef} className="flex max-h-[460px] min-h-[120px] list-none flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-bg-secondary p-3" aria-live="polite" aria-label="Court transcript">
                        {transcript.length === 0 && <li className="p-4 text-center text-text-secondary">{caseFile.summary}</li>}
                        {transcript.map((e, i) => (
                            <Entry key={i} e={e} />
                        ))}
                        {busy && status !== 'lobby' && status !== 'voting' && (
                            <li className="font-mono text-xs font-bold text-text-secondary" aria-hidden="true">
                                counsel is thinking…
                            </li>
                        )}
                    </ol>

                    <div className="grid gap-2 @lg:grid-cols-3">
                        {caseFile.evidence.map((ev, i) => {
                            const open = revealed.includes(ev.id);
                            return (
                                <div key={ev.id} className={`rounded-lg border px-3 py-2 text-sm leading-snug ${open ? 'border-border bg-bg-elevated' : 'border-border bg-bg-elevated text-text-secondary'}`}>
                                    <span className="block font-mono text-[11px] font-bold">EXHIBIT {i + 1}</span>
                                    {open ? ev.text : 'Not entered yet'}
                                </div>
                            );
                        })}
                    </div>

                    <p className="-mt-2 text-xs leading-snug text-text-secondary">
                        As in the real game, at most one exhibit enters per answer: the badge log once the trial reaches round 2, the others when a juror’s question names them.
                    </p>

                    {/* Controls */}
                    {status === 'lobby' && !joined.length && (
                        <button type="button" className="btn-primary self-start" onClick={openCourt} disabled={busy}>
                            <Gavel size={18} aria-hidden="true" /> Open the courtroom
                        </button>
                    )}
                    {(status === 'debating' || (status === 'lobby' && joined.length === 3)) && (
                        <div className="flex flex-wrap gap-3">
                            <button type="button" className="btn-primary" onClick={nextArgument} disabled={busy}>
                                <Gavel size={18} aria-hidden="true" /> {debateRound === 0 ? 'Start the debate' : 'Next argument'}
                            </button>
                            {debateRound > 0 && (
                                <button type="button" className="btn-ghost" onClick={skipDebate} disabled={busy}>
                                    Skip to questions
                                </button>
                            )}
                        </div>
                    )}

                    {status === 'questioning' && (
                        <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-elevated p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Eyebrow className="!mb-0">Ask a question</Eyebrow>
                                <span className={`font-mono text-xs font-bold ${cooldown ? 'text-accent-warm' : 'text-[#1E8F52]'}`} aria-live="polite">
                                    {cooldown ? `cooldown ${cooldown}s (try anyway)` : 'ready'}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {presetQuestions.map((p) => (
                                    <button
                                        key={p.text}
                                        type="button"
                                        disabled={busy}
                                        onClick={() => ask(p.text, p.to, p)}
                                        className={`flex min-h-[40px] items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-left text-sm ${p.attack ? 'bg-[#FFC4CC]' : 'bg-bg-secondary hover:bg-[#EDBB00]/20'}`}
                                    >
                                        <MessageSquare size={15} aria-hidden="true" className="shrink-0" />
                                        <span>
                                            <span className="font-mono text-[11px] font-bold uppercase">{counsel[p.to].short}:</span> {p.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <form
                                className="flex flex-wrap gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    ask(draft, target);
                                }}
                            >
                                <select
                                    value={target}
                                    onChange={(e) => setTarget(e.target.value)}
                                    aria-label="Ask which counsel"
                                    className="min-h-[44px] rounded-lg border border-border bg-bg-elevated px-2 font-bold"
                                >
                                    <option value="prosecution">Prosecution</option>
                                    <option value="defense">Defense</option>
                                </select>
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    maxLength={200}
                                    placeholder="Or type your own…"
                                    aria-label="Your question"
                                    className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-border px-3"
                                />
                                <button type="submit" className="btn-primary !min-h-[44px] !px-3" disabled={busy || !draft.trim()} aria-label="Ask">
                                    <Send size={18} aria-hidden="true" />
                                </button>
                            </form>
                            <button type="button" className="btn-pop self-start" onClick={callVote} disabled={busy}>
                                Call the vote
                            </button>
                        </div>
                    )}

                    {status === 'voting' && (
                        <div className="flex flex-col gap-3 rounded-xl border border-border bg-bg-elevated p-3">
                            <Eyebrow className="!mb-0">Your vote · {Object.keys(votes).length}/3 cast</Eyebrow>
                            <div className="flex flex-wrap gap-3">
                                <button type="button" className="btn-pop" onClick={() => castVote('guilty')} disabled={busy || !!votes.you}>
                                    Guilty
                                </button>
                                <button type="button" className="btn-pop" onClick={() => castVote('not_guilty')} disabled={busy || !!votes.you}>
                                    Not guilty
                                </button>
                            </div>
                            {votes.you && <p className="text-sm text-text-secondary">Waiting for Asha and Dev…</p>}
                        </div>
                    )}

                    {finished && result && (
                        <div className={`rounded-2xl border border-border p-4 ${result.correct ? 'bg-[#BFF0C8]' : 'bg-[#FFC4CC]'}`} role="status">
                            <p className="font-mono text-xs font-bold uppercase tracking-wider">
                                Majority: {result.majority.replace('_', ' ')} · you {result.votes.you.replace('_', ' ')}, Asha guilty, Dev not guilty
                            </p>
                            <p className="mt-1 font-display text-5xl tracking-wide">{result.correct ? 'Yes' : 'No'}</p>
                            <p className="mt-1 font-bold">{result.correct ? 'The jury got it right. Your vote decided it.' : 'The jury got it wrong, and your vote decided it.'}</p>
                            <p className="mt-2 leading-relaxed">{caseFile.solution}</p>
                            <button type="button" className="btn-ghost mt-3" onClick={reset}>
                                <RotateCcw size={18} aria-hidden="true" /> Retry the case
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-4">
                    <GraphView path={path} />
                    <WireView pulses={pulses} frames={frames} ttl={ttl} joined={joined} reduced={reduced} />
                    <SealedView finished={finished} frames={frames} guard={guard} />
                </div>
            </div>
        </SimFrame>
    );
}
