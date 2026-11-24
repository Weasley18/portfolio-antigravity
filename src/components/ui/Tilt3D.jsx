import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

/**
 * Wraps content in a card that tilts toward the pointer in 3D, with a soft
 * glare that follows it. Flat on touch screens and with reduced motion.
 */
const Tilt3D = ({ children, className = '', max = 8, glare = true, as = 'div', ...rest }) => {
    const ref = useRef(null);
    const reduced = usePrefersReducedMotion();
    const px = useMotionValue(0.5);
    const py = useMotionValue(0.5);
    const spring = { stiffness: 180, damping: 18, mass: 0.6 };
    const rx = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
    const ry = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
    const gx = useTransform(px, (v) => `${v * 100}%`);
    const gy = useTransform(py, (v) => `${v * 100}%`);
    const glareBg = useMotionTemplate`radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.14), transparent 55%)`;
    const Comp = motion[as] || motion.div;

    const onMove = (e) => {
        if (reduced || e.pointerType === 'touch') return;
        const r = ref.current.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
    };
    const onLeave = () => {
        px.set(0.5);
        py.set(0.5);
    };

    return (
        <div style={{ perspective: 1000 }} className="h-full">
            <Comp
                ref={ref}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                style={reduced ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
                className={`relative h-full ${className}`}
                {...rest}
            >
                {children}
                {glare && !reduced && (
                    <motion.span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ background: glareBg }}
                    />
                )}
            </Comp>
        </div>
    );
};

export default Tilt3D;
