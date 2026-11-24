// Shared helpers for the canvas games. Every game draws in a fixed logical
// space (W x H) that is scaled to fit the canvas, so physics never depends on
// screen size.

export const W = 800;
export const H = 450;
export const INK = '#111111';
export const ACCENT = '#0B57B0';
export const POP = '#EDBB00';

// onResize runs after every resize, because resizing a canvas clears it.
export function setupCanvas(canvas, onResize, w = W, h = H) {
    const ctx = canvas.getContext('2d');
    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round((rect.width * dpr * h) / w));
        ctx.setTransform(canvas.width / w, 0, 0, canvas.height / h, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
        resize();
        onResize?.();
    });
    ro.observe(canvas);
    return { ctx, dispose: () => ro.disconnect() };
}

export function toLocal(canvas, e, w = W, h = H) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * w) / r.width, y: ((e.clientY - r.top) * h) / r.height };
}

// requestAnimationFrame loop that pauses itself when the tab is hidden.
export function createLoop(step) {
    let raf = 0;
    let last = 0;
    let running = false;
    const frame = (t) => {
        if (!running) return;
        const dt = Math.min(0.033, Math.max(0, (t - last) / 1000));
        last = t;
        step(dt);
        raf = requestAnimationFrame(frame);
    };
    const onVisibility = () => {
        if (document.hidden) {
            cancelAnimationFrame(raf);
        } else if (running) {
            last = performance.now();
            raf = requestAnimationFrame(frame);
        }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return {
        start() {
            if (running) return;
            running = true;
            last = performance.now();
            raf = requestAnimationFrame(frame);
        },
        stop() {
            running = false;
            cancelAnimationFrame(raf);
        },
        dispose() {
            running = false;
            cancelAnimationFrame(raf);
            document.removeEventListener('visibilitychange', onVisibility);
        },
    };
}

export function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

export function drawImage(ctx, img, x, y, w, h) {
    if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, y, w, h);
}

export function comicText(ctx, text, x, y, size, { fill = '#ffffff', stroke = INK, align = 'center', rotate = 0, alpha = 1 } = {}) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotate);
    ctx.font = `${size}px Bangers, Impact, sans-serif`;
    ctx.textAlign = align;
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(4, size / 7);
    ctx.strokeStyle = stroke;
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = fill;
    ctx.fillText(text, 0, 0);
    ctx.restore();
}

export function outlined(ctx, fill, lineWidth = 4) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = INK;
    ctx.lineJoin = 'round';
    ctx.stroke();
}

export function circle(ctx, x, y, r, fill, lineWidth = 4) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    outlined(ctx, fill, lineWidth);
}

export function rect(ctx, x, y, w, h, fill, lineWidth = 4, radius = 0) {
    ctx.beginPath();
    if (radius) ctx.roundRect(x, y, w, h, radius);
    else ctx.rect(x, y, w, h);
    outlined(ctx, fill, lineWidth);
}

export function halftonePattern(ctx, bg, dot, step = 14, r = 1.6) {
    const c = document.createElement('canvas');
    c.width = step;
    c.height = step;
    const x = c.getContext('2d');
    x.fillStyle = bg;
    x.fillRect(0, 0, step, step);
    x.fillStyle = dot;
    x.beginPath();
    x.arc(step / 2, step / 2, r, 0, Math.PI * 2);
    x.fill();
    return ctx.createPattern(c, 'repeat');
}

export const rand = (a, b) => a + Math.random() * (b - a);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Floating comic words ("SIX!", "eep!") that rise and fade.
export function createPopups() {
    const items = [];
    return {
        add(text, x, y, { size = 36, fill = '#ffffff', life = 0.9, rotate = 0 } = {}) {
            items.push({ text, x, y, size, fill, life, max: life, rotate });
        },
        update(dt) {
            for (let i = items.length - 1; i >= 0; i -= 1) {
                items[i].life -= dt;
                items[i].y -= 40 * dt;
                if (items[i].life <= 0) items.splice(i, 1);
            }
        },
        draw(ctx) {
            items.forEach((p) => comicText(ctx, p.text, p.x, p.y, p.size, { fill: p.fill, rotate: p.rotate, alpha: Math.min(1, p.life / (p.max * 0.4)) }));
        },
        clear() {
            items.length = 0;
        },
    };
}

// Keyboard helper: tracks held keys and calls onPress for new presses.
// Only intercepts keys while `active()` returns true, so the page can still scroll.
export function createKeys(keys, onPress, active) {
    const held = new Set();
    const down = (e) => {
        if (!active() || !keys.includes(e.code)) return;
        const tag = e.target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') {
            if (e.code === 'Space' || e.code === 'Enter') return;
        }
        e.preventDefault();
        if (!held.has(e.code)) onPress?.(e.code);
        held.add(e.code);
    };
    const up = (e) => held.delete(e.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return {
        held,
        dispose() {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        },
    };
}
