import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { embedUrl } from '../../lib/embedUrl';

/** Plays a Drive/YouTube video in an overlay on the page instead of leaving the site. */
const VideoModal = ({ link, title, onClose }) => {
    const src = embedUrl(link);
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);
    if (!src) return null;
    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050913]/85 backdrop-blur-sm p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            <motion.div
                initial={{ scale: 0.9, rotateX: 18, opacity: 0 }}
                animate={{ scale: 1, rotateX: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                style={{ transformPerspective: 1200 }}
                className="relative w-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-3 text-[#EEF2FB]">
                    <p className="font-display text-2xl font-bold uppercase tracking-tight">{title}</p>
                    <button type="button" onClick={onClose} aria-label="Close video" className="p-2 rounded-full hover:bg-white/10" autoFocus>
                        <X size={22} />
                    </button>
                </div>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
                    <iframe
                        className="absolute inset-0 h-full w-full"
                        src={src}
                        title={title}
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                </div>
            </motion.div>
        </motion.div>,
        document.body
    );
};

export default VideoModal;
