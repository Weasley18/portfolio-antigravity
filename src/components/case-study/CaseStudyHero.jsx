import { Link } from "react-router-dom";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import StickerTag from "../ui/StickerTag";

const CaseStudyHero = ({ title, tagline, role, timeline, tags = [], links = {}, illustration }) => (
    <div className="pt-4 pb-12 md:pb-20">
        <Link
            to="/work"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-warm transition-colors mb-8"
        >
            <ArrowLeft size={16} />
            Back to work
        </Link>

        <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-start">
            <div>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag) => (
                        <StickerTag key={tag} tone={tag === "AI" ? "warm" : "cool"}>
                            {tag}
                        </StickerTag>
                    ))}
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold tracking-tight leading-[1.05] mb-4">
                    {title}
                </h1>
                <p className="text-lg md:text-2xl text-text-secondary font-light leading-relaxed mb-8">{tagline}</p>

                <dl className="grid grid-cols-2 gap-6 mb-8 max-w-sm">
                    <div>
                        <dt className="text-xs uppercase tracking-wider text-text-secondary/80 mb-1">Role</dt>
                        <dd className="text-sm font-medium">{role}</dd>
                    </div>
                    <div>
                        <dt className="text-xs uppercase tracking-wider text-text-secondary/80 mb-1">Timeline</dt>
                        <dd className="text-sm font-medium font-mono">{timeline}</dd>
                    </div>
                </dl>

                {(links.github || links.demo) && (
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
                                Demo
                            </a>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full">{illustration}</div>
        </div>
    </div>
);

export default CaseStudyHero;
