/**
 * A one-line takeaway in the "commentary box" style: a gold bar, then mono
 * caps. Used to underline the lesson from a project.
 */
const AnnotationText = ({ children, className = "" }) => (
    <span className={`inline-flex items-center gap-3 font-mono text-xs md:text-sm uppercase tracking-widest text-gold ${className}`}>
        <span className="w-6 h-[2px] bg-gold shrink-0" aria-hidden="true" />
        {children}
    </span>
);

export default AnnotationText;
