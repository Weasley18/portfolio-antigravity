// A top-down port of Para Football's CPU brain.
//
// Constants, difficulty tiers and formation slots are copied from the game
// (src/1-game.js in kolkata-street-football). The decision rules follow the
// game's own: the nearest outfielder presses, the back covers the line from
// the carrier to goal, the forward alternates holding the width and slanting
// in behind, the keeper narrows the angle and gets across to shots. Fouls,
// fights, slide tackles, free kicks and replays are left out.
//
// Physics runs at a fixed 120 steps a second, whatever the frame rate.

import { createLoop, setupCanvas } from './canvas';

/* ---------- constants from the game (50 units ≈ 1 m) ---------- */
export const STEP = 1 / 120;
const F = { L: 150, R: 1550, T: 236, B: 856 };
F.cx = (F.L + F.R) / 2;
F.cy = (F.T + F.B) / 2;
const GOAL = { half: 106, depth: 46, post: 5 };
const GY1 = F.cy - GOAL.half;
const GY2 = F.cy + GOAL.half;
const PR = 17;
const BR = 9;
const WITH_BALL = 0.93;
const ACC = 1500;
const DEC = 2100;
const SHOT = 780;
const KICK_REACH = 13;
const KICK_CD = 0.32;
const GRAV = 900;
const AIR_DRAG = 0.22;
const ROLL_DRAG = 0.9;
const ROLL_FRIC = 46;
const BOUNCE = 0.55;
const WALL_REST = 0.62;
const TRAP_SPEED = 440;
const NT = 3;

export const LEVELS = {
    easy: { speed: 150, range: 330, err: 0.95, think: 0.45, hold: 0.9, poke: 0.04, tackle: 0.3, gk: 110, dive: 120, gkAcc: 450, save: 0.15 },
    medium: { speed: 205, range: 300, err: 0.55, think: 0.2, hold: 0.45, poke: 0.14, tackle: 0.75, gk: 160, dive: 185, gkAcc: 700, save: 0.4 },
    hard: { speed: 228, range: 280, err: 0.3, think: 0.1, hold: 0.22, poke: 0.28, tackle: 1, gk: 190, dive: 220, gkAcc: 900, save: 0.55 },
};
const SLOT = [null, { d: 0.27, l: 0.22, push: 0.55, min: 0.1, max: 0.66, shift: 0.45, back: true }, { d: 0.58, l: -0.36, push: 0.55, min: 0.3, max: 0.9, shift: 0.3 }];

export const TEAMS = [
    { name: 'Ilish', kit: '#D6332A', trim: '#EDBB00', names: ['Pintu', 'Montu', 'Bablu'], nums: [1, 4, 10] },
    { name: 'Chingri', kit: '#1E8F52', trim: '#7A1F2B', names: ['Haru', 'Tublu', 'Gogol'], nums: [1, 6, 9] },
];

/* ---------- drawing space ---------- */
const VW = 1540;
const VH = 700;
const OX = 80;
const OY = 180;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const rnd = Math.random;

export function createBoard(canvas, { onStats, levels = ['medium', 'medium'], reducedMotion = false } = {}) {
    const { ctx, dispose: disposeCanvas } = setupCanvas(canvas, () => draw(), VW, VH);
    const opts = { jobs: true, targets: true, slow: false };
    const lv = [...levels];
    const score = [0, 0];
    let acc = 0;
    let lastSteps = 0;
    let stepCount = 0;
    let frameCount = 0;
    let statClock = 0;
    let paused = false;
    let celebrate = 0;
    let kickoffTeam = 0;

    const teams = [0, 1].map((t) => ({ dir: t === 0 ? 1 : -1, ownX: t === 0 ? F.L : F.R, goalX: t === 0 ? F.R : F.L, players: [t * 3, t * 3 + 1, t * 3 + 2], gk: t * 3, chaser: -1 }));
    const P = Array.from({ length: 6 }, (_, i) => ({ i, team: i < 3 ? 0 : 1, slot: i % 3, gk: i % 3 === 0, x: 0, y: 0, vx: 0, vy: 0, fx: 1, fy: 0, kickCd: 0 }));
    const AI = P.map(() => ({ t: 0, tx: 0, ty: 0, held: 0, side: 0, lane: 0, runT: 0, cut: false, job: 'SHAPE', cover: false, dive: false }));
    const ball = { x: F.cx, y: F.cy, vx: 0, vy: 0, h: 0, vh: 0, owner: -1, protect: 0 };
    const K = (p) => LEVELS[lv[p.team]];

    function kickoff(team) {
        P.forEach((p) => {
            const tm = teams[p.team];
            const L = F.R - F.L;
            if (p.gk) {
                p.x = tm.ownX + tm.dir * 26;
                p.y = F.cy;
            } else {
                const s = SLOT[p.slot];
                p.x = tm.ownX + tm.dir * s.d * L * 0.8;
                p.y = F.cy + s.l * (F.B - F.T) * 0.41;
            }
            p.vx = p.vy = 0;
            p.fx = tm.dir;
            p.fy = 0;
            p.kickCd = 0;
        });
        const striker = P[team * 3 + 2];
        striker.x = F.cx - teams[team].dir * 30;
        striker.y = F.cy;
        Object.assign(ball, { x: F.cx, y: F.cy, vx: 0, vy: 0, h: 0, vh: 0, owner: -1, protect: 0 });
        AI.forEach((a) => Object.assign(a, { t: 0, held: 0, side: 0, lane: 0, runT: 0, cut: false }));
    }

    /* ---------- who presses ---------- */
    function pickRoles(tm) {
        const loose = ball.owner < 0;
        const px = ball.x + (loose ? ball.vx * 0.25 : 0);
        const py = ball.y + (loose ? ball.vy * 0.25 : 0);
        const d = (i) => Math.hypot(P[i].x - px, P[i].y - py);
        const ours = !loose && P[ball.owner].team === P[tm.gk].team ? ball.owner : -1;
        const keeperHas = !loose && P[ball.owner].gk;
        if (keeperHas) {
            tm.chaser = -1; // nobody harries a keeper with the ball in his hands
            return;
        }
        if (ours >= 0) {
            tm.chaser = ours;
            return;
        }
        let best = tm.chaser < 0 || P[tm.chaser].gk ? tm.players[2] : tm.chaser;
        let bd = d(best) - 34; // the current presser keeps the job unless someone is clearly closer
        for (let k = 1; k < NT; k += 1) {
            const i = tm.players[k];
            if (d(i) < bd) {
                bd = d(i);
                best = i;
            }
        }
        tm.chaser = best;
    }

    const others = (team) => teams[team ? 0 : 1].players;
    function oppNear(team, to) {
        let best = null;
        let bd = 1e9;
        const o = others(team);
        for (let k = 1; k < NT; k += 1) {
            const q = P[o[k]];
            const dd = dist(q, to);
            if (dd < bd) {
                bd = dd;
                best = q;
            }
        }
        return best;
    }
    function laneClear(x1, y1, x2, y2, team, width) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const l2 = dx * dx + dy * dy || 1;
        const o = others(team);
        for (let k = 0; k < NT; k += 1) {
            const q = P[o[k]];
            const t = clamp(((q.x - x1) * dx + (q.y - y1) * dy) / l2, 0, 1);
            if (Math.hypot(q.x - (x1 + dx * t), q.y - (y1 + dy * t)) < width) return false;
        }
        return true;
    }
    function bestPass(p, tm, anyway) {
        const L = F.R - F.L;
        let best = null;
        let bs = -1e9;
        for (const i of tm.players) {
            if (i === p.i || (i === tm.gk && !anyway)) continue;
            const m = P[i];
            const md = dist(m, ball);
            if (md < 110 || md > 640 || !laneClear(ball.x, ball.y, m.x, m.y, p.team, 42)) continue;
            const mark = dist(oppNear(p.team, m), m);
            if (mark < 52) continue;
            const prog = (m.x - ball.x) * tm.dir;
            const sc = prog / 300 + Math.min(mark, 200) / 400 - Math.abs(md - 320) / 1200 + (1 - Math.abs(tm.goalX - m.x) / L) * 0.6 - (i === tm.gk ? 1 : 0);
            if (sc > bs) {
                bs = sc;
                best = { m, md, prog, sc };
            }
        }
        return best;
    }

    /* ---------- off the ball: shape, runs, cover ---------- */
    function offBall(p, a, tm) {
        const atk = tm.dir;
        const s = SLOT[p.slot];
        const L = F.R - F.L;
        const Hh = (F.B - F.T) / 2;
        const fwd = !s.back;
        const adv = clamp(((ball.x - tm.ownX) * atk) / L, 0, 1);
        const poss = ball.owner >= 0 && P[ball.owner].team === p.team;
        const theirs = ball.owner >= 0 && !poss;
        if (ball.owner === tm.gk) {
            const side = fwd ? -Math.sign(s.l) : Math.sign(s.l);
            a.tx = tm.ownX + atk * (fwd ? 560 : 250);
            a.ty = F.cy + side * (fwd ? 150 : 175);
            a.job = 'SHOW';
            return;
        }
        let d = s.d + (adv - 0.5) * s.push + (poss ? 0.07 : theirs ? -0.05 : 0);
        let l = s.l;
        a.job = 'SHAPE';
        if (fwd && poss && adv > 0.4) {
            a.runT -= 0.12;
            if (a.runT <= 0) {
                a.runT = 1.5 + rnd() * 1.7;
                a.cut = !a.cut;
            }
            if (a.cut) {
                l = s.l * 0.2;
                d += 0.14;
                a.job = 'SLANT';
            } else {
                l = s.l * 1.12;
                a.job = 'WIDTH';
            }
        }
        d = clamp(d, s.min, s.max);
        let x = tm.ownX + atk * d * L;
        let y = F.cy + l * Hh * 0.82 + (ball.y - F.cy) * s.shift;
        a.cover = false;
        if (theirs && !fwd) {
            const gx = ball.x - tm.ownX;
            const gy = ball.y - F.cy;
            const gl = Math.hypot(gx, gy) || 1;
            const cd = clamp(gl * 0.36, 80, 280);
            x = tm.ownX + (gx / gl) * cd;
            y = F.cy + (gy / gl) * cd;
            if (dist(p, ball) < 150) {
                x = ball.x;
                y = ball.y;
            }
            a.cover = true;
            a.job = 'COVER';
        } else if (!poss && !fwd) {
            let m = null;
            let md = 280;
            for (const i of others(p.team)) {
                const q = P[i];
                if (q.gk || q.i === ball.owner || (q.x - tm.ownX) * atk > L * 0.62) continue;
                const dd = Math.hypot(q.x - x, q.y - y);
                if (dd < md) {
                    md = dd;
                    m = q;
                }
            }
            if (m) {
                const gx = tm.ownX - m.x;
                const gy = F.cy - m.y;
                const gl = Math.hypot(gx, gy) || 1;
                x = x * 0.4 + (m.x + (gx / gl) * 48) * 0.6;
                y = y * 0.4 + (m.y + (gy / gl) * 48) * 0.6;
                a.job = 'MARK';
            }
        }
        a.tx = clamp(x, F.L + PR, F.R - PR);
        a.ty = clamp(y, F.T + PR, F.B - PR);
    }

    function aimAt(tx, ty, pw, lift, err) {
        let dx = tx - ball.x;
        let dy = ty - ball.y;
        const l = Math.hypot(dx, dy) || 1;
        dx /= l;
        dy /= l;
        const e = (rnd() - 0.5) * err;
        const c = Math.cos(e);
        const s = Math.sin(e);
        return { dx: dx * c - dy * s, dy: dx * s + dy * c, pw, lift };
    }

    /* ---------- outfield decisions ---------- */
    function outfield(p, dt) {
        const tm = teams[p.team];
        const atk = tm.dir;
        const a = AI[p.i];
        const k = K(p);
        const own = ball.owner === p.i;
        a.held = own ? a.held + dt : 0;
        a.t -= dt;
        let kick = null;
        if (a.t <= 0) {
            a.t = k.think + rnd() * 0.06;
            const op = oppNear(p.team, ball);
            if (own) {
                a.job = 'CARRY';
                const gd = Math.hypot(tm.goalX - ball.x, F.cy - ball.y);
                const keeper = P[teams[p.team ? 0 : 1].gk];
                if (!a.side || rnd() < 0.05) a.side = Math.abs(keeper.y - F.cy) > 12 ? (keeper.y > F.cy ? -1 : 1) : rnd() < 0.5 ? -1 : 1; // the side the keeper has left
                const gy = F.cy + a.side * GOAL.half * 0.7;
                const pressure = dist(op, p) < 74;
                if (a.held > k.hold) {
                    const bp = bestPass(p, tm, pressure && (ball.x - tm.ownX) * atk < 420);
                    if (gd < Math.min(230, k.range * 0.6) || (gd < k.range && laneClear(ball.x, ball.y, tm.goalX, gy, p.team, 30))) kick = aimAt(tm.goalX, gy, SHOT, 200, k.err);
                    else if (bp && (bp.prog > 70 || pressure) && (bp.sc > 0.3 || pressure) && rnd() < (pressure ? 0.7 : 0.4))
                        kick = aimAt(bp.m.x + bp.m.vx * 0.2, bp.m.y + bp.m.vy * 0.2, clamp(260 + bp.md * 1.2, 380, 720), 40, k.err * 0.5);
                    else if (a.held > 3 || (pressure && gd < 520 && rnd() < 0.1)) kick = aimAt(tm.goalX, gy, SHOT, 200, k.err * 1.6);
                }
                if (gd > 520 && (!a.lane || rnd() < 0.03)) a.lane = (p.y > F.cy ? 1 : -1) * (rnd() < 0.7 ? 1 : -1);
                const far = gd > 470;
                let tx = far ? tm.goalX - atk * 330 : tm.goalX - atk * 30;
                let ty = far ? F.cy + a.lane * 150 : gy;
                // go round whoever is in the way
                let dx = tx - p.x;
                let dy = ty - p.y;
                let l = Math.hypot(dx, dy) || 1;
                dx /= l;
                dy /= l;
                for (const i of others(p.team)) {
                    const o = P[i];
                    const rx = o.x - p.x;
                    const ry = o.y - p.y;
                    const ahead = rx * dx + ry * dy;
                    const lat = -rx * dy + ry * dx;
                    if (ahead > 0 && ahead < 140 && Math.abs(lat) < 52) {
                        const qx = -dy; // sideways, relative to the run
                        const qy = dx;
                        let side = lat > 0 ? -1 : 1;
                        if (p.y < F.T + 70) side = qy > 0 ? 1 : -1; // near a touchline, cut inside
                        else if (p.y > F.B - 70) side = qy > 0 ? -1 : 1;
                        dx += qx * side * 1.15;
                        dy += qy * side * 1.15;
                        l = Math.hypot(dx, dy) || 1;
                        dx /= l;
                        dy /= l;
                    }
                }
                a.tx = p.x + dx * 120;
                a.ty = p.y + dy * 120;
            } else if (tm.chaser === p.i) {
                a.job = 'PRESS';
                const o = ball.owner >= 0 ? P[ball.owner] : null;
                const db = dist(p, ball);
                if (o) {
                    const lead = clamp(db / 400, 0, 0.3);
                    a.tx = ball.x + o.vx * lead;
                    a.ty = ball.y + o.vy * lead;
                    if (db > 120) {
                        // far off: cut the carrier off from our goal first
                        const gx = tm.ownX - ball.x;
                        const gy = F.cy - ball.y;
                        const gl = Math.hypot(gx, gy) || 1;
                        const off = Math.min(56, db * 0.4);
                        a.tx = ball.x + (gx / gl) * off;
                        a.ty = ball.y + (gy / gl) * off;
                    }
                    if (db < PR + BR + KICK_REACH - 2 && ball.protect <= 0 && rnd() < k.poke) {
                        const ay = ball.y < F.cy ? -0.6 : 0.6;
                        const al = Math.hypot(1, ay);
                        kick = { dx: atk / al, dy: ay / al, pw: 520, lift: 120, poke: true };
                    }
                } else {
                    const lead = clamp(db / 520, 0, 0.5);
                    a.tx = ball.x + ball.vx * lead;
                    a.ty = ball.y + ball.vy * lead;
                }
            } else {
                offBall(p, a, tm);
            }
        }
        if (own && kick) {
            if (kick.poke) kick = null;
        }
        if (kick) {
            if (kick.poke && ball.owner >= 0) {
                P[ball.owner].kickCd = 0.4;
                release(kick);
                p.kickCd = KICK_CD;
            } else if (own) {
                release(kick);
                p.kickCd = KICK_CD;
            }
            a.held = 0;
        }
        return steer(p, a, k.speed, ACC);
    }

    /* ---------- keeper ---------- */
    function keeper(p, dt) {
        const tm = teams[p.team];
        const atk = tm.dir;
        const a = AI[p.i];
        const k = K(p);
        const own = ball.owner === p.i;
        const home = tm.ownX + atk * 26;
        a.held = own ? a.held + dt : 0;
        a.job = 'KEEPER';
        if (own) {
            if (a.held > 0.7) {
                const c = bestPass(p, tm, true);
                if (c && (c.sc > 0.9 || a.held > 1.5)) {
                    release(aimAt(c.m.x + c.m.vx * 0.3, c.m.y + c.m.vy * 0.3, clamp(260 + c.md * 1.1, 360, 700), 30, 0.05));
                    p.kickCd = KICK_CD;
                } else if (a.held > 2.6) {
                    release(aimAt(F.cx + atk * 200, F.cy + (rnd() - 0.5) * 300, 820, 380, 0.2));
                    p.kickCd = KICK_CD;
                }
            }
            a.tx = home + atk * 34;
            a.ty = F.cy;
            return steer(p, a, k.gk * 0.5, k.gkAcc);
        }
        a.t -= dt;
        if (a.t <= 0) {
            a.t = k.think * 0.6 + rnd() * 0.04;
            const out = (ball.x - tm.ownX) * atk;
            const loose = ball.owner < 0;
            a.tx = home + atk * (out < 340 ? 20 : 0);
            a.ty = F.cy + clamp((ball.y - F.cy) * (out < 520 ? 0.6 : 0.3), -GOAL.half + 12, GOAL.half - 12);
            a.dive = false;
            if (loose && ball.vx * atk < -200) {
                // something is coming at goal: get on its line
                const tt = (p.x - ball.x) / ball.vx;
                const py = ball.y + ball.vy * tt;
                if (tt > 0 && tt < 1.3 && Math.abs(py - F.cy) < GOAL.half + 30) {
                    a.ty = clamp(py, GY1 + 6, GY2 - 6);
                    a.dive = true;
                }
            } else if (loose && out < 190 && Math.abs(ball.y - F.cy) < GOAL.half + 110 && Math.hypot(ball.vx, ball.vy) < 280) {
                const mine = dist(p, ball);
                let first = true;
                for (const i of others(p.team)) if (!P[i].gk && dist(P[i], ball) < mine - 12) first = false;
                if (first) {
                    a.tx = ball.x;
                    a.ty = ball.y;
                }
            }
        }
        return steer(p, a, a.dive ? k.dive : k.gk, k.gkAcc);
    }

    function steer(p, a, top, accel) {
        let mx = a.tx - p.x;
        let my = a.ty - p.y;
        const ml = Math.hypot(mx, my);
        if (ml > 3) {
            const s = Math.min(1, ml / 40) / ml;
            mx *= s;
            my *= s;
        } else mx = my = 0;
        return { mx, my, top, acc: accel };
    }

    function drive(p, c, dt) {
        let top = c.top;
        if (ball.owner === p.i) top *= WITH_BALL;
        const len = Math.hypot(c.mx, c.my);
        if (len > 0.3) {
            p.fx = c.mx / len;
            p.fy = c.my / len;
        }
        const tx = len > 0.01 ? c.mx * top : 0;
        const ty = len > 0.01 ? c.my * top : 0;
        const ax = tx - p.vx;
        const ay = ty - p.vy;
        const d = Math.hypot(ax, ay);
        const rate = (len > 0.01 ? c.acc || ACC : DEC) * dt;
        if (d <= rate) {
            p.vx = tx;
            p.vy = ty;
        } else {
            p.vx += (ax / d) * rate;
            p.vy += (ay / d) * rate;
        }
        p.x = clamp(p.x + p.vx * dt, F.L + PR, F.R - PR);
        p.y = clamp(p.y + p.vy * dt, F.T + PR, F.B - PR);
        p.kickCd = Math.max(0, p.kickCd - dt);
    }

    function release(k) {
        ball.owner = -1;
        ball.vx = k.dx * k.pw;
        ball.vy = k.dy * k.pw;
        ball.vh = k.lift || 0;
        ball.h = Math.max(ball.h, 1);
        ball.protect = 0.15;
    }

    /* ---------- ball ---------- */
    function moveBall(dt) {
        ball.protect = Math.max(0, ball.protect - dt);
        if (ball.owner >= 0) {
            const p = P[ball.owner];
            ball.x = p.x + p.fx * (PR + BR + 1);
            ball.y = p.y + p.fy * (PR + BR + 1);
            ball.vx = p.vx;
            ball.vy = p.vy;
            ball.h = 0;
            ball.vh = 0;
            return;
        }
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        const air = ball.h > 0.5 || ball.vh > 0;
        const sp = Math.hypot(ball.vx, ball.vy);
        if (sp > 0) {
            let ns;
            if (ball.x < F.L || ball.x > F.R) ns = sp * Math.exp(-7 * dt); // the net kills the ball
            else if (air) ns = sp * Math.exp(-AIR_DRAG * dt);
            else ns = Math.max(0, sp * Math.exp(-ROLL_DRAG * dt) - ROLL_FRIC * dt);
            ball.vx *= ns / sp;
            ball.vy *= ns / sp;
        }
        if (air) {
            ball.vh -= GRAV * dt;
            ball.h += ball.vh * dt;
            if (ball.h <= 0) {
                ball.h = 0;
                if (ball.vh < -90) {
                    ball.vh = -ball.vh * BOUNCE; // each bounce bites
                    ball.vx *= 0.86;
                    ball.vy *= 0.86;
                } else ball.vh = 0;
            }
        }
        // the court is a cage: walls everywhere except the goal mouths
        if (ball.y < F.T + BR) {
            ball.y = F.T + BR;
            if (ball.vy < 0) ball.vy *= -WALL_REST;
        }
        if (ball.y > F.B - BR) {
            ball.y = F.B - BR;
            if (ball.vy > 0) ball.vy *= -WALL_REST;
        }
        const inMouth = ball.y > GY1 + BR && ball.y < GY2 - BR && ball.h < 110;
        if (!inMouth) {
            if (ball.x < F.L + BR) {
                ball.x = F.L + BR;
                if (ball.vx < 0) ball.vx *= -WALL_REST;
            }
            if (ball.x > F.R - BR) {
                ball.x = F.R - BR;
                if (ball.vx > 0) ball.vx *= -WALL_REST;
            }
        }
        if (ball.x < F.L - BR) goal(1);
        else if (ball.x > F.R + BR) goal(0);
    }

    function goal(team) {
        score[team] += 1;
        celebrate = 1.6;
        kickoffTeam = team ? 0 : 1;
        ball.x = clamp(ball.x, F.L - GOAL.depth + BR, F.R + GOAL.depth - BR);
        ball.vx = ball.vy = 0;
        ball.owner = -2; // dead until the restart
    }

    function collect() {
        if (ball.owner !== -1 || ball.protect > 0 || ball.h > 40) return;
        const sp = Math.hypot(ball.vx, ball.vy);
        let best = null;
        let bd = 1e9;
        for (const p of P) {
            if (p.kickCd > 0) continue;
            const d = dist(p, ball);
            const reach = PR + BR + (p.gk ? 14 : 4);
            if (d < reach && d < bd) {
                bd = d;
                best = p;
            }
        }
        if (!best) return;
        if (sp < TRAP_SPEED || (best.gk && rnd() < K(best).save + 0.3)) {
            ball.owner = best.i;
            AI[best.i].held = 0;
            AI[best.i].t = 0;
        } else {
            // too hot to trap: it comes off the body (a keeper parries it)
            const nx = (ball.x - best.x) / (bd || 1);
            const ny = (ball.y - best.y) / (bd || 1);
            ball.vx = nx * sp * 0.4 + (rnd() - 0.5) * 120;
            ball.vy = ny * sp * 0.4 + (rnd() - 0.5) * 120;
            ball.protect = 0.12;
        }
    }

    function separate() {
        for (let a = 0; a < 6; a += 1)
            for (let b = a + 1; b < 6; b += 1) {
                const p = P[a];
                const q = P[b];
                const dx = q.x - p.x;
                const dy = q.y - p.y;
                const d = Math.hypot(dx, dy);
                if (d > 0 && d < PR * 2) {
                    const push = (PR * 2 - d) / 2;
                    p.x -= (dx / d) * push;
                    p.y -= (dy / d) * push;
                    q.x += (dx / d) * push;
                    q.y += (dy / d) * push;
                }
            }
    }

    function step(dt) {
        if (celebrate > 0) {
            celebrate -= dt;
            if (celebrate <= 0) kickoff(kickoffTeam);
            return;
        }
        teams.forEach(pickRoles);
        const controls = P.map((p) => (p.gk ? keeper(p, dt) : outfield(p, dt)));
        P.forEach((p, i) => drive(p, controls[i], dt));
        separate();
        moveBall(dt);
        collect();
    }

    /* ---------- drawing ---------- */
    const sx = (x) => x - OX;
    const sy = (y) => y - OY;

    function draw() {
        ctx.clearRect(0, 0, VW, VH);
        // outside the cage
        ctx.fillStyle = '#3A3A3F';
        ctx.fillRect(0, 0, VW, VH);
        // court
        ctx.fillStyle = '#9A958B';
        ctx.fillRect(sx(F.L), sy(F.T), F.R - F.L, F.B - F.T);
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 4;
        ctx.strokeRect(sx(F.L) + 2, sy(F.T) + 2, F.R - F.L - 4, F.B - F.T - 4);
        ctx.beginPath();
        ctx.moveTo(sx(F.cx), sy(F.T));
        ctx.lineTo(sx(F.cx), sy(F.B));
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx(F.cx), sy(F.cy), 80, 0, Math.PI * 2);
        ctx.stroke();
        [F.L, F.R].forEach((gx, gi) => {
            const s = gi ? 1 : -1;
            ctx.beginPath();
            ctx.arc(sx(gx), sy(F.cy), 190, gi ? Math.PI / 2 : -Math.PI / 2, gi ? (3 * Math.PI) / 2 : Math.PI / 2);
            ctx.stroke();
            // goal
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(sx(gx) + (s < 0 ? -GOAL.depth : 0), sy(GY1), GOAL.depth, GY2 - GY1);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 6;
            ctx.strokeRect(sx(gx) + (s < 0 ? -GOAL.depth : 0), sy(GY1), GOAL.depth, GY2 - GY1);
            ctx.strokeStyle = 'rgba(255,255,255,0.75)';
            ctx.lineWidth = 4;
        });
        // cage
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 8;
        ctx.strokeRect(sx(F.L) - 4, sy(F.T) - 4, F.R - F.L + 8, F.B - F.T + 8);

        // cover lines and targets
        if (opts.targets) {
            P.forEach((p) => {
                const a = AI[p.i];
                const tm = teams[p.team];
                if (a.job === 'COVER') {
                    ctx.strokeStyle = TEAMS[p.team].kit;
                    ctx.globalAlpha = 0.5;
                    ctx.lineWidth = 4;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(sx(tm.ownX), sy(F.cy));
                    ctx.lineTo(sx(ball.x), sy(ball.y));
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
                ctx.strokeStyle = '#111';
                ctx.lineWidth = 3;
                ctx.setLineDash([10, 9]);
                ctx.beginPath();
                ctx.moveTo(sx(p.x), sy(p.y));
                ctx.lineTo(sx(a.tx), sy(a.ty));
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = TEAMS[p.team].kit;
                ctx.beginPath();
                ctx.arc(sx(a.tx), sy(a.ty), 6, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // ball shadow + players + ball
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(sx(ball.x) + ball.h * 0.25, sy(ball.y) + ball.h * 0.35, BR + 2, BR, 0, 0, Math.PI * 2);
        ctx.fill();
        P.forEach((p) => {
            const t = TEAMS[p.team];
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath();
            ctx.arc(sx(p.x) + 4, sy(p.y) + 5, PR + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = p.gk ? t.trim : t.kit;
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(sx(p.x), sy(p.y), PR + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // facing
            ctx.beginPath();
            ctx.moveTo(sx(p.x + p.fx * (PR - 2)), sy(p.y + p.fy * (PR - 2)));
            ctx.lineTo(sx(p.x + p.fx * (PR + 12)), sy(p.y + p.fy * (PR + 12)));
            ctx.stroke();
            ctx.fillStyle = p.gk ? '#111' : '#fff';
            ctx.font = '700 20px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(t.nums[p.slot]), sx(p.x), sy(p.y) + 1);
            if (opts.jobs) {
                const job = AI[p.i].job;
                ctx.font = '700 19px "JetBrains Mono", monospace';
                const w = ctx.measureText(job).width + 14;
                const yy = sy(p.y) - PR - 26;
                ctx.fillStyle = job === 'PRESS' || job === 'CARRY' ? '#EDBB00' : '#fff';
                ctx.strokeStyle = '#111';
                ctx.lineWidth = 3;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(sx(p.x) - w / 2, yy - 13, w, 26, 6);
                else ctx.rect(sx(p.x) - w / 2, yy - 13, w, 26);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#111';
                ctx.fillText(job, sx(p.x), yy + 1);
            }
        });
        const r = BR + Math.min(8, ball.h * 0.05);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sx(ball.x), sy(ball.y - ball.h * 0.35), r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // scoreboard
        ctx.font = '700 26px "Space Grotesk", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText(`${TEAMS[0].name} ${score[0]} – ${score[1]} ${TEAMS[1].name}`, 18, 22);
        ctx.textAlign = 'right';
        ctx.font = '700 20px "JetBrains Mono", monospace';
        ctx.fillStyle = '#EDBB00';
        ctx.fillText(`${opts.slow ? 'slow motion · ' : ''}${lastSteps} physics step${lastSteps === 1 ? '' : 's'} this frame`, VW - 18, 22);
        if (celebrate > 0) {
            ctx.textAlign = 'center';
            ctx.font = '400 96px Barlow Condensed, sans-serif';
            ctx.fillStyle = '#EDBB00';
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 8;
            ctx.strokeText('GOAL!', VW / 2, VH / 2);
            ctx.fillText('GOAL!', VW / 2, VH / 2);
        }
        if (paused) {
            ctx.fillStyle = 'rgba(17,17,17,0.45)';
            ctx.fillRect(0, 0, VW, VH);
            ctx.textAlign = 'center';
            ctx.font = '700 34px "Space Grotesk", sans-serif';
            ctx.fillStyle = '#fff';
            ctx.fillText('Paused · press Play', VW / 2, VH / 2);
        }
    }

    /* ---------- loop: a fixed 120 Hz step, decoupled from the frame rate ---------- */
    const loop = createLoop((frameDt) => {
        acc += frameDt * (opts.slow ? 0.25 : 1);
        let n = 0;
        while (acc >= STEP && n < 12) {
            step(STEP);
            acc -= STEP;
            n += 1;
        }
        lastSteps = n;
        stepCount += n;
        frameCount += 1;
        statClock += frameDt;
        if (statClock >= 0.5) {
            onStats?.({ stepsPerSec: Math.round(stepCount / statClock), fps: Math.round(frameCount / statClock), score: [...score] });
            stepCount = 0;
            frameCount = 0;
            statClock = 0;
        }
        draw();
    });

    kickoff(0);
    draw();
    paused = reducedMotion;
    if (!paused) loop.start();
    else draw();

    const toWorld = (e) => {
        const r = canvas.getBoundingClientRect();
        return { x: ((e.clientX - r.left) * VW) / r.width + OX, y: ((e.clientY - r.top) * VH) / r.height + OY };
    };
    const onPointer = (e) => {
        if (celebrate > 0) return;
        const w = toWorld(e);
        if (w.x < F.L || w.x > F.R || w.y < F.T || w.y > F.B) return;
        if (ball.owner >= 0) P[ball.owner].kickCd = 0.5;
        Object.assign(ball, { x: clamp(w.x, F.L + BR, F.R - BR), y: clamp(w.y, F.T + BR, F.B - BR), vx: 0, vy: 0, h: 0, vh: 0, owner: -1, protect: 0.1 });
        AI.forEach((a) => {
            a.t = 0;
        });
        if (paused) draw();
    };
    canvas.addEventListener('pointerdown', onPointer);

    return {
        setLevel(team, level) {
            lv[team] = level;
        },
        setOption(key, value) {
            opts[key] = value;
            draw();
        },
        setPaused(v) {
            paused = v;
            if (v) {
                loop.stop();
                draw();
            } else {
                acc = 0;
                loop.start();
            }
        },
        restart() {
            score[0] = 0;
            score[1] = 0;
            celebrate = 0;
            kickoff(0);
            draw();
            onStats?.({ stepsPerSec: 0, fps: 0, score: [0, 0] });
        },
        dispose() {
            loop.dispose();
            canvas.removeEventListener('pointerdown', onPointer);
            disposeCanvas();
        },
    };
}
