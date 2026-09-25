import { Link } from 'react-router-dom';
import PillLink from '../components/ui/PillLink';

const NotFound = () => (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-20">
        <p className="font-handwritten text-3xl text-accent-warm mb-2 -rotate-2">torn out of the notebook</p>
        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-6">404</h1>
        <p className="text-text-secondary max-w-md mb-8">
            This page doesn't exist — or it got ripped out. Let's get you back to somewhere real.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
            <PillLink to="/">Back home</PillLink>
            <Link to="/work" className="inline-flex items-center px-5 py-2.5 text-sm md:text-base font-medium text-text-secondary hover:text-accent-warm transition-colors">
                See the work
            </Link>
        </div>
    </div>
);

export default NotFound;
