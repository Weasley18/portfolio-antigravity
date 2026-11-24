// Scroll-driven 3D flythrough for the Experience page.
//
// A glowing path winds into the distance; every career milestone is a ring
// gate on it. Scroll moves the camera along the path with a hold at each gate
// (the scroll-film skill's "hold at every beat that carries text"). Built in
// code, DPR capped at 2, no rendering off screen, reduced motion jumps
// straight between gates instead of easing.

import * as THREE from 'three';

const KIND_COLOR = {
    education: '#5E9EFF',
    work: '#F0467E',
    project: '#EDBB00',
    award: '#EDBB00',
    next: '#3FBF86',
};
const SPACING = 9;

function glowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.25, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

function yearTexture(text, color) {
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 160;
    const g = c.getContext('2d');
    g.font = '800 120px "Barlow Condensed", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = color;
    g.fillText(text.toUpperCase(), 512, 86);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}

export function createCareerPath(container, { milestones, reducedMotion = false }) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
        return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050913');
    scene.fog = new THREE.Fog('#050913', 12, 46);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);

    // Path through all gates, with a lead-in and a tail
    const M = milestones.length;
    const pts = [];
    for (let i = -1; i <= M + 1; i++) {
        pts.push(new THREE.Vector3(Math.sin(i * 0.9) * 3.2, Math.cos(i * 0.7) * 1.1, -i * SPACING));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const total = M + 2; // segments from point -1 to M+1
    const uOf = (i) => (i + 1) / total; // gate i sits on control point i

    const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 600, 0.035, 8, false),
        new THREE.MeshBasicMaterial({ color: new THREE.Color('#5E9EFF').multiplyScalar(1.4) })
    );
    scene.add(tube);

    // Data packets flowing along the path
    const packetCount = 140;
    const packetPos = new Float32Array(packetCount * 3);
    const packetPhase = new Float32Array(packetCount);
    for (let i = 0; i < packetCount; i++) packetPhase[i] = Math.random();
    const packetGeo = new THREE.BufferGeometry();
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3));
    const glow = glowTexture();
    const packets = new THREE.Points(
        packetGeo,
        new THREE.PointsMaterial({ map: glow, size: 0.35, color: '#EDBB00', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    scene.add(packets);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const sp = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
        sp[i * 3] = (Math.random() - 0.5) * 120;
        sp[i * 3 + 1] = (Math.random() - 0.5) * 70;
        sp[i * 3 + 2] = 10 - Math.random() * (M + 4) * SPACING;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#8fa4e0', size: 0.06, transparent: true, opacity: 0.8 })));

    // Gates
    const gates = milestones.map((m, i) => {
        const color = KIND_COLOR[m.kind] || '#8a95ab';
        const g = new THREE.Group();
        const pos = curve.getPointAt(uOf(i));
        const tan = curve.getTangentAt(uOf(i));
        g.position.copy(pos);
        g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan.clone().negate());

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(1.7, 0.045, 12, 96),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.6) })
        );
        g.add(ring);
        const ticks = new THREE.Mesh(
            new THREE.TorusGeometry(2.0, 0.012, 6, 96, Math.PI * 1.4),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 })
        );
        g.add(ticks);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
        halo.scale.set(6, 6, 1);
        g.add(halo);
        const label = new THREE.Mesh(
            new THREE.PlaneGeometry(3.6, 0.56),
            new THREE.MeshBasicMaterial({ map: yearTexture(m.label, color), transparent: true, depthWrite: false })
        );
        label.position.set(0, 2.25, 0);
        g.add(label);
        scene.add(g);
        return { g, ring, ticks, halo };
    });

    // Camera rig: sits a little before the current point, looks ahead
    let target = 0; // in "gate units": 0 = at gate 0, M-1 = last gate
    let current = reducedMotion ? 0 : -0.6;
    let time = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    let inView = false;
    const look = new THREE.Vector3();
    const camOffsetU = 0.55 / total; // how far behind the gate the camera sits

    function place(gateUnits) {
        const u = THREE.MathUtils.clamp(uOf(gateUnits) - camOffsetU, 0.001, 0.995);
        const p = curve.getPointAt(u);
        camera.position.copy(p);
        camera.position.y += 1.1;
        look.copy(curve.getPointAt(Math.min(u + 0.02, 1)));
        look.y += 0.6;
        camera.lookAt(look);
    }

    function render() {
        place(current);
        // Packets drift forward along the path
        for (let i = 0; i < packetCount; i++) {
            const u = (packetPhase[i] + (reducedMotion ? 0 : time * 0.01)) % 1;
            const p = curve.getPointAt(u);
            packetPos[i * 3] = p.x;
            packetPos[i * 3 + 1] = p.y;
            packetPos[i * 3 + 2] = p.z;
        }
        packetGeo.attributes.position.needsUpdate = true;
        gates.forEach(({ ring, ticks, halo }, i) => {
            const near = Math.max(0, 1 - Math.abs(i - current));
            ticks.rotation.z = (reducedMotion ? 0 : time * 0.4) + i;
            ring.scale.setScalar(1 + near * 0.08);
            halo.material.opacity = 0.2 + near * 0.4;
        });
        renderer.render(scene, camera);
    }

    function frame(now) {
        raf = requestAnimationFrame(frame);
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
        last = now;
        time += dt;
        current = reducedMotion ? target : current + (target - current) * 0.08;
        render();
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
        const w = Math.max(1, container.clientWidth);
        const h = Math.max(1, container.clientHeight);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w / h < 1 ? 70 : 55;
        camera.updateProjectionMatrix();
        render();
    }
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

    return {
        setPosition(gateUnits) {
            target = gateUnits;
            if (!running) {
                current = target;
                render();
            }
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
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        },
    };
}
