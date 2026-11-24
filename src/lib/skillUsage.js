import { skills, projects, caseStudies, experience } from '../data';

// Category colours, shared by the 3D sphere and the chips
export const CATEGORY_COLORS = {
    'Languages & CS': '#EDBB00',
    'Backend & APIs': '#F0467E',
    'AI/ML & LLM Engineering': '#5E9EFF',
    'Databases & Messaging': '#3FBF86',
    'Cloud & DevOps': '#FF8A3D',
    'Core CS': '#A9B4D0',
};

// Extra search terms for skills whose name isn't how they're written elsewhere
const ALIASES = {
    'TypeScript/JavaScript': ['TypeScript', 'JavaScript', 'React'],
    'OpenAI/Gemini APIs': ['OpenAI', 'Gemini'],
    'RESTful APIs': ['REST'],
    'LLM Evals': ['eval'],
    Microservices: ['microservice'],
    'Data Structures & Algorithms': ['graph algorithms', 'union-find'],
    Multithreading: ['thread-safe'],
    GCP: ['Google Cloud'],
    PostgreSQL: ['Postgres'],
    'Computer Networks': ['TLS', 'WebSockets'],
};

// Mentions that read like usage but aren't (e.g. "in place of a custom RAG pipeline")
const EXCLUDE = { RAG: ['DHENU'] };

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function terms(name) {
    const base = name.split('/').map((t) => t.trim());
    return [...new Set([...base, ...(ALIASES[name] ?? [])])].filter((t) => t.length > 1);
}
function mentions(text, name) {
    return terms(name).some((t) => new RegExp(`(^|[^a-z0-9+#])${escape(t.toLowerCase())}($|[^a-z0-9+#])`).test(text));
}

// Searchable text for every project and role
const sources = [
    ...projects
        .filter((p) => p.slug && caseStudies[p.slug])
        .map((p) => {
            const cs = caseStudies[p.slug];
            const text = [p.title, ...(cs.stack || []), ...(p.tags || []), ...(p.description || []), ...(cs.architecture?.bullets || [])]
                .join(' \n ')
                .toLowerCase();
            return { kind: 'project', title: p.title, to: `/work/${p.slug}`, text };
        }),
    ...experience.map((e) => ({
        kind: 'role',
        title: `${e.role}, ${e.company.split(' (')[0].split(' —')[0]}`,
        to: '/experience',
        text: [e.role, e.company, ...e.description].join(' \n ').toLowerCase(),
    })),
];

export const allSkills = Object.entries(skills).flatMap(([category, names]) =>
    names.map((name) => ({ name, category, usedIn: sources.filter((s) => mentions(s.text, name) && !(EXCLUDE[name] || []).includes(s.title)) }))
);
