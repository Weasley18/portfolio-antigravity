// Trophy turntable for the Achievements page.
//
// Five procedurally built trophies (no asset files) stand on plinths around a
// slow turntable. The selected one swings to the front under a spotlight; drag
// to spin, click a trophy to bring it forward. Metals are lit by a generated
// room environment; light bloom on the emissive trims only. DPR capped at 2,
// nothing renders off screen, and reduced motion snaps instead of easing.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BG = '#050913';
const GOLD = '#f2c14e';
const BLAU = '#2f6bff';
const GRANA = '#d6205f';
const TRIM = { cup: '#EDBB00', db: '#5E9EFF', star: '#EDBB00', medal: '#F0467E', stack: '#3FBF86' };
const RADIUS = 3.4;

const gold = () => new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.22 });
const glowMat = (c, k = 2) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k) });

function plaqueTexture(name, rank, color) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 160;
    const g = c.getContext('2d');
    g.fillStyle = '#0b1224';
    g.fillRect(0, 0, 512, 160);
    g.strokeStyle = color;
    g.lineWidth = 6;
    g.strokeRect(8, 8, 496, 144);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = color;
    g.font = '800 64px "Barlow Condensed", sans-serif';
    g.fillText(rank.toUpperCase(), 256, 62);
    g.fillStyle = '#c9d3ea';
    g.font = '600 34px "Barlow Condensed", sans-serif';
    g.fillText(name.toUpperCase(), 256, 118);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
}

function medalFace(text) {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(110, 100, 10, 128, 128, 128);
    grad.addColorStop(0, '#ffe7a3');
    grad.addColorStop(1, '#c08a1e');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(80,50,0,0.55)';
    g.lineWidth = 6;
    g.beginPath();
    g.arc(128, 128, 104, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#5a3c06';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '800 76px "Barlow Condensed", sans-serif';
    g.fillText(text, 128, 120);
    g.font = '700 24px "Barlow Condensed", sans-serif';
    g.fillText('RATING', 128, 178);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

function glowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.8)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.25)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

const lathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), seg);

// --- Trophy builders (each ~1.5 units tall, base at y = 0) -----------------------
function buildCup() {
    const g = new THREE.Group();
    const m = gold();
    g.add(new THREE.Mesh(lathe([[0, 0], [0.4, 0], [0.4, 0.1], [0.3, 0.13], [0.27, 0.2], [0.1, 0.27], [0.07, 0.52], [0.12, 0.6], [0.2, 0.66], [0.44, 0.82], [0.54, 1.08], [0.56, 1.42], [0.52, 1.42], [0.49, 1.1], [0.4, 0.88], [0, 0.78]]), m));
    for (const s of [1, -1]) {
        const h = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 12, 32, Math.PI), m);
        h.rotation.z = -s * Math.PI / 2;
        h.position.set(s * 0.52, 1.08, 0);
        g.add(h);
    }
    return g;
}

function buildDb() {
    const g = new THREE.Group();
    const m = gold();
    g.add(new THREE.Mesh(lathe([[0, 0], [0.36, 0], [0.36, 0.1], [0.12, 0.2], [0.09, 0.42], [0, 0.42]]), m));
    for (let i = 0; i < 3; i++) {
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.26, 48), m);
        disc.position.y = 0.58 + i * 0.32;
        g.add(disc);
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.425, 0.012, 8, 64), glowMat(TRIM.db, 2.2));
        band.rotation.x = Math.PI / 2;
        band.position.y = 0.58 + i * 0.32 + 0.16;
        g.add(band);
    }
    return g;
}

function buildStar() {
    const g = new THREE.Group();
    const m = gold();
    g.add(new THREE.Mesh(lathe([[0, 0], [0.34, 0], [0.34, 0.1], [0.12, 0.2], [0.07, 0.62], [0, 0.62]]), m));
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
        const r = i % 2 ? 0.24 : 0.56;
        const a = Math.PI / 2 + (i * Math.PI) / 5;
        if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        else s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 3 });
    geo.center();
    const star = new THREE.Mesh(geo, m);
    star.position.y = 1.08;
    g.add(star);
    return g;
}

function buildMedal(text) {
    const g = new THREE.Group();
    const m = gold();
    g.add(new THREE.Mesh(lathe([[0, 0], [0.3, 0], [0.3, 0.08], [0.06, 0.14], [0.05, 1.62], [0, 1.62]], 32), m));
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 12), m);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 1.6, 0.06);
    g.add(bar);
    // Ribbon in the club colours, a V from the bar down to the medal
    for (const [x, c] of [[-0.14, BLAU], [0.14, GRANA]]) {
        const r = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.56), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide }));
        r.position.set(x * 0.55, 1.32, 0.09);
        r.rotation.z = -x * 1.2;
        g.add(r);
    }
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.07, 64), m);
    disc.rotation.x = Math.PI / 2;
    disc.position.set(0, 0.86, 0.1);
    g.add(disc);
    // engraved face as its own circle so the text reads upright, not mirrored
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.37, 64), new THREE.MeshStandardMaterial({ map: medalFace(text), metalness: 0.7, roughness: 0.35 }));
    face.position.set(0, 0.86, 0.137);
    g.add(face);
    return g;
}

function buildStack() {
    const g = new THREE.Group();
    const cols = [BLAU, GRANA];
    const chips = [];
    for (let i = 0; i < 10; i++) {
        const top = i === 9;
        const chip = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 0.09, 48),
            top ? gold() : new THREE.MeshStandardMaterial({ color: cols[i % 2], metalness: 0.4, roughness: 0.35 })
        );
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.012, 6, 48), glowMat(top ? '#EDBB00' : cols[i % 2], 1.6));
        rim.rotation.x = Math.PI / 2;
        chip.add(rim);
        const base = 0.05 + i * 0.105;
        chip.position.set(Math.sin(i * 2.3) * 0.05, base, Math.cos(i * 1.7) * 0.05);
        chip.rotation.y = i * 0.6;
        chip.userData.base = base;
        g.add(chip);
        chips.push(chip);
    }
    g.userData.chips = chips;
    return g;
}

export function createTrophyCabinet(container, { items, reducedMotion = false, onSelect } = {}) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch {
        return null;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(BG, 1);
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%', touchAction: 'pan-y', cursor: 'grab' });
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG, 9, 20);
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.7;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    const lookAt = new THREE.Vector3(0, 0.95, 0.6);

    // Lights: dim fill, a warm spotlight fixed on the front plinth
    scene.add(new THREE.HemisphereLight('#9fb6ff', '#0a0f1f', 0.35));
    const spot = new THREE.SpotLight('#fff1c9', 60, 14, 0.38, 0.6, 1.6);
    spot.position.set(0, 7, RADIUS + 2.2);
    spot.target.position.set(0, 0.6, RADIUS);
    scene.add(spot, spot.target);
    const rim = new THREE.DirectionalLight('#5e9eff', 0.9);
    rim.position.set(-4, 3, -4);
    scene.add(rim);

    // Turntable
    const table = new THREE.Group();
    scene.add(table);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.8, 0.18, 96), new THREE.MeshStandardMaterial({ color: '#0a1124', metalness: 0.7, roughness: 0.32 }));
    deck.position.y = -0.59;
    table.add(deck);
    const deckRing = new THREE.Mesh(new THREE.TorusGeometry(4.62, 0.02, 8, 160), glowMat('#2f6bff', 1.8));
    deckRing.rotation.x = Math.PI / 2;
    deckRing.position.y = -0.49;
    table.add(deckRing);
    // tick marks round the rim
    const ticks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.01, 0.22), glowMat('#5e9eff', 1.2), 72);
    const tm = new THREE.Matrix4();
    for (let i = 0; i < 72; i++) {
        const a = (i / 72) * Math.PI * 2;
        tm.makeRotationY(a).setPosition(Math.sin(a) * 4.3, -0.49, Math.cos(a) * 4.3);
        ticks.setMatrixAt(i, tm);
    }
    table.add(ticks);

    const glowTex = glowTexture();
    const N = items.length;
    const step = (Math.PI * 2) / N;
    const pickables = [];
    const stations = items.map((item, i) => {
        const color = TRIM[item.shape] || '#EDBB00';
        const st = new THREE.Group();
        const a = i * step;
        st.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
        st.rotation.y = a;
        table.add(st);

        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 1, 48), new THREE.MeshStandardMaterial({ color: '#0e1730', metalness: 0.55, roughness: 0.4 }));
        st.add(plinth);
        const trim = new THREE.Mesh(new THREE.TorusGeometry(0.63, 0.02, 8, 64), glowMat(color, 1.4));
        trim.rotation.x = Math.PI / 2;
        trim.position.y = 0.5;
        st.add(trim);
        const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.29), new THREE.MeshBasicMaterial({ map: plaqueTexture(item.plaque, item.rank, color) }));
        plaque.position.set(0, 0.05, 0.705);
        st.add(plaque);

        const trophy =
            item.shape === 'cup' ? buildCup()
            : item.shape === 'db' ? buildDb()
            : item.shape === 'star' ? buildStar()
            : item.shape === 'medal' ? buildMedal(item.rank)
            : buildStack();
        trophy.position.y = 0.5;
        st.add(trophy);

        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        halo.scale.set(3.2, 3.2, 1);
        halo.position.set(0, 1.3, -0.4);
        st.add(halo);

        // generous invisible hit box for clicks
        const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.6, 12), new THREE.MeshBasicMaterial({ visible: false }));
        hit.position.y = 0.8;
        hit.userData.index = i;
        st.add(hit);
        pickables.push(hit);
        return { st, trophy, trim, halo };
    });

    // Gold dust drifting up through the spotlight
    const DUST = 160;
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 9;
        dustPos[i * 3 + 1] = Math.random() * 5 - 0.5;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 9;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: glowTex, color: '#EDBB00', size: 0.09, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(dust);

    // Post
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.45, 0.3, 1.0);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // --- State ------------------------------------------------------------------
    let active = 0;
    let angle = 0; // current table rotation
    let targetAngle = 0;
    let drag = null;
    let time = 0;
    const pointer = new THREE.Vector2();
    const lean = new THREE.Vector2();

    function setActive(i, notify = false) {
        const n = ((i % N) + N) % N;
        let d = n - active;
        if (d > N / 2) d -= N;
        if (d < -N / 2) d += N;
        targetAngle -= d * step;
        active = n;
        if (notify) onSelect?.(n);
        invalidate();
    }

    function resize() {
        const w = Math.max(1, container.clientWidth);
        const h = Math.max(1, container.clientHeight);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        composer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        camera.aspect = w / h;
        camera.fov = w / h < 1 ? 50 : 34;
        camera.updateProjectionMatrix();
        invalidate();
    }

    function update(dt) {
        if (!drag) angle = reducedMotion ? targetAngle : angle + (targetAngle - angle) * Math.min(1, dt * 6);
        table.rotation.y = angle;
        lean.lerp(pointer, reducedMotion ? 1 : 0.05);
        const far = camera.aspect < 1 ? 12.5 : 9.6;
        camera.position.set(lean.x * 0.8, 2.3 + lean.y * 0.35, far);
        camera.lookAt(lookAt);

        stations.forEach(({ trophy, trim, halo, st }, i) => {
            // how close this plinth is to the front
            const world = i * step + angle;
            const front = Math.max(0, Math.cos(world));
            const focus = Math.pow(front, 6);
            if (!reducedMotion) trophy.rotation.y = time * (0.35 + focus * 0.25) + i;
            else trophy.rotation.y = -world;
            halo.material.opacity = focus * 0.32;
            trim.scale.setScalar(1 + focus * 0.05);
            st.position.y = focus * 0.12;
            const chips = trophy.userData.chips;
            if (chips && !reducedMotion) chips.forEach((c, k) => (c.position.y = c.userData.base + Math.max(0, Math.sin(time * 2.2 - k * 0.45)) * 0.035 * focus));
        });
        if (!reducedMotion) {
            for (let i = 0; i < DUST; i++) {
                let y = dustPos[i * 3 + 1] + dt * 0.18;
                if (y > 4.5) y = -0.5;
                dustPos[i * 3 + 1] = y;
            }
            dustGeo.attributes.position.needsUpdate = true;
        }
    }

    // --- Loop: continuous while animated and visible, on demand otherwise -------
    let raf = 0;
    let running = false;
    let inView = false;
    let last = 0;
    let dirty = true;
    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        if (reducedMotion && !dirty) return;
        if (!reducedMotion) time += dt;
        update(dt || 0.016);
        composer.render();
        dirty = false;
    }
    function invalidate() {
        dirty = true;
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

    // --- Input ----------------------------------------------------------------
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const el = renderer.domElement;
    function toNdc(e) {
        const r = el.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    }
    function onDown(e) {
        drag = { x: e.clientX, start: angle, moved: 0 };
        el.setPointerCapture?.(e.pointerId);
        el.style.cursor = 'grabbing';
    }
    function onMove(e) {
        toNdc(e);
        if (e.pointerType !== 'touch') pointer.set(ndc.x, ndc.y);
        if (!drag) return;
        const dx = e.clientX - drag.x;
        drag.moved = Math.max(drag.moved, Math.abs(dx));
        angle = drag.start + dx * 0.008;
        targetAngle = angle;
        invalidate();
    }
    function onUp(e) {
        if (!drag) return;
        const wasDrag = drag.moved > 6;
        drag = null;
        el.style.cursor = 'grab';
        if (wasDrag) {
            // snap to the plinth nearest the front
            const idx = Math.round(-angle / step);
            targetAngle = -idx * step;
            active = ((idx % N) + N) % N;
            onSelect?.(active);
            invalidate();
            return;
        }
        toNdc(e);
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(pickables, false)[0];
        if (hit) setActive(hit.object.userData.index, true);
    }
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', () => (drag = null));
    const onLeave = () => pointer.set(0, 0);
    el.addEventListener('pointerleave', onLeave);

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView) start();
        else stop();
    });
    io.observe(container);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    resize();
    update(0);
    composer.render();

    return {
        setActive: (i) => setActive(i),
        dispose() {
            stop();
            ro.disconnect();
            io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            el.removeEventListener('pointerleave', onLeave);
            scene.traverse((o) => {
                o.geometry?.dispose();
                const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
                mats.forEach((m) => {
                    m.map?.dispose();
                    m.dispose();
                });
            });
            glowTex.dispose();
            envRT.dispose();
            rt.dispose();
            composer.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            el.remove();
        },
    };
}
