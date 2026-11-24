import { useEffect, useState } from 'react';
import { Play, Film } from 'lucide-react';
import { embedUrl } from '../../lib/embedUrl';

// A project's demo video, played on the page.
//
// To host a video on the site itself, drop the file into public/videos/ with
// the name in `video.file` (for example public/videos/hirelens.mp4). The page
// checks for it and plays it with the browser's own player. Until that file
// exists, the Google Drive or YouTube link in `video.embed` plays inline via
// the provider's embeddable player — no redirect off the site.

const base = import.meta.env.BASE_URL;
const asset = (name) => (name ? `${base}videos/${name}` : null);


export default function ProjectVideo({ video, title }) {
    const fileUrl = asset(video?.file);
    const embed = embedUrl(video?.embed);
    const [local, setLocal] = useState(fileUrl ? 'checking' : 'missing');
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        if (!fileUrl) return undefined;
        const ctrl = new AbortController();
        fetch(fileUrl, { method: 'HEAD', signal: ctrl.signal })
            .then((r) => {
                const type = r.headers.get('content-type') || '';
                setLocal(r.ok && (type.startsWith('video/') || type === 'application/octet-stream') ? 'ok' : 'missing');
            })
            .catch((e) => {
                if (e.name !== 'AbortError') setLocal('missing');
            });
        return () => ctrl.abort();
    }, [fileUrl]);

    if (!video || (!fileUrl && !embed)) return null;
    const source = local === 'ok' ? 'site' : local === 'missing' ? (embed ? 'embed' : 'none') : 'checking';
    if (source === 'none') return null;
    const label = video.title || `${title} demo`;

    return (
        <div className="panel overflow-hidden">
            <div className="relative aspect-video w-full bg-[#060B19]">
                {playing && source === 'site' && (
                    <video
                        className="absolute inset-0 h-full w-full bg-black"
                        src={fileUrl}
                        poster={asset(video.poster) || undefined}
                        controls
                        autoPlay
                        playsInline
                        preload="metadata"
                        onError={() => setLocal('missing')}
                    />
                )}
                {playing && source === 'embed' && (
                    <iframe
                        className="absolute inset-0 h-full w-full"
                        src={embed}
                        title={label}
                        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                )}
                {!playing && (
                    <button
                        type="button"
                        onClick={() => setPlaying(true)}
                        disabled={source === 'checking'}
                        aria-label={`Play ${label}`}
                        className="group halftone-accent absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center text-white"
                    >
                        <span className="relative flex h-14 w-14 md:h-16 md:w-16 items-center justify-center">
                            <span className="absolute inset-0 rounded-full bg-[#EDBB00]/30 animate-ping" aria-hidden="true" />
                            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-[#EDBB00] text-[#0A1022] shadow-[0_0_40px_rgba(237,187,0,0.45)] transition-transform duration-300 group-hover:scale-110">
                                <Play size={26} className="translate-x-0.5" fill="currentColor" aria-hidden="true" />
                            </span>
                        </span>
                        <span className="font-display text-xl md:text-2xl font-bold uppercase tracking-tight">{label}</span>
                        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/70">
                            <Film size={13} aria-hidden="true" /> {source === 'checking' ? 'Loading…' : 'Plays right here'}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
