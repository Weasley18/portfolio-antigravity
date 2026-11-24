// "Assemble" energy core for the Home hero.
//
// An original sci-fi reactor and holographic HUD, built in code. On load every
// ring and coil segment flies in from a scattered position and locks into
// place (the exploded-view skill's staged explode, run in reverse: each stage
// starts when the previous one is half done). Then it idles: HUD rings turn,
// energy spirals into the core, the rig leans toward the pointer, and a click
// fires a shockwave. Composer with HalfFloat MSAA + bloom, DPR capped at 2,
// quality steps down on slow frames, nothing renders off screen, and reduced
// motion shows the assembled core as a still frame.

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const CYAN = new THREE.Color('#7fd8ff');
const BLAU = new THREE.Color('#2f7bff');
const GRANA = new THREE.Color('#ff3d7f');
const GOLD = new THREE.Color('#ffc933');

const easeOutBack = (x) => {
    const c1 = 1.4;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

function glow(color, k) {
    return new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(k), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
}

// Fresnel shell: bright at the rim, clear in the middle
function fresnelMaterial(color, power = 2.2, k = 2.2) {
    return new THREE.ShaderMaterial({
        uniforms: { uColor: { value: color.clone().multiplyScalar(k) }, uPulse: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
            varying vec3 vN; varying vec3 vV;
            void main() {
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
                gl_Position = projectionMatrix * mv;
            }`,
        fragmentShader: /* glsl */ `
            uniform vec3 uColor; uniform float uPulse;
            varying vec3 vN; varying vec3 vV;
            void main() {
                float f = pow(1.0 - abs(dot(vN, vV)), ${power.toFixed(1)});
                gl_FragColor = vec4(uColor * (f + uPulse * 0.6), f + uPulse * 0.3);
            }`,
    });
}

export function createEnergyCore(container, { reducedMotion = false, onReady } = {}) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    } catch {
        return null;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.setClearColor('#050913', 1);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    camera.position.set(0, 0, 18);

    const rig = new THREE.Group(); // leans toward the pointer
    scene.add(rig);
    const pieces = []; // everything that assembles

    function addPiece(obj, stage, spin = 0) {
        // Scattered start: pushed outward and twisted, like an exploded view
        const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() * 0.6 - 0.1).normalize();
        obj.userData.home = { pos: obj.position.clone(), rot: obj.rotation.clone(), scale: obj.scale.clone() };
        obj.userData.from = {
            pos: obj.position.clone().addScaledVector(dir, 6 + Math.random() * 5),
            rot: new THREE.Euler(obj.rotation.x + (Math.random() - 0.5) * 3, obj.rotation.y + (Math.random() - 0.5) * 3, obj.rotation.z + (Math.random() - 0.5) * 4),
        };
        obj.userData.stage = stage;
        obj.userData.spin = spin;
        rig.add(obj);
        pieces.push(obj);
        return obj;
    }

    // --- Core -----------------------------------------------------------------
    const coreGroup = new THREE.Group();
    const coreInner = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), glow(new THREE.Color('#dff6ff'), 1.3));
    const coreShell = new THREE.Mesh(new THREE.SphereGeometry(0.95, 48, 32), fresnelMaterial(CYAN, 2.4, 1.2));
    const coreHalo = new THREE.Mesh(new THREE.SphereGeometry(1.35, 48, 32), fresnelMaterial(BLAU, 3.0, 0.7));
    coreGroup.add(coreInner, coreShell, coreHalo);
    addPiece(coreGroup, 0);

    // --- Coil ring: 10 segments around the core ------------------------------
    const segs = 10;
    for (let i = 0; i < segs; i++) {
        const a0 = (i / segs) * Math.PI * 2 + 0.06;
        const len = (Math.PI * 2) / segs - 0.12;
        const seg = new THREE.Mesh(new THREE.RingGeometry(1.75, 2.35, 12, 1, a0, len), glow(i % 2 ? CYAN : BLAU, i % 2 ? 1.6 : 1.1));
        // little gold contact on each segment
        const pin = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), glow(GOLD, 1.8));
        const mid = a0 + len / 2;
        pin.position.set(Math.cos(mid) * 2.05, Math.sin(mid) * 2.05, 0.01);
        addPiece(seg, 1);
        addPiece(pin, 1);
    }

    // --- HUD rings --------------------------------------------------------------
    function arcRing(r, width, start, length, color, k) {
        return new THREE.Mesh(new THREE.RingGeometry(r, r + width, 96, 1, start, length), glow(color, k));
    }
    function tickRing(r, count, len, color, k) {
        const g = new THREE.PlaneGeometry(0.025, len);
        const m = new THREE.InstancedMesh(g, glow(color, k), count);
        const mat = new THREE.Matrix4();
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2;
            const long = i % 5 === 0 ? 1.8 : 1;
            mat.makeRotationZ(a - Math.PI / 2);
            mat.scale(new THREE.Vector3(1, long, 1));
            mat.setPosition(Math.cos(a) * r, Math.sin(a) * r, 0);
            m.setMatrixAt(i, mat);
        }
        return m;
    }
    const hud = [
        { obj: tickRing(2.75, 120, 0.12, CYAN, 1.1), spin: 0.05, stage: 2 },
        { obj: arcRing(3.05, 0.05, 0.2, Math.PI * 1.3, CYAN, 1.4), spin: -0.12, stage: 2 },
        { obj: arcRing(3.05, 0.05, Math.PI * 1.55, Math.PI * 0.35, GRANA, 2.2), spin: -0.12, stage: 2 },
        { obj: arcRing(3.45, 0.14, 0.0, Math.PI * 0.5, BLAU, 1.2), spin: 0.2, stage: 3 },
        { obj: arcRing(3.45, 0.14, Math.PI, Math.PI * 0.5, BLAU, 1.2), spin: 0.2, stage: 3 },
        { obj: arcRing(3.9, 0.025, 0, Math.PI * 2, CYAN, 0.6), spin: 0, stage: 3 },
        { obj: tickRing(4.2, 36, 0.3, GOLD, 1.6), spin: -0.04, stage: 4 },
        { obj: arcRing(4.6, 0.04, 0.6, Math.PI * 0.9, GRANA, 1.6), spin: 0.08, stage: 4 },
        { obj: arcRing(4.6, 0.04, 0.6 + Math.PI, Math.PI * 0.9, CYAN, 1.1), spin: 0.08, stage: 4 },
    ];
    hud.forEach(({ obj, spin, stage }) => addPiece(obj, stage, spin));

    // Tilted orbit rings for depth
    const orbits = [];
    for (const [rx, ry, color, r] of [[1.15, 0.2, CYAN, 2.6], [1.15, -0.9, GRANA, 2.9], [0.4, 1.2, GOLD, 3.2]]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 160), glow(color, 1.8));
        ring.rotation.set(rx, ry, 0);
        addPiece(ring, 5);
        // a bright satellite riding each orbit
        const sat = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 8), glow(color, 2.2));
        ring.add(sat);
        orbits.push({ ring, sat, r, speed: 0.4 + Math.random() * 0.4, phase: Math.random() * 6 });
    }

    // --- Energy streams spiralling into the core ------------------------------
    const N = 1400;
    const seed = new Float32Array(N);
    const posArr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) seed[i] = Math.random();
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    pGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const pUniforms = { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uOn: { value: 0 } };
    const stream = new THREE.Points(
        pGeo,
        new THREE.ShaderMaterial({
            uniforms: pUniforms,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexShader: /* glsl */ `
                attribute float aSeed;
                uniform float uTime; uniform float uPixelRatio; uniform float uOn;
                varying float vA; varying float vMix;
                void main() {
                    float life = fract(aSeed * 7.31 + uTime * (0.08 + aSeed * 0.06));
                    float r = mix(7.5, 0.9, life * life);
                    float a = aSeed * 50.0 + life * 5.0;
                    vec3 p = vec3(cos(a) * r, sin(a) * r * 0.62, sin(aSeed * 31.0) * 1.6 * (1.0 - life));
                    vec4 mv = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * mv;
                    vA = smoothstep(0.0, 0.2, life) * (1.0 - smoothstep(0.85, 1.0, life)) * uOn;
                    vMix = aSeed;
                    gl_PointSize = (1.5 + 2.0 * life) * uPixelRatio * (14.0 / -mv.z);
                }`,
            fragmentShader: /* glsl */ `
                varying float vA; varying float vMix;
                void main() {
                    float d = length(gl_PointCoord - 0.5);
                    float a = smoothstep(0.5, 0.0, d) * vA;
                    vec3 c = vMix < 0.7 ? vec3(0.5, 0.85, 1.0) : (vMix < 0.88 ? vec3(1.0, 0.25, 0.5) : vec3(1.0, 0.8, 0.2));
                    gl_FragColor = vec4(c * 1.2 * a, a);
                }`,
        })
    );
    rig.add(stream);

    // --- Shockwave (click) ---------------------------------------------------------
    const shock = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 128), glow(CYAN, 2.5));
    shock.visible = false;
    rig.add(shock);
    let shockT = -1;

    // --- Post -----------------------------------------------------------------------
    const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
    const composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.35, 1.05);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const TIERS = { high: { dpr: 2, bloom: true }, balanced: { dpr: 1.5, bloom: true }, fast: { dpr: 1, bloom: false } };
    const ORDER = ['high', 'balanced', 'fast'];
    let tier = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768 ? 'balanced' : 'high';
    let width = 1;
    let height = 1;

    function applyTier() {
        const dpr = Math.min(window.devicePixelRatio || 1, TIERS[tier].dpr);
        renderer.setPixelRatio(dpr);
        composer.setPixelRatio(dpr);
        bloom.enabled = TIERS[tier].bloom;
        pUniforms.uPixelRatio.value = dpr;
        resize();
    }
    function resize() {
        width = Math.max(1, container.clientWidth);
        height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height, false);
        composer.setSize(width, height);
        const aspect = width / height;
        camera.aspect = aspect;
        camera.fov = aspect < 1 ? 58 : 38;
        // Desktop: core sits right of the headline. Portrait: above it.
        if (aspect > 1.2) camera.setViewOffset(width, height, -width * 0.19, 0, width, height);
        else if (aspect < 0.9) camera.setViewOffset(width, height, 0, height * 0.24, width, height);
        else camera.clearViewOffset();
        camera.updateProjectionMatrix();
    }

    // --- Animation -----------------------------------------------------------------
    const STAGES = 6;
    const stageLen = 2 / (STAGES + 1);
    const ASSEMBLE = 2.6; // seconds
    const pointer = new THREE.Vector2();
    const lean = new THREE.Vector2();
    let time = 0;

    function update(dt) {
        const k = reducedMotion ? 1 : clamp01(time / ASSEMBLE);
        for (const p of pieces) {
            const { home, from, stage, spin } = p.userData;
            const local = clamp01((k - (stage * stageLen) / 2) / stageLen);
            const e = easeOutBack(local);
            p.position.lerpVectors(from.pos, home.pos, e);
            p.rotation.set(
                THREE.MathUtils.lerp(from.rot.x, home.rot.x, e),
                THREE.MathUtils.lerp(from.rot.y, home.rot.y, e),
                THREE.MathUtils.lerp(from.rot.z, home.rot.z, e) + (reducedMotion ? 0 : time * spin)
            );
            p.scale.copy(home.scale).multiplyScalar(Math.max(0.001, easeOutCubic(local)));
            p.visible = local > 0;
        }
        // core breathing + shockwave
        const breathe = reducedMotion ? 0 : Math.sin(time * 2.2) * 0.5 + 0.5;
        let pulse = 0;
        if (shockT >= 0) {
            shockT += dt;
            const s = shockT / 1.1;
            if (s >= 1) {
                shockT = -1;
                shock.visible = false;
            } else {
                shock.visible = true;
                shock.scale.setScalar(1 + s * 7);
                shock.material.opacity = 1 - s;
                pulse = 1 - s;
            }
        }
        coreInner.scale.setScalar(1 + breathe * 0.05 + pulse * 0.3);
        coreShell.material.uniforms.uPulse.value = breathe * 0.4 + pulse;
        coreHalo.material.uniforms.uPulse.value = pulse;
        // satellites ride their orbits
        for (const o of orbits) {
            const a = o.phase + (reducedMotion ? 0 : time * o.speed);
            o.sat.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0);
        }
        pUniforms.uTime.value = time;
        pUniforms.uOn.value = reducedMotion ? 1 : clamp01((time - ASSEMBLE * 0.6) / 1.2);
        // lean toward the pointer
        lean.lerp(pointer, reducedMotion ? 1 : 0.05);
        rig.rotation.set(-lean.y * 0.25 + 0.12, lean.x * 0.35 - 0.25, 0);
    }

    let raf = 0;
    let running = false;
    let inView = false;
    let last = 0;
    let perfAcc = 0;
    let perfN = 0;

    function render() {
        composer.render();
    }
    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        time += dt;
        update(dt);
        render();
        if (time > ASSEMBLE + 0.5 && dt > 0) {
            perfAcc += dt;
            perfN += 1;
            if (perfAcc > 2) {
                const i = ORDER.indexOf(tier);
                if ((perfAcc / perfN) * 1000 > 24 && i < ORDER.length - 1) {
                    tier = ORDER[i + 1];
                    applyTier();
                }
                perfAcc = 0;
                perfN = 0;
            }
        }
    }
    function start() {
        if (running || reducedMotion || !inView || document.hidden) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
    }
    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }

    const onPointer = (e) => {
        const r = container.getBoundingClientRect();
        pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onClick = () => {
        if (reducedMotion) return;
        shockT = 0;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    container.addEventListener('pointerdown', onClick);

    const ro = new ResizeObserver(() => {
        resize();
        if (!running) {
            update(0);
            render();
        }
    });
    ro.observe(container);
    const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView) start();
        else stop();
    });
    io.observe(container);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    applyTier();
    update(0);
    render();
    onReady?.();

    return {
        dispose() {
            stop();
            ro.disconnect();
            io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            window.removeEventListener('pointermove', onPointer);
            container.removeEventListener('pointerdown', onClick);
            scene.traverse((o) => {
                o.geometry?.dispose();
                o.material?.dispose?.();
            });
            rt.dispose();
            composer.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        },
    };
}
