// Achievements and extracurriculars, split the way the site splits them:
// trophies + ratings + certifications on /achievements, leadership and
// community work on /extracurricular. Every fact is from the résumé.

// The 3D turntable on /achievements. `shape` picks the procedural trophy.
export const trophies = [
    {
        id: "codeflix",
        shape: "cup",
        plaque: "Codeflix 6.0",
        rank: "1st",
        title: "Codeflix 6.0",
        org: "Google Developers Club, RNSIT",
        stat: "200+",
        statLabel: "participants",
        body: "First place in the Google Developers Club's competitive-coding contest, ahead of 200+ participants.",
    },
    {
        id: "schema",
        shape: "db",
        plaque: "Schema Showdown",
        rank: "1st",
        title: "Schema Showdown",
        org: "Dept. of CSE-CY, RNSIT",
        stat: "70+",
        statLabel: "participants",
        body: "First place in the department's SQL competition, ahead of 70+ participants.",
    },
    {
        id: "codechef",
        shape: "star",
        plaque: "CodeChef",
        rank: "4★",
        title: "CodeChef 4-Star",
        org: "CodeChef",
        stat: "1841",
        statLabel: "peak rating",
        body: "Reached 4 stars on CodeChef, with a peak rating of 1841.",
    },
    {
        id: "leetcode",
        shape: "medal",
        plaque: "LeetCode",
        rank: "1768",
        title: "LeetCode contests",
        org: "LeetCode",
        stat: "704",
        statLabel: "best rank",
        body: "220+ problems solved, a contest rating of 1768 and a best contest rank of 704.",
    },
    {
        id: "hackathons",
        shape: "stack",
        plaque: "Hackathons",
        rank: "10+",
        title: "10+ hackathons",
        org: "incl. Google Solution Challenge 2025",
        stat: "10+",
        statLabel: "hackathons",
        body: "More than ten hackathons, including Google Solution Challenge 2025 with DHENU, a multilingual AI app on Google Cloud.",
        link: "/work/dhenu",
    },
];

export const ratings = [
    {
        site: "LeetCode",
        rating: 1768,
        lines: [
            { k: "Contest rating", v: "1768" },
            { k: "Best rank", v: "704" },
            { k: "Problems solved", v: "220+" },
        ],
    },
    {
        site: "CodeChef",
        rating: 1841,
        stars: 4,
        lines: [
            { k: "Peak rating", v: "1841" },
            { k: "Stars", v: "4★" },
        ],
    },
];

export const certifications = [
    {
        name: "Machine Learning Specialization",
        issuer: "DeepLearning.AI",
        detail: "A multi-course machine learning specialization from DeepLearning.AI.",
    },
    {
        name: "Google Cybersecurity Specialization",
        issuer: "Google",
        detail: "Network security, plus risk, asset, threat and vulnerability management.",
    },
    {
        name: "Introduction to Back-End Development",
        issuer: "Meta",
        detail: "Built 5 full-stack web apps along the way.",
    },
];

// /extracurricular
export const maverick = {
    event: "Maverick 2025",
    host: "RNS MBA's flagship startup event",
    steps: [
        { label: "Round 1", note: "Elimination" },
        { label: "Round 2", note: "Elimination" },
        { label: "Round 3", note: "Elimination" },
        { label: "Top 8", note: "Finalist" },
        { label: "The pitch", note: "6 investors" },
    ],
    body: "Took a startup idea through three elimination rounds to finish in the Top 8, then pitched it live to six angel investors.",
};

export const workshops = {
    count: 200,
    topics: ["GitHub", "Competitive coding"],
    body: "Invited speaker for GitHub and competitive-coding workshops, mentoring 200+ batchmates and juniors.",
};

export const munsoc = {
    org: "RNSIT MUNSoc",
    body: "Held multiple key organising roles across RNSIT MUNSoc (Model United Nations Society) events.",
};
