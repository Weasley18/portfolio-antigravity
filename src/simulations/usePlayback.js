import { useCallback, useEffect, useRef, useState } from 'react';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

// Plays a list of timed events: [{ at: ms, ...payload }].
// onEvent runs for each one at its time; onDone runs after the last.
// With reduced motion on, every event fires at once.
export default function usePlayback() {
    const reduced = usePrefersReducedMotion();
    const timers = useRef([]);
    const [playing, setPlaying] = useState(false);

    const clear = useCallback(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    }, []);

    useEffect(() => {
        const t = timers;
        return () => t.current.forEach(clearTimeout);
    }, []);

    const stop = useCallback(() => {
        clear();
        setPlaying(false);
    }, [clear]);

    const play = useCallback(
        (events, onEvent, onDone) => {
            clear();
            if (reduced) {
                events.forEach((e) => onEvent(e));
                setPlaying(false);
                onDone?.();
                return;
            }
            setPlaying(true);
            let end = 0;
            events.forEach((e) => {
                end = Math.max(end, e.at);
                timers.current.push(setTimeout(() => onEvent(e), e.at));
            });
            timers.current.push(
                setTimeout(() => {
                    setPlaying(false);
                    onDone?.();
                }, end + 10),
            );
        },
        [clear, reduced],
    );

    return { play, stop, playing, reduced };
}
