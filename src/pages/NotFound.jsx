import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import PillLink from '../components/ui/PillLink';
import SnapText from '../components/ui/SnapText';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion';

const NotFound = () => {
    const reducedMotion = usePrefersReducedMotion();
    const snapRef = useRef(null);
    const [snapped, setSnapped] = useState(false);
    const [busy, setBusy] = useState(true);
    const resnapTimer = useRef(0);
    useEffect(() => () => clearTimeout(resnapTimer.current), []);

    // Give the visitor a beat to read "404", then snap
    useEffect(() => {
        const id = setTimeout(() => snapRef.current?.snap(), reducedMotion ? 0 : 1100);
        return () => clearTimeout(id);
    }, [reducedMotion]);

    const onDone = useCallback((dir) => {
        setSnapped(dir > 0);
        setBusy(false);
    }, []);

    const undo = () => {
        setBusy(true);
        setSnapped(false);
        snapRef.current?.restore();
        // ...and it goes again, because the page still doesn't exist
        clearTimeout(resnapTimer.current);
        resnapTimer.current = setTimeout(() => {
            setBusy(true);
            snapRef.current?.snap();
        }, reducedMotion ? 1500 : 4200);
    };

    return (
        <div className="min-h-[65vh] flex flex-col items-center justify-center text-center py-12">
            <h1 className="sr-only">404 — page not found</h1>
            <p className="font-mono text-xs uppercase tracking-widest text-text-secondary mb-2">Error 404</p>
            {/* The message fades in where the number used to be */}
            <div className="relative w-full max-w-3xl mb-8">
                <SnapText ref={snapRef} text="404" reducedMotion={reducedMotion} onDone={onDone} />
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center px-4 transition-opacity duration-700 ${snapped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <p className="font-display text-5xl md:text-7xl font-extrabold uppercase tracking-tight mb-3">Gone in a snap.</p>
                    <p className="text-text-secondary max-w-md">
                        This page didn&apos;t make it. Everything else on the site is fine, I promise.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center items-center">
                <PillLink to="/">Back home</PillLink>
                <Link to="/work" className="inline-flex items-center px-5 py-2.5 font-medium text-text-secondary hover:text-accent-warm transition-colors">
                    See the work
                </Link>
                <button
                    type="button"
                    onClick={undo}
                    disabled={busy || !snapped}
                    className="inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-gold disabled:opacity-30 hover:underline"
                >
                    <RotateCcw size={14} /> Undo the snap
                </button>
            </div>
        </div>
    );
};

export default NotFound;
