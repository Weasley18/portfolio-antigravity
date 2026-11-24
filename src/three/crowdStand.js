// "200+ mentored": the workshop crowd for the Extracurricular page.
//
// The view from the speaker's spot, looking up into a tiered stand of
// 220 seats. When the scene scrolls into view, phone lights come on in a wave
// from the front row outward until the whole stand is lit. Built in code with
// instancing (three draw calls for the whole crowd), DPR capped at 2, nothing
// renders off screen, reduced motion shows the lit stand as a still frame.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const BG = '#050913';
const ROWS = 10;
const PER_ROW = 22;
const SEATS = ROWS * PER_ROW;
const LIGHTS = ['#ffe9a8', '#ffffff', '#8fb8ff', '#ff8fb5', '#EDBB00'];
const DURATION = 3.6; // seconds for the wave to fill the stand

const clamp01 = (x) => Math.min(1, Math.max(0, x));

export function createCrowdStand(container, { reducedMotion = false, onProgress } = {}) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch {
        return null;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(BG, 1);
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG, 10, 26);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    scene.add(new THREE.HemisphereLight('#7f9cff', '#05070f', 0.5));
    const key = new THREE.DirectionalLight('#ffd9a0', 0.6);
    key.position.set(0, 4, 6);
    scene.add(key);

    // Tiered stand: a step per row, curving round the podium
    const stand = new THREE.Group();
    scene.add(stand);
    const stepMat = new THREE.MeshStandardMaterial({ color: '#0a1122', roughness: 0.9, side: THREE.DoubleSide });
    const edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#2f6bff').multiplyScalar(1.3) });
    const rowR = (r) => 8 + r * 0.95;
    const rowY = (r) => r * 0.55;
    const ARC = 1.75;
    for (let r = 0; r < ROWS; r++) {
        const arc = ARC;
        const riser = new THREE.Mesh(new THREE.CylinderGeometry(rowR(r) - 0.47, rowR(r) - 0.47, 0.55, 64, 1, true, Math.PI - arc / 2, arc), stepMat);
        riser.position.y = rowY(r) - 0.28;
        stand.add(riser);
        const tread = new THREE.Mesh(new THREE.RingGeometry(rowR(r) - 0.47, rowR(r) + 0.48, 64, 1, 0, arc), stepMat);
        tread.rotation.x = -Math.PI / 2;
        tread.rotation.z = Math.PI / 2 - arc / 2;
        tread.position.y = rowY(r);
        stand.add(tread);
        if (r % 3 === 0) {
            const edge = new THREE.Mesh(new THREE.TorusGeometry(rowR(r) - 0.45, 0.012, 4, 96, arc), edgeMat);
            edge.rotation.x = Math.PI / 2;
            edge.rotation.z = Math.PI / 2 - arc / 2 + Math.PI;
            edge.position.y = rowY(r) - 0.05;
            stand.add(edge);
        }
    }

    // People: instanced body capsules + heads + phone lights
    const bodies = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.34, 4, 10), new THREE.MeshStandardMaterial({ color: '#2a3a6e', roughness: 0.9 }), SEATS);
    const heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 12, 10), new THREE.MeshStandardMaterial({ color: '#34467e', roughness: 0.8 }), SEATS);
    const phones = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.1, 0.16), new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, toneMapped: false }), SEATS);
    stand.add(bodies, heads, phones);

    const seats = [];
    const tmp = new THREE.Object3D();
    const col = new THREE.Color();
    for (let r = 0; r < ROWS; r++) {
        for (let k = 0; k < PER_ROW; k++) {
            const a = Math.PI + (k / (PER_ROW - 1) - 0.5) * 1.6 + (r % 2 ? 0.025 : 0);
            const R = rowR(r) + (Math.sin(k * 7.1 + r) * 0.08);
            const x = Math.sin(a) * R;
            const z = Math.cos(a) * R;
            const y = rowY(r);
            // wave order: front row first, centre outward
            const order = clamp01((r / ROWS) * 0.75 + Math.abs(k / (PER_ROW - 1) - 0.5) * 0.5 + Math.random() * 0.12);
            const hand = Math.random() < 0.5 ? -1 : 1;
            seats.push({ x, y, z, a, order, hand, phase: Math.random() * Math.PI * 2 });
            col.set(LIGHTS[(r * 3 + k) % LIGHTS.length]).multiplyScalar(1.6);
            phones.setColorAt(seats.length - 1, col);
        }
    }

    // Floodlight glows at the top of the stand
    const fc = document.createElement('canvas');
    fc.width = fc.height = 128;
    const fg2 = fc.getContext('2d');
    const grad = fg2.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.2, 'rgba(255,255,255,0.3)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    fg2.fillStyle = grad;
    fg2.fillRect(0, 0, 128, 128);
    const glowTex = new THREE.CanvasTexture(fc);
    for (const [x, c] of [[-9, '#5E9EFF'], [9, '#F0467E']]) {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
        s.position.set(x, 9, -12);
        s.scale.set(5, 5, 1);
        scene.add(s);
    }

    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.25, 0.95));
    composer.addPass(new OutputPass());

    // --- Animation ------------------------------------------------------------
    let time = 0;
    let wave = reducedMotion ? 1 : 0; // 0..1 how far the lights have spread
    let playing = false;
    const lookAt = new THREE.Vector3(0, 3.1, -8);

    function place() {
        const portrait = camera.aspect < 1;
        camera.position.set(portrait ? -0.4 : 0, portrait ? 1.6 : 1.3, portrait ? 6.2 : 5.0);
        camera.lookAt(lookAt);
    }

    function update() {
        const lit = clamp01(wave * 1.12);
        for (let i = 0; i < SEATS; i++) {
            const s = seats[i];
            const on = lit >= s.order && lit > 0;
            const rise = on ? clamp01((lit - s.order) * 8) : 0;
            const sway = reducedMotion ? 0 : Math.sin(time * 1.6 + s.phase) * 0.06 * rise;
            const bob = rise * 0.06;
            tmp.position.set(s.x, s.y + 0.34 + bob, s.z);
            tmp.rotation.set(0, s.a + Math.PI, 0);
            tmp.scale.setScalar(1);
            tmp.updateMatrix();
            bodies.setMatrixAt(i, tmp.matrix);
            tmp.position.y = s.y + 0.86 + bob;
            tmp.updateMatrix();
            heads.setMatrixAt(i, tmp.matrix);
            // phone held up beside the head, facing the stage
            tmp.position.set(s.x + Math.cos(s.a) * 0.26 * s.hand + sway, s.y + 0.95 + rise * 0.3, s.z - Math.sin(s.a) * 0.26 * s.hand);
            tmp.scale.setScalar(rise);
            tmp.updateMatrix();
            phones.setMatrixAt(i, tmp.matrix);
        }
        bodies.instanceMatrix.needsUpdate = true;
        heads.instanceMatrix.needsUpdate = true;
        phones.instanceMatrix.needsUpdate = true;
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
        camera.fov = w / h < 1 ? 64 : 44;
        camera.updateProjectionMatrix();
        place();
        update();
        composer.render();
    }

    let raf = 0;
    let running = false;
    let inView = false;
    let last = 0;
    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        time += dt;
        if (playing) {
            wave = Math.min(1, wave + dt / DURATION);
            onProgress?.(wave);
            if (wave >= 1) playing = false;
        }
        update();
        composer.render();
    }
    function start() {
        if (reducedMotion || running || !inView || document.hidden) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
    }
    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }

    let started = false;
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(
        ([e]) => {
            inView = e.isIntersecting;
            if (inView && !started && !reducedMotion) {
                started = true;
                playing = true;
            }
            if (inView) start();
            else stop();
        },
        { threshold: 0.35 }
    );
    io.observe(container);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    resize();
    if (reducedMotion) onProgress?.(1);

    return {
        replay() {
            if (reducedMotion) return;
            wave = 0;
            playing = true;
            onProgress?.(0);
            start();
        },
        dispose() {
            stop();
            ro.disconnect();
            io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            scene.traverse((o) => {
                o.geometry?.dispose();
                if (o.material) {
                    o.material.map?.dispose();
                    o.material.dispose();
                }
            });
            glowTex.dispose();
            rt.dispose();
            composer.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        },
    };
}
