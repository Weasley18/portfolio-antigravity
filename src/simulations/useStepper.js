import { useCallback, useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

// Plays through `count` steps, one every `delay` ms, then calls onDone.
// With reduced motion on, it jumps straight to the end.
export default function useStepper(count, delay = 550) {
    const reduced = usePrefersReducedMotion();
    const [step, setStep] = useState(-1);
    const [running, setRunning] = useState(false);
    const timers = useRef([]);

    const clear = useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    }, []);

    useEffect(() => clear, [clear]);

    const run = useCallback(
        (onDone) => {
            clear();
            if (reduced) {
                setStep(count);
                setRunning(false);
                onDone?.();
                return;
            }
            setRunning(true);
            setStep(0);
            for (let i = 1; i <= count; i += 1) {
                timers.current.push(
                    setTimeout(() => {
                        setStep(i);
                        if (i === count) {
                            setRunning(false);
                            onDone?.();
                        }
                    }, delay * i),
                );
            }
        },
        [clear, count, delay, reduced],
    );

    const reset = useCallback(() => {
        clear();
        setStep(-1);
        setRunning(false);
    }, [clear]);

    return { step, running, run, reset };
}
