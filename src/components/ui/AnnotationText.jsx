import { PenLine } from "lucide-react";

/**
 * A short handwritten-style callout, used to editorialize a claim inline —
 * the "margin note" of the notebook aesthetic.
 */
const AnnotationText = ({ children, className = "" }) => (
    <span className={`inline-flex items-center gap-1.5 font-handwritten text-xl md:text-2xl text-accent-warm ${className}`}>
        <PenLine size={16} className="shrink-0 -rotate-12 opacity-70" aria-hidden="true" />
        {children}
    </span>
);

export default AnnotationText;
