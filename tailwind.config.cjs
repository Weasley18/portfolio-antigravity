/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: ['class', '[data-theme="dark"]'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Barlow', 'system-ui', 'sans-serif'],
                display: ['"Barlow Condensed"', 'Barlow', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            colors: {
                bg: {
                    primary: 'var(--bg-primary)',
                    secondary: 'var(--bg-secondary)',
                    elevated: 'var(--bg-elevated)',
                },
                text: {
                    primary: 'var(--text-primary)',
                    secondary: 'var(--text-secondary)',
                },
                ink: {
                    DEFAULT: 'var(--text-primary)',
                    muted: 'var(--text-secondary)',
                },
                accent: {
                    DEFAULT: 'var(--accent-warm)',
                    warm: 'var(--accent-warm)',
                    warmSoft: 'var(--accent-warm-soft)',
                    cool: 'var(--accent-cool)',
                    coolSoft: 'var(--accent-cool-soft)',
                },
                sage: 'var(--sage)',
                gold: 'var(--gold)',
                garnet: 'var(--fill-garnet)',
                blau: 'var(--fill-blue)',
                border: 'var(--border)',
            },
            boxShadow: {
                paper: '0 1px 2px rgba(28,26,22,.04), 0 8px 24px var(--shadow-color)',
            },
        },
    },
    plugins: [require('@tailwindcss/container-queries')],
}
