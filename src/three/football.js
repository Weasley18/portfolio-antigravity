// A code-built football with blaugrana panels, for the Contact page.
// Panels come from a shader patch on MeshStandardMaterial (the threejs-scene
// skill's onBeforeCompile approach): each fragment finds its nearest of the
// 12 icosahedron vertices; close to a vertex is a coloured panel, the
// boundary between cells is a seam. Drag to spin, click to kick.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function createFootball(container, { reducedMotion = false } = {}) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
        return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0.6, 6);
    camera.lookAt(0, 0, 0);

    const key = new THREE.DirectionalLight('#ffffff', 1.4);
    key.position.set(2, 5, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.radius = 8;
    scene.add(key);

    // 12 icosahedron vertex directions
    const ico = new THREE.IcosahedronGeometry(1, 0);
    const p = ico.attributes.position;
    const dirs = [];
    for (let i = 0; i < p.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(p, i).normalize();
        if (!dirs.some((d) => d.distanceTo(v) < 1e-3)) dirs.push(v);
    }
    ico.dispose();

    const mat = new THREE.MeshPhysicalMaterial({ color: '#f4f6fb', roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.35 });
    mat.onBeforeCompile = (shader) => {
        shader.uniforms.uDirs = { value: dirs };
        shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vObjN;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjN = normalize(position);');
        shader.fragmentShader = shader.fragmentShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vObjN;\nuniform vec3 uDirs[12];')
            .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                float d1 = -1.0; float d2 = -1.0; int k = 0;
                for (int i = 0; i < 12; i++) {
                    float d = dot(normalize(vObjN), uDirs[i]);
                    if (d > d1) { d2 = d1; d1 = d; k = i; } else if (d > d2) { d2 = d; }
                }
                vec3 blau = vec3(0.004, 0.09, 0.42);
                vec3 grana = vec3(0.37, 0.0, 0.06);
                vec3 panel = (k % 2 == 0) ? blau : grana;
                float inPanel = smoothstep(0.885, 0.895, d1);
                diffuseColor.rgb = mix(diffuseColor.rgb, panel, inPanel);
                float seam = 1.0 - smoothstep(0.004, 0.012, d1 - d2);
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.05), seam * 0.85);
                float ring = smoothstep(0.87, 0.875, d1) * (1.0 - smoothstep(0.88, 0.885, d1));
                diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.73, 0.0), ring);`
            );
    };
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), mat);
    ball.castShadow = true;
    scene.add(ball);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.28 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.35;
    floor.receiveShadow = true;
    scene.add(floor);

    // Spin physics
    const spin = new THREE.Vector2(reducedMotion ? 0 : 0.35, 0.08); // rad/s around y and x
    let hop = 0; // vertical bounce velocity
    let height = 0;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let moved = 0;
    const el = renderer.domElement;
    el.addEventListener('pointerdown', (e) => {
        dragging = true;
        moved = 0;
        lx = e.clientX;
        ly = e.clientY;
        el.style.cursor = 'grabbing';
        el.setPointerCapture?.(e.pointerId);
        wake();
    });
    el.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - lx;
        const dy = e.clientY - ly;
        moved += Math.abs(dx) + Math.abs(dy);
        spin.set(dx * 0.25, dy * 0.25);
        lx = e.clientX;
        ly = e.clientY;
    });
    el.addEventListener('pointerup', () => {
        dragging = false;
        el.style.cursor = 'grab';
        if (moved < 5) {
            // kick
            hop = reducedMotion ? 0 : 4.2;
            spin.set((Math.random() - 0.5) * 14, 6 + Math.random() * 4);
        }
        wake();
    });

    const q = new THREE.Quaternion();
    const ax = new THREE.Vector3();
    let raf = 0;
    let running = false;
    let inView = false;
    let last = 0;

    function step(dt) {
        if (spin.lengthSq() > 1e-6) {
            ax.set(spin.y, spin.x, 0);
            const ang = ax.length() * dt;
            q.setFromAxisAngle(ax.normalize(), ang);
            ball.quaternion.premultiply(q);
        }
        if (!dragging) {
            const idle = reducedMotion ? 0 : 0.35;
            spin.x += (idle - spin.x) * Math.min(1, dt * 1.2);
            spin.y += (0.08 * (reducedMotion ? 0 : 1) - spin.y) * Math.min(1, dt * 1.2);
        }
        // bounce
        hop -= 12 * dt;
        height += hop * dt;
        if (height < 0) {
            height = 0;
            hop = Math.abs(hop) > 1 ? -hop * 0.45 : 0;
        }
        ball.position.y = height + (reducedMotion ? 0 : Math.sin(performance.now() / 700) * 0.05);
    }

    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        step(dt);
        renderer.render(scene, camera);
        if (reducedMotion && !dragging && spin.lengthSq() < 1e-4 && height === 0) stop();
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
    function wake() {
        start();
    }
    function resize() {
        const w = Math.max(1, container.clientWidth);
        const h = Math.max(1, container.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
    }
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView) start();
        else stop();
    });
    io.observe(container);
    resize();

    return {
        dispose() {
            stop();
            ro.disconnect();
            io.disconnect();
            scene.traverse((o) => {
                o.geometry?.dispose();
                o.material?.dispose?.();
            });
            env.dispose();
            pmrem.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            el.remove();
        },
    };
}
