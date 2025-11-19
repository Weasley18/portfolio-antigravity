import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Cursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const mouseMove = (e) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY
            });
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
    }, []);

    const variants = {
        default: {
            x: mousePosition.x - 16,
            y: mousePosition.y - 16,
            height: 32,
            width: 32,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            border: '1px solid var(--cursor-color)',
        },
        hover: {
            x: mousePosition.x - 24,
            y: mousePosition.y - 24,
            height: 48,
            width: 48,
            backgroundColor: 'var(--cursor-color)',
            border: 'none',
            opacity: 0.2,
        },
        click: {
            x: mousePosition.x - 12,
            y: mousePosition.y - 12,
            height: 24,
            width: 24,
            backgroundColor: 'var(--cursor-color)',
            border: 'none',
            opacity: 0.5,
        }
    };

    const dotVariants = {
        default: {
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
            backgroundColor: 'var(--cursor-color)',
        },
        hover: {
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
            backgroundColor: 'var(--cursor-color)',
        },
        click: {
            x: mousePosition.x - 4,
            y: mousePosition.y - 4,
            backgroundColor: 'var(--cursor-color)',
            scale: 0.5,
        }
    };

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 rounded-full pointer-events-none z-50 mix-blend-difference"
                variants={variants}
                animate={isClicking ? 'click' : isHovering ? 'hover' : 'default'}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-50 mix-blend-difference"
                variants={dotVariants}
                animate={isClicking ? 'click' : isHovering ? 'hover' : 'default'}
                transition={{ type: 'spring', stiffness: 1500, damping: 28 }}
            />
        </>
    );
};

export default Cursor;
