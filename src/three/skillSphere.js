// Interactive 3D skill sphere for the Skills page.
//
// Each skill is a text sprite on a Fibonacci sphere, coloured by category.
// Drag to spin (with inertia), hover to highlight, click to select. Same
// rules as the other scenes here: DPR capped at 2, no rendering off screen,
// reduced motion means no auto-spin.

import * as THREE from 'three';

const R = 3.2;

function labelTexture(text, color, dpr) {
    const font = 600;
    const size = 44 * dpr;
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    g.font = `${font} ${size}px "Barlow Condensed", sans-serif`;
    const w = Math.ceil(g.measureText(text.toUpperCase()).width) + 40 * dpr;
    const h = Math.ceil(size * 1.6);
    c.width = w;
    c.height = h;
    g.font = `${font} ${size}px "Barlow Condensed", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    // pill
    const r = h / 2;
    g.fillStyle = 'rgba(6, 11, 25, 0.72)';
    g.strokeStyle = color;
    g.lineWidth = 2 * dpr;
    g.beginPath();
    g.roundRect(dpr, dpr, w - 2 * dpr, h - 2 * dpr, r);
    g.fill();
    g.stroke();
    g.fillStyle = '#EEF2FB';
    g.fillText(text.toUpperCase(), w / 2, h / 2 + dpr * 2);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { tex, aspect: w / h };
}

export function createSkillSphere(container, { skills, colors, onSelect, reducedMotion = false }) {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
        return null;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.style.cursor = 'grab';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    const globe = new THREE.Group();
    scene.add(globe);

    // Faint wireframe core + orbit rings for depth
    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(R * 0.92, 2),
        new THREE.MeshBasicMaterial({ color: '#1d3a7a', wireframe: true, transparent: true, opacity: 0.18 })
    );
    globe.add(core);
    for (const [rx, color] of [[Math.PI / 2, '#0B57B0'], [Math.PI / 2.6, '#A50044'], [Math.PI / 1.7, '#EDBB00']]) {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(R * 1.12, 0.008, 6, 160),
            new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.45 })
        );
        ring.rotation.x = rx;
        ring.rotation.y = rx * 0.6;
        globe.add(ring);
    }

    // Labels on a Fibonacci sphere
    const n = skills.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const sprites = skills.map((s, i) => {
        const y = 1 - (i / (n - 1)) * 2;
        const rad = Math.sqrt(1 - y * y);
        const th = golden * i;
        const { tex, aspect } = labelTexture(s.name, colors[s.category] || '#8a95ab', dpr);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        const sp = new THREE.Sprite(mat);
        const h = 0.34;
        sp.scale.set(h * aspect, h, 1);
        sp.position.set(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
        sp.userData = { skill: s, baseScale: sp.scale.clone() };
        globe.add(sp);
        return sp;
    });

    // Interaction
    let rotY = 0;
    let rotX = 0.15;
    let velY = reducedMotion ? 0 : 0.0025;
    let velX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let moved = 0;
    let hovered = null;
    let selected = null;
    let filter = null;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const el = renderer.domElement;
    const pick = (e) => {
        const r = el.getBoundingClientRect();
        ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObjects(sprites, false).filter((h) => {
            // only the front hemisphere is clickable
            const p = h.object.getWorldPosition(new THREE.Vector3());
            return p.z > -0.5;
        });
        return hits[0]?.object || null;
    };
    const onDown = (e) => {
        dragging = true;
        moved = 0;
        lastX = e.clientX;
        lastY = e.clientY;
        el.style.cursor = 'grabbing';
        el.setPointerCapture?.(e.pointerId);
    };
    const onMove = (e) => {
        if (dragging) {
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            moved += Math.abs(dx) + Math.abs(dy);
            velY = dx * 0.005;
            velX = dy * 0.005;
            lastX = e.clientX;
            lastY = e.clientY;
            wake();
        } else if (e.pointerType !== 'touch') {
            const h = pick(e);
            if (h !== hovered) {
                hovered = h;
                el.style.cursor = h ? 'pointer' : 'grab';
                wake();
            }
        }
    };
    const onUp = (e) => {
        dragging = false;
        el.style.cursor = 'grab';
        if (moved < 6) {
            const h = pick(e);
            selected = h;
            onSelect?.(h ? h.userData.skill : null);
            wake();
        }
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', () => {
        dragging = false;
        hovered = null;
    });

    // Loop
    let raf = 0;
    let running = false;
    let inView = false;
    let width = 1;
    let height = 1;
    const tmp = new THREE.Vector3();

    function render() {
        globe.rotation.y = rotY;
        globe.rotation.x = rotX;
        globe.updateMatrixWorld();
        for (const sp of sprites) {
            sp.getWorldPosition(tmp);
            const depth = (tmp.z + R) / (2 * R); // 0 back → 1 front
            const s = sp.userData.skill;
            const dim = filter && s.category !== filter;
            const active = sp === hovered || sp === selected;
            const k = active ? 1.35 : 1;
            sp.scale.copy(sp.userData.baseScale).multiplyScalar(k * (0.7 + depth * 0.45));
            sp.material.opacity = dim ? 0.08 : Math.max(0.15, depth) * (active ? 1 : 0.92);
            sp.renderOrder = Math.round(depth * 100);
        }
        renderer.render(scene, camera);
    }

    function frame() {
        raf = requestAnimationFrame(frame);
        if (!dragging) {
            velY += ((reducedMotion ? 0 : 0.0025) - velY) * 0.03;
            velX *= 0.94;
        }
        rotY += velY;
        rotX = Math.max(-0.9, Math.min(0.9, rotX + velX));
        render();
        // Sleep when nothing is moving (reduced motion, no drag)
        if (reducedMotion && !dragging && Math.abs(velY) < 1e-4 && Math.abs(velX) < 1e-4) stop();
    }
    function start() {
        if (running || !inView || document.hidden) return;
        running = true;
        raf = requestAnimationFrame(frame);
    }
    function stop() {
        running = false;
        cancelAnimationFrame(raf);
    }
    function wake() {
        if (!running) start();
        if (!running) render();
    }

    function resize() {
        width = Math.max(1, container.clientWidth);
        height = Math.max(1, container.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = width < 640 ? 12.5 : 10.5;
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
        setFilter(cat) {
            filter = cat;
            wake();
        },
        select(name) {
            selected = sprites.find((s) => s.userData.skill.name === name) || null;
            wake();
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
            el.remove();
        },
    };
}
