// Milestones for the Experience page flythrough, in order (work, wins and
// projects; education lives on the About page). `kind` sets the
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
        label: "2025",
        kind: "award",
        title: "Hackathons & pitches",
        org: "Google Solution Challenge · Maverick",
        points: [
            "Google Solution Challenge 2025 with DHENU, a multilingual AI app on Google Cloud.",
            "Top 8 at Maverick 2025: pitched to 6 angel investors after clearing 3 elimination rounds.",
            "10+ hackathons in total.",
        ],
        link: "/work/dhenu",
    },
    {
        label: "1st × 2",
        kind: "award",
        title: "Two first places",
        org: "RNSIT",
        points: [
            "1st at Codeflix 6.0 (Google Developers Club, 200+ participants).",
            "1st at Schema Showdown, an SQL competition (70+ participants).",
            "LeetCode contest rating 1768 · CodeChef 4★, peak 1841.",
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
        label: "Aug 2026",
        kind: "project",
        title: "The Docket",
        org: "AI courtroom mystery",
        points: ["Two LLM counsel agents in LangGraph argue before human jurors, over Redis-scaled WebSockets."],
        link: "/work/the-docket",
    },
    {
        label: "Sep 2026",
        kind: "project",
        title: "SecPipe",
        org: "DevSecOps security gate",
        points: ["18 scanners, union-find dedupe, a PR blocked in 1 min 52 s, and a DAST that fails closed."],
        link: "/work/secpipe",
    },
    {
        label: "Nov 2026",
        kind: "project",
        title: "HireLens",
        org: "LLM candidate assessment · Sep – Nov",
        points: ["Evidence-cited résumé assessment, 21/24 eval cases over 120 runs, 117 tests in CI."],
        link: "/work/hirelens",
    },
    {
        label: "Nov 2026",
        kind: "project",
        title: "Para Football",
        org: "Kolkata street football in three.js",
        points: ["Concept to production in 5 hours: 120 Hz physics, role-based CPU AI, zero asset files."],
        link: "/work/para-football",
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
