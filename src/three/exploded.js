// Scroll-driven exploded view of a system's architecture.
//
// Follows the exploded-view skill from open-3d-skills: every part is its own
// Group with `stage` and `explode` offsets in userData; each stage starts when
// the previous one is half done; an outer shell opens first and drops to
// x-ray opacity; labels sit in two edge columns with leader lines; the camera
// re-fits as the assembly grows. RoomEnvironment IBL, one soft key light onto
// a ShadowMaterial floor, ACES tone mapping, clearcoated paint, 0.3–0.45
// roughness metals.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const TONES = {
    steel: { color: '#8a95ab', metalness: 0.85, roughness: 0.38 },
    blue: { color: '#0b57b0', metalness: 0.25, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.18 },
    garnet: { color: '#a50044', metalness: 0.25, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.18 },
    gold: { color: '#edbb00', metalness: 0.9, roughness: 0.3 },
    trim: { color: '#151d33', metalness: 0.6, roughness: 0.45 },
};
const GLOW = {
    gold: new THREE.Color('#ffcf33'),
    blue: new THREE.Color('#5e9eff'),
    garnet: new THREE.Color('#ff3d7f'),
};

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smoothstep = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
};

function material(tone) {
    const spec = TONES[tone] || TONES.steel;
    return new THREE.MeshPhysicalMaterial(spec);
}
function glowMaterial(color, intensity = 1.6) {
    return new THREE.MeshStandardMaterial({ color: '#111', emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
}

// ---- Part builders ----------------------------------------------------------
function slab(def) {
    const [w, h, d] = def.size;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(0.08, h * 0.3)), material(def.tone));
    g.add(body);
    const accent = def.tone === 'steel' ? GLOW.blue : GLOW.gold;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, h * 0.16, 0.02), glowMaterial(accent, 1.2));
    strip.position.set(w * 0.1, 0, d / 2 + 0.005);
    g.add(strip);
    const ledGeo = new THREE.BoxGeometry(0.07, 0.07, 0.02);
    for (let i = 0; i < 3; i++) {
        const led = new THREE.Mesh(ledGeo, glowMaterial(i === 0 ? GLOW.garnet : accent, 2));
        led.position.set(-w / 2 + 0.22 + i * 0.13, 0, d / 2 + 0.005);
        g.add(led);
    }
    return g;
}

function disks(def) {
    const [r, h] = def.size;
    const g = new THREE.Group();
    const n = 3;
    const dh = h / n;
    for (let i = 0; i < n; i++) {
        const disk = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dh * 0.82, 40), material(def.tone));
        disk.position.y = -h / 2 + dh * (i + 0.5);
        g.add(disk);
        const band = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.01, r * 1.01, dh * 0.06, 40), glowMaterial(GLOW.gold, 0.9));
        band.position.y = disk.position.y + dh * 0.44;
        g.add(band);
    }
    return g;
}

function queue(def) {
    const [w, h, d] = def.size;
    const g = new THREE.Group();
    const tray = new THREE.Mesh(new RoundedBoxGeometry(w, h * 0.5, d, 3, 0.05), material('trim'));
    tray.position.y = -h * 0.25;
    g.add(tray);
    const jobs = new THREE.Group();
    const n = 7;
    const spacing = (w - 0.4) / n;
    const jobGeo = new RoundedBoxGeometry(spacing * 0.7, h * 0.55, d * 0.55, 2, 0.04);
    const jobMat = material(def.tone);
    for (let i = 0; i < n; i++) {
        const job = new THREE.Mesh(jobGeo, jobMat);
        job.position.set(-w / 2 + 0.2 + spacing * (i + 0.5), h * 0.25, 0);
        jobs.add(job);
    }
    g.add(jobs);
    // Moving jobs: slide one slot every couple of seconds, wrapping around
    g.userData.tick = (t) => {
        const off = (t * 0.25 * spacing) % spacing;
        jobs.children.forEach((job, i) => {
            let x = -w / 2 + 0.2 + spacing * (i + 0.5) + off;
            if (x > w / 2 - 0.2) x -= spacing * n;
            job.position.x = x;
        });
    };
    return g;
}

function core(def) {
    const [w, h, d] = def.size;
    const g = new THREE.Group();
    const plate = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(0.06, h * 0.3)), material('trim'));
    g.add(plate);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(w * 0.3, 0.045, 16, 64), glowMaterial(GLOW[def.tone] || GLOW.gold, 2.2));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = h / 2 + 0.02;
    g.add(ring);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.16, w * 0.16, 0.03, 40), glowMaterial(new THREE.Color('#bfe0ff'), 1.4));
    disc.position.y = h / 2 + 0.015;
    g.add(disc);
    return g;
}

function ring(def) {
    const [r, tube] = def.size;
    const g = new THREE.Group();
    const torus = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 96), glowMaterial(GLOW[def.tone] || GLOW.blue, 1.3));
    torus.rotation.x = Math.PI / 2;
    g.add(torus);
    return g;
}

function rack(def) {
    const [w, h, d] = def.size;
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.07), material('trim')));
    // 18 scanner LEDs: two rows of nine
    const ledGeo = new RoundedBoxGeometry(0.22, 0.14, 0.04, 2, 0.02);
    const palette = [GLOW.blue, GLOW.garnet, GLOW.blue, GLOW.gold];
    for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 9; i++) {
            const led = new THREE.Mesh(ledGeo, glowMaterial(palette[(i + row) % palette.length], 1.8));
            led.position.set(-w / 2 + 0.35 + i * ((w - 0.7) / 8), (row - 0.5) * h * 0.42, d / 2 + 0.01);
            g.add(led);
        }
    }
    return g;
}

const BUILDERS = { slab, disks, queue, core, ring, rack };

// Half-height of a part, used to anchor its label on the top face
function halfHeight(def) {
    if (def.kind === 'ring') return def.size[1];
    if (def.kind === 'disks') return def.size[1] / 2;
    return def.size[1] / 2;
}

// ---- Main ----------------------------------------------------------------
export function createExploded(container, { parts, labelsEl, linesEl, reducedMotion = false }) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
        return null;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.9;

    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 25 });
    key.shadow.radius = 6;
    key.shadow.bias = -0.0005;
    scene.add(key);

    const assembly = new THREE.Group();
    scene.add(assembly);

    // Build parts. Data stages start at 0; the shell takes stage 0 here.
    const items = [];
    for (const def of parts) {
        const build = BUILDERS[def.kind] || slab;
        const obj = build(def);
        obj.traverse((o) => {
            if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
            }
        });
        const base = new THREE.Vector3(...def.pos);
        obj.position.copy(base);
        obj.userData = { ...obj.userData, stage: (def.stage || 0) + 1, explode: new THREE.Vector3(...def.explode), base };
        assembly.add(obj);
        items.push({ def, obj });
    }

    // Outer shell: blaugrana halves around the assembled bounding box
    const box = new THREE.Box3().setFromObject(assembly);
    const size = box.getSize(new THREE.Vector3()).addScalar(0.3);
    const center = box.getCenter(new THREE.Vector3());
    const shells = [];
    for (const [side, tone] of [[-1, 'blue'], [1, 'garnet']]) {
        const mat = material(tone);
        mat.transparent = true;
        const half = new THREE.Mesh(new RoundedBoxGeometry(size.x / 2, size.y, size.z, 4, 0.12), mat);
        half.castShadow = true;
        const base = new THREE.Vector3(center.x + (side * size.x) / 4, center.y, center.z);
        half.position.copy(base);
        half.userData = { stage: 0, explode: new THREE.Vector3(side * 3.4, 0.2, -0.4), base, shell: true };
        assembly.add(half);
        shells.push(half);
    }
    // Gold seam where the halves meet
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.04, size.y * 0.92, size.z * 1.002), glowMaterial(GLOW.gold, 1.6));
    seam.position.copy(center);
    seam.userData = { stage: 0, explode: new THREE.Vector3(0, 0, 0), base: center.clone(), seam: true };
    assembly.add(seam);

    const floorY = box.min.y - 1.05;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.22 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = floorY;
    floor.receiveShadow = true;
    scene.add(floor);

    const movers = assembly.children.filter((c) => c.userData.explode);
    const stages = Math.max(...movers.map((m) => m.userData.stage)) + 1;
    const stageLen = 2 / (stages + 1);

    function applyExplode(t) {
        for (const m of movers) {
            const { stage, explode, base } = m.userData;
            const local = clamp01((t - (stage * stageLen) / 2) / stageLen);
            const e = easeInOutCubic(local);
            m.position.copy(base).addScaledVector(explode, e);
            if (m.userData.shell) {
                const op = 1 - 0.9 * e;
                m.material.opacity = op;
                m.material.depthWrite = op > 0.98;
                m.castShadow = op > 0.5;
            }
            if (m.userData.seam) m.visible = e < 0.02;
        }
    }

    // Camera fit: bounding sphere at t=0 and t=1 (shell excluded when open)
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const viewDir = new THREE.Vector3(0.42, 0.34, 1).normalize();
    function sphereAt(t) {
        applyExplode(t);
        assembly.updateMatrixWorld(true);
        const b = new THREE.Box3();
        for (const m of movers) {
            if (t > 0.5 && (m.userData.shell || m.userData.seam)) continue;
            b.expandByObject(m);
        }
        return b.getBoundingSphere(new THREE.Sphere());
    }
    const s0 = sphereAt(0);
    const s1 = sphereAt(1);

    let width = 1;
    let height = 1;
    function fitDistance(r) {
        const vf = THREE.MathUtils.degToRad(camera.fov / 2);
        const hf = Math.atan(Math.tan(vf) * camera.aspect);
        const narrow = width < 640;
        return (r / Math.sin(Math.min(vf, hf))) * (narrow ? 1.02 : 1.12);
    }

    // Labels: one element per labelled part, laid out in two edge columns
    const labelled = items.filter((it) => it.def.label);
    const labelNodes = labelled.map((it) => {
        const el = document.createElement('div');
        el.className = 'xv-label';
        el.innerHTML = `<span class="xv-name"></span><span class="xv-note"></span>`;
        el.querySelector('.xv-name').textContent = it.def.label;
        el.querySelector('.xv-note').textContent = it.def.note || '';
        labelsEl?.appendChild(el);
        return el;
    });
    const anchor = new THREE.Vector3();

    function layoutLabels(alpha) {
        if (!labelsEl || !linesEl) return;
        labelsEl.style.opacity = String(alpha);
        linesEl.style.opacity = String(alpha);
        if (alpha <= 0.001 || width < 640) {
            linesEl.innerHTML = '';
            return;
        }
        const colW = Math.min(230, width * 0.24);
        const pts = labelled.map((it, i) => {
            anchor.set(0, halfHeight(it.def), 0);
            it.obj.localToWorld(anchor);
            anchor.project(camera);
            const x = (anchor.x * 0.5 + 0.5) * width;
            const y = (-anchor.y * 0.5 + 0.5) * height;
            return { i, x, y, h: labelNodes[i].offsetHeight || 44 };
        });
        const sideOf = (p) => (p.x < width / 2 ? 'left' : 'right');
        let paths = '';
        for (const side of ['left', 'right']) {
            const col = pts.filter((p) => sideOf(p) === side).sort((a, b) => a.y - b.y);
            const gap = 10;
            const top = 16;
            const bottom = height - 16;
            // Push down to avoid overlap, then pull back up from the bottom
            let y = top;
            for (const p of col) {
                p.ly = Math.max(p.y - p.h / 2, y);
                y = p.ly + p.h + gap;
            }
            let limit = bottom;
            for (let k = col.length - 1; k >= 0; k--) {
                const p = col[k];
                p.ly = Math.min(p.ly, limit - p.h);
                limit = p.ly - gap;
            }
            for (const p of col) {
                const el = labelNodes[p.i];
                const lx = side === 'left' ? 0 : width - colW;
                el.style.transform = `translate(${lx}px, ${p.ly}px)`;
                el.style.width = `${colW}px`;
                el.style.textAlign = side === 'left' ? 'right' : 'left';
                const ey = p.ly + p.h / 2;
                const ex = side === 'left' ? colW + 8 : width - colW - 8;
                const elbow = side === 'left' ? ex + 18 : ex - 18;
                paths += `<path d="M${ex},${ey} L${elbow},${ey} L${p.x},${p.y}" />`;
                paths += `<circle cx="${p.x}" cy="${p.y}" r="3" />`;
            }
        }
        linesEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
        linesEl.innerHTML = paths;
    }

    // State
    let target = 0;
    let current = 0;
    let time = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    let inView = false;
    let dirty = true;

    function render() {
        applyExplode(current);
        const e = easeInOutCubic(current);
        const r = THREE.MathUtils.lerp(s0.radius, s1.radius, e);
        const c = new THREE.Vector3().lerpVectors(s0.center, s1.center, e);
        camera.position.copy(c).addScaledVector(viewDir, fitDistance(r));
        camera.lookAt(c);
        assembly.rotation.y = reducedMotion ? 0 : Math.sin(time * 0.22) * 0.22;
        for (const { obj } of items) obj.userData.tick?.(reducedMotion ? 0 : time);
        renderer.render(scene, camera);
        layoutLabels(smoothstep(0.62, 0.92, current));
    }

    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        time += dt;
        const prev = current;
        current = reducedMotion ? target : current + (target - current) * 0.14;
        if (Math.abs(target - current) < 1e-4) current = target;
        // Reduced motion: only draw when the scroll position changes
        if (!reducedMotion || dirty || prev !== current) render();
        dirty = false;
    }

    function start() {
        if (running || !inView || document.hidden) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
    }
    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }

    function resize() {
        width = Math.max(1, container.clientWidth);
        height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        dirty = true;
        if (!running) render();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
    });
    io.observe(container);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    resize();

    return {
        setProgress(t) {
            target = clamp01(t);
            dirty = true;
        },
        dispose() {
            stop();
            ro.disconnect();
            io.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            labelNodes.forEach((el) => el.remove());
            if (linesEl) linesEl.innerHTML = '';
            scene.traverse((obj) => {
                obj.geometry?.dispose();
                const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
                mats.forEach((m) => m.dispose());
            });
            envTex.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        },
    };
}
