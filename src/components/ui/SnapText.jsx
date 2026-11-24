import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

const DURATION = 2600; // ms for the whole sweep
const PARTICLE_LIFE = 1500; // ms each grain takes to drift away

/**
 * Draws `text` on a canvas, then turns it to dust: grains break off left to
 * right and drift up and away. `snap()` dissolves, `restore()` plays it back
 * in reverse. With reduced motion, both jump straight to the end state.
 */
const SnapText = forwardRef(({ text, reducedMotion = false, onDone, className = '' }, ref) => {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);
    const state = useRef({ particles: [], progress: 0, dir: 0, raf: 0, last: 0, w: 0, h: 0, dpr: 1 });

    const draw = useCallback(() => {
        const s = state.current;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, s.w * s.dpr, s.h * s.dpr);
        const t = s.progress * DURATION;
        for (const p of s.particles) {
            const local = Math.min(1, Math.max(0, (t - p.delay) / PARTICLE_LIFE));
            if (local >= 1) continue;
            const e = local * local;
            const x = p.x + p.vx * e + Math.sin(local * 6 + p.phase) * 6 * local;
            const y = p.y + p.vy * e;
            ctx.globalAlpha = 1 - local;
            ctx.fillStyle = p.color;
            ctx.fillRect(x * s.dpr, y * s.dpr, p.size * s.dpr, p.size * s.dpr);
        }
        ctx.globalAlpha = 1;
    }, []);

    const build = useCallback(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        if (!wrap || !canvas) return;
        const s = state.current;
        const w = wrap.clientWidth;
        const fontSize = Math.min(260, Math.max(120, w * 0.32));
        const h = Math.round(fontSize * 1.05);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        Object.assign(s, { w, h, dpr });
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.height = `${h}px`;

        // Rasterise the text once, offscreen, in blaugrana
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const g = off.getContext('2d', { willReadFrequently: true });
        g.font = `800 ${fontSize}px "Barlow Condensed", sans-serif`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        const grad = g.createLinearGradient(w / 2 - fontSize, 0, w / 2 + fontSize, 0);
        grad.addColorStop(0, '#0b57b0');
        grad.addColorStop(0.5, '#a50044');
        grad.addColorStop(1, '#edbb00');
        g.fillStyle = grad;
        g.fillText(text, w / 2, h / 2 + fontSize * 0.04);
        const { data } = g.getImageData(0, 0, w, h);

        const particles = [];
        const step = w < 500 ? 2 : 3;
        let minX = w;
        let maxX = 0;
        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                const i = (y * w + x) * 4;
                if (data[i + 3] < 128) continue;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                particles.push({ x, y, color: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`, size: step });
            }
        }
        const span = Math.max(1, maxX - minX);
        for (const p of particles) {
            const sweep = (p.x - minX) / span;
            p.delay = sweep * (DURATION - PARTICLE_LIFE) * 0.85 + Math.random() * (DURATION - PARTICLE_LIFE) * 0.15;
            p.vx = 40 + Math.random() * 120;
            p.vy = -(30 + Math.random() * 110);
            p.phase = Math.random() * Math.PI * 2;
        }
        s.particles = particles;
        draw();
    }, [text, draw]);

    const run = useCallback(
        (dir) => {
            const s = state.current;
            cancelAnimationFrame(s.raf);
            if (reducedMotion) {
                s.progress = dir > 0 ? 1 : 0;
                draw();
                onDone?.(dir);
                return;
            }
            s.dir = dir;
            s.last = 0;
            const tick = (now) => {
                const dt = s.last ? now - s.last : 0;
                s.last = now;
                s.progress = Math.min(1, Math.max(0, s.progress + (dir * dt) / DURATION));
                draw();
                if ((dir > 0 && s.progress < 1) || (dir < 0 && s.progress > 0)) {
                    s.raf = requestAnimationFrame(tick);
                } else {
                    onDone?.(dir);
                }
            };
            s.raf = requestAnimationFrame(tick);
        },
        [draw, onDone, reducedMotion]
    );

    useImperativeHandle(ref, () => ({ snap: () => run(1), restore: () => run(-1) }), [run]);

    useEffect(() => {
        let cancelled = false;
        // Wait for the display font so the dust matches the real letterforms
        (document.fonts?.ready ?? Promise.resolve()).then(() => !cancelled && build());
        const ro = new ResizeObserver(() => build());
        if (wrapRef.current) ro.observe(wrapRef.current);
        const s = state.current;
        return () => {
            cancelled = true;
            ro.disconnect();
            cancelAnimationFrame(s.raf);
        };
    }, [build]);

    return (
        <div ref={wrapRef} className={`w-full ${className}`}>
            <canvas ref={canvasRef} className="block w-full" aria-hidden="true" />
        </div>
    );
});

SnapText.displayName = 'SnapText';

export default SnapText;
