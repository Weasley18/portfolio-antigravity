import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const Cursor = () => {
    const prefersReducedMotion = usePrefersReducedMotion();

    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const cursorX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.4 });
    const cursorY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.4 });
    const dotX = useSpring(x, { stiffness: 1200, damping: 35, mass: 0.2 });
    const dotY = useSpring(y, { stiffness: 1200, damping: 35, mass: 0.2 });

    useEffect(() => {
        // Detect touch devices and disable the custom cursor for them
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (hasTouch) {
            setIsTouchDevice(true);
            return undefined;
        }

        if (prefersReducedMotion) {
            return undefined;
        }

        const mouseMove = (e) => {
            // Use motion values instead of React state to avoid re-rendering
            x.set(e.clientX);
            y.set(e.clientY);
        };

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [prefersReducedMotion, x, y]);

    const variants = {
        default: {
            x: cursorX,
            y: cursorY,
            height: 32,
            width: 32,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            border: '1px solid var(--cursor-color)',
        },
        hover: {
            x: cursorX,
            y: cursorY,
            height: 48,
            width: 48,
            backgroundColor: 'var(--cursor-color)',
            border: 'none',
            opacity: 0.2,
        },
        click: {
            x: cursorX,
            y: cursorY,
            height: 24,
            width: 24,
            backgroundColor: 'var(--cursor-color)',
            border: 'none',
            opacity: 0.5,
        }
    };

    const dotVariants = {
        default: {
            x: dotX,
            y: dotY,
            backgroundColor: 'var(--cursor-color)',
        },
        hover: {
            x: dotX,
            y: dotY,
            backgroundColor: 'var(--cursor-color)',
        },
        click: {
            x: dotX,
            y: dotY,
            backgroundColor: 'var(--cursor-color)',
            scale: 0.5,
        }
    };

    if (isTouchDevice || prefersReducedMotion) {
        return null;
    }

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-50 mix-blend-difference"
                variants={variants}
                animate={isClicking ? 'click' : isHovering ? 'hover' : 'default'}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-50 mix-blend-difference"
                variants={dotVariants}
                animate={isClicking ? 'click' : isHovering ? 'hover' : 'default'}
                transition={{ type: 'spring', stiffness: 1300, damping: 34 }}
            />
        </>
    );
};

export default Cursor;
