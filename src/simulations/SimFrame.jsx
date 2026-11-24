import { useId, useRef } from 'react';

// The outer frame every simulation shares: a yellow title strip, optional
// tabs, the body and an optional footer note.
export function SimFrame({ title, label, tabs, active, onTab, footer, children }) {
    return (
        <div className="panel overflow-hidden">
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border bg-[#060B19] px-5 py-4 text-[#EEF2FB]">
                <span className="absolute inset-x-0 top-0 stripe-rule !h-[3px] !rounded-none" aria-hidden="true" />
                <span className="flex items-center gap-3 font-display text-2xl font-bold uppercase tracking-tight">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F0467E] opacity-60" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F0467E]" />
                    </span>
                    {title}
                </span>
                {label && <span className="font-mono text-[10px] uppercase tracking-widest text-[#EDBB00]">{label}</span>}
            </div>
            {tabs && <SimTabs tabs={tabs} active={active} onTab={onTab} />}
            <div role={tabs ? 'tabpanel' : undefined} aria-label={tabs ? tabs.find((t) => t.id === active)?.label : undefined}>
                {children}
            </div>
            {footer && <div className="border-t border-border bg-bg-secondary px-5 py-3 text-sm leading-relaxed text-text-secondary">{footer}</div>}
        </div>
    );
}

// Arrow keys move between tabs, as screen-reader users expect.
export function SimTabs({ tabs, active, onTab }) {
    const id = useId();
    const refs = useRef({});
    const onKey = (e) => {
        const i = tabs.findIndex((t) => t.id === active);
        let next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        onTab(next.id);
        refs.current[next.id]?.focus();
    };
    return (
        <div role="tablist" aria-label="Simulation sections" className="flex gap-0 overflow-x-auto border-b border-border bg-bg-elevated" onKeyDown={onKey}>
            {tabs.map((t, i) => {
                const on = t.id === active;
                return (
                    <button
                        key={t.id}
                        ref={(el) => {
                            refs.current[t.id] = el;
                        }}
                        id={`${id}-${t.id}`}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        tabIndex={on ? 0 : -1}
                        onClick={() => onTab(t.id)}
                        className={`relative flex min-h-[52px] shrink-0 items-center gap-2 border-r border-border px-4 text-left font-semibold transition-colors ${on ? 'bg-bg-secondary text-text-primary' : 'bg-bg-elevated text-text-secondary hover:text-text-primary'}`}
                    >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full border font-mono text-xs ${on ? 'border-transparent bg-garnet text-white' : 'border-border'}`}>
                            {i + 1}
                        </span>
                        {on && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-accent-warm" aria-hidden="true" />}
                        {t.label}
                    </button>
                );
            })}
        </div>
    );
}

// A small uppercase label used above blocks inside simulations.
export function Eyebrow({ children, className = '' }) {
    return <p className={`mb-2 font-mono text-xs font-bold uppercase tracking-wider text-text-secondary ${className}`}>{children}</p>;
}

// One line of a terminal-style log.
export function LogLine({ t, tone, children }) {
    const color = tone === 'bad' ? 'text-[#FF8A9B]' : tone === 'good' ? 'text-[#8EF0A4]' : tone === 'warn' ? 'text-[#EDBB00]' : 'text-white/85';
    return (
        <li className="flex gap-3 font-mono text-[13px] leading-relaxed">
            {t !== undefined && <span className="w-14 shrink-0 text-right text-white/45">{t}</span>}
            <span className={`min-w-0 break-words ${color}`}>{children}</span>
        </li>
    );
}
