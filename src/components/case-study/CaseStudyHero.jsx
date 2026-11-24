import { Link } from "react-router-dom";
import { ArrowLeft, Github, ExternalLink, PlayCircle } from "lucide-react";
import StickerTag from "../ui/StickerTag";

const CaseStudyHero = ({ title, codename, tagline, role, timeline, tags = [], links = {}, illustration }) => (
    <div className="pt-2 pb-8 md:pb-10">
        <Link
            to="/work"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-warm transition-colors mb-6"
        >
            <ArrowLeft size={16} />
            Back to work
        </Link>

        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 items-center">
            <div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, i) => (
                        <StickerTag key={tag} tone={i === 0 ? "warm" : "cool"}>
                            {tag}
                        </StickerTag>
                    ))}
                </div>
                {codename && <p className="font-mono text-xs uppercase tracking-widest text-gold mb-3">Operation · {codename}</p>}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold uppercase tracking-tight leading-[0.9] mb-4">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-text-secondary font-light leading-relaxed mb-6 max-w-xl">{tagline}</p>

                <dl className="grid grid-cols-2 gap-6 mb-6 max-w-sm">
                    <div>
                        <dt className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-1">Role</dt>
                        <dd className="text-sm font-medium">{role}</dd>
                    </div>
                    <div>
                        <dt className="font-mono text-[11px] uppercase tracking-widest text-text-secondary mb-1">Timeline</dt>
                        <dd className="text-sm font-medium font-mono">{timeline}</dd>
                    </div>
                </dl>

                {(links.github || links.demo || links.video) && (
                    <div className="flex flex-wrap gap-3">
                        {links.github && (
                            <a
                                href={links.github}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-bg-elevated text-sm font-medium hover:border-accent-warm hover:text-accent-warm transition-colors"
                            >
                                <Github size={16} />
                                Source
                            </a>
                        )}
                        {links.demo && (
                            <a
                                href={links.demo}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-bg-elevated text-sm font-medium hover:border-accent-warm hover:text-accent-warm transition-colors"
                            >
                                <ExternalLink size={16} />
                                Live demo
                            </a>
                        )}
                        {links.video && (
                            <button
                                type="button"
                                onClick={() => document.getElementById('watch')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-transparent bg-garnet text-white text-sm font-medium hover:brightness-110 transition"
                            >
                                <PlayCircle size={16} />
                                Watch the video
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full max-w-xl lg:ml-auto">{illustration}</div>
        </div>
    </div>
);

export default CaseStudyHero;
