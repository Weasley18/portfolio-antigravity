import { FileDown } from "lucide-react";
import { personalInfo } from "../../data";

const VARIANT_CLASSES = {
    outline: "border-border text-ink hover:border-accent-warm hover:text-accent-warm",
    solid: "border-transparent bg-garnet text-white hover:brightness-110",
};

const ResumeButton = ({ variant = "outline", className = "" }) => (
    <a
        href={personalInfo.resumeUrl}
        download
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm md:text-base font-medium transition-colors duration-300 ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.outline} ${className}`}
    >
        <FileDown size={18} />
        Résumé
    </a>
);

export default ResumeButton;
