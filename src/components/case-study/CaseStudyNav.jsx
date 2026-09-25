import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Grid2x2 } from "lucide-react";

const CaseStudyNav = ({ prev, next }) => (
    <div className="pt-10 md:pt-14 mt-4 border-t border-border grid sm:grid-cols-3 gap-4 items-center">
        {prev ? (
            <Link
                to={`/work/${prev.slug}`}
                className="group flex items-center gap-2 text-sm text-text-secondary hover:text-accent-warm transition-colors"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span className="truncate">{prev.title}</span>
            </Link>
        ) : (
            <span />
        )}

        <Link
            to="/work"
            className="flex items-center justify-center gap-2 text-sm font-medium rounded-full border border-border px-4 py-2 hover:border-accent-warm hover:text-accent-warm transition-colors"
        >
            <Grid2x2 size={16} />
            All work
        </Link>

        {next ? (
            <Link
                to={`/work/${next.slug}`}
                className="group flex items-center justify-end gap-2 text-sm text-text-secondary hover:text-accent-warm transition-colors sm:text-right"
            >
                <span className="truncate">{next.title}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
        ) : (
            <span />
        )}
    </div>
);

export default CaseStudyNav;
