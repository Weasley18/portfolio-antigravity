// Milestones for the Experience page flythrough, in order. Work only:
// trophies live on /achievements, projects on /work, education on /about. `kind` sets the
// gate colour. Dates come straight from the résumé; anything the résumé
// doesn't date is labelled without one.
export const milestones = [
    {
        label: "May 2024",
        kind: "work",
        title: "Summer Research Intern",
        org: "IIT Roorkee · Remote",
        points: [
            "Implemented Python graph algorithms to segment real-world urban maps into 120+ neighbourhood clusters.",
            "Graph-based clustering beat K-means and DBSCAN baselines by 25–30% on neighbourhood delineation.",
        ],
    },
    {
        label: "Freelance",
        kind: "work",
        title: "Web development freelancing",
        org: "evolvexcse.in · enngee.in",
        points: [
            "Designed, built and shipped 2 responsive client websites end-to-end.",
            "Sole developer and client contact, with post-launch support for both live sites.",
        ],
    },
    {
        label: "Sep 2025",
        kind: "work",
        title: "Software Engineering Intern",
        org: "Firedesk (Leistung Technologies) · until Jun 2026",
        points: [
            "10+ RESTful APIs in Node.js and Express with JWT auth and RBAC.",
            "React interfaces for 5+ modules in Agile/Scrum sprints.",
            "A shared component library that cut feature build time by 50%.",
            "PostgreSQL schemas for 10+ modules; indexing and ORM migrations cut latency by 40%.",
        ],
    },
    {
        label: "Next",
        kind: "next",
        title: "The next team",
        org: "Open to internships",
        points: ["Looking for a team that ships backend and AI systems people rely on."],
        link: "/contact",
    },
];
