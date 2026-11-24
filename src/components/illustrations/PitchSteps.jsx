import { motion } from 'framer-motion';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

// Isometric staircase: each round is a block that rises into place, then a
// ball hops up the steps to the pitch, where six investor seats light up.
const W = 100;
const BASE = 300;
const D = { x: 22, y: -16 }; // depth offset for the top and side faces
const HEIGHTS = [56, 92, 128, 164, 208];
const FRONT = ['#1d3f9e', '#27499f', '#4b3a96', '#7a2a7c', '#a50044'];

const PitchSteps = ({ steps }) => {
    const reduced = usePrefersReducedMotion();
    const x0 = (i) => 14 + i * W;
    const top = (i) => BASE - HEIGHTS[i];
    // ball landing spots: centre of each top face
    const spots = steps.map((_, i) => ({ x: x0(i) + W / 2 + D.x / 2, y: top(i) + D.y / 2 - 9 }));
    const ballX = [spots[0].x - 40, ...spots.map((s) => s.x)];
    const ballY = [BASE - 9, ...spots.map((s) => s.y)];
    // hop arcs: alternate landing / apex frames
    const kx = [];
    const ky = [];
    ballX.forEach((x, i) => {
        if (i) {
            kx.push((ballX[i - 1] + x) / 2);
            ky.push(Math.min(ballY[i - 1], ballY[i]) - 40);
        }
        kx.push(x);
        ky.push(ballY[i]);
    });
    const last = steps.length - 1;
    const seatsY = top(last) - 46;

    return (
        <svg viewBox="0 0 560 330" className="w-full h-auto" role="img" aria-label={steps.map((s) => `${s.label}: ${s.note}`).join(', ')}>
            <defs>
                <linearGradient id="ps-floor" x1="0" x2="1">
                    <stop offset="0" stopColor="#2f6bff" stopOpacity="0" />
                    <stop offset="0.5" stopColor="#2f6bff" stopOpacity="0.5" />
                    <stop offset="1" stopColor="#d6205f" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect x="0" y={BASE} width="560" height="2" fill="url(#ps-floor)" />
            {steps.map((s, i) => {
                const x = x0(i);
                const y = top(i);
                const h = HEIGHTS[i];
                const isLast = i === last;
                return (
                    <motion.g
                        key={s.label}
                        initial={reduced ? false : { opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-60px' }}
                        transition={{ duration: 0.55, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <polygon points={`${x + W},${y} ${x + W + D.x},${y + D.y} ${x + W + D.x},${BASE + D.y} ${x + W},${BASE}`} fill={FRONT[i]} opacity="0.55" />
                        <polygon points={`${x},${y} ${x + W},${y} ${x + W + D.x},${y + D.y} ${x + D.x},${y + D.y}`} fill={isLast ? '#c99a00' : FRONT[i]} style={isLast ? undefined : { filter: 'brightness(1.5)' }} />
                        <rect x={x} y={y} width={W} height={h} fill={FRONT[i]} stroke="rgba(255,255,255,0.12)" />
                        <text x={x + W / 2} y={y + 28} textAnchor="middle" fill="#fff" fontFamily="Barlow Condensed, sans-serif" fontWeight="800" fontSize="22" style={{ textTransform: 'uppercase' }}>
                            {s.label.toUpperCase()}
                        </text>
                        <text x={x + W / 2} y={y + 46} textAnchor="middle" fill={isLast ? '#EDBB00' : 'rgba(255,255,255,0.7)'} fontFamily="ui-monospace, monospace" fontSize="9" letterSpacing="1">
                            {s.note.toUpperCase()}
                        </text>
                    </motion.g>
                );
            })}
            {/* six investor seats above the final step */}
            {Array.from({ length: 6 }, (_, k) => (
                <motion.g
                    key={k}
                    initial={reduced ? false : { opacity: 0, scale: 0.3 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.3, delay: 1.0 + steps.length * 0.18 + 0.8 + k * 0.08 }}
                    style={{ transformOrigin: `${x0(last) + 14 + k * 17}px ${seatsY}px` }}
                >
                    <circle cx={x0(last) + 14 + k * 17} cy={seatsY - 7} r="5" fill="#EDBB00" />
                    <rect x={x0(last) + 8 + k * 17} y={seatsY - 1} width="12" height="12" rx="4" fill="#EDBB00" opacity="0.8" />
                </motion.g>
            ))}
            {/* the ball */}
            <motion.circle
                r="9"
                fill="#fff"
                stroke="#060B19"
                strokeWidth="2"
                initial={reduced ? { cx: kx[kx.length - 1], cy: ky[ky.length - 1] } : { cx: kx[0], cy: ky[0], opacity: 0 }}
                whileInView={reduced ? undefined : { cx: kx, cy: ky, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.8, delay: steps.length * 0.18 + 0.2, ease: 'easeInOut' }}
            />
        </svg>
    );
};

export default PitchSteps;
