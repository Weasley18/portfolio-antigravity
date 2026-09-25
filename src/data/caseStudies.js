// Rich case-study content for the 4 flagship projects, rendered at /work/:slug.
// Every stat in `results` traces back to a fact already stated in projects.js /
// the resume — nothing here is invented.

export const caseStudies = {
    "the-docket": {
        slug: "the-docket",
        title: "The Docket",
        tagline: "A real-time multiplayer courtroom, argued entirely by AI.",
        role: "Solo Full-Stack & AI Engineer",
        timeline: "August 2026",
        stack: ["FastAPI", "WebSockets", "LangGraph", "Redis", "SQLite", "Railway"],
        tags: ["AI", "Full-Stack"],
        links: { github: "", demo: null },

        hero: {
            type: "architecture",
            rows: [
                { nodes: [{ label: "Players", sublabel: "WebSocket clients" }] },
                { nodes: [{ label: "FastAPI", sublabel: "WS gateway + lobby manager" }] },
                {
                    nodes: [
                        { label: "Debate Node", tone: "warm" },
                        { label: "Q&A Node", tone: "warm" },
                        { label: "Vote Node", tone: "warm" },
                    ],
                    fanLabel: "LangGraph debate graph",
                },
                { nodes: [{ label: "Redis", sublabel: "pub/sub fan-out · TTL state" }] },
            ],
        },

        problem: "A courtroom mystery game only works if the argument feels alive — prosecution and defense need to reason independently, in real time, across many concurrent lobbies, without the whole thing collapsing the moment two players reconnect at different times. That ruled out a simple request/response chatbot: it needed a real game engine underneath the AI.",

        approach: [
            {
                heading: "A multi-phase debate loop",
                body: "Built a dual-agent courtroom in LangGraph: dedicated debate, Q&A, and voting nodes route prosecution and defense arguments through independently-tuned LLM calls, so each side reasons from its own prompt rather than a shared context window.",
            },
            {
                heading: "State that survives reconnects",
                body: "A Redis-backed state layer handles TTL expiry and per-player rate limiting, with pub/sub WebSocket fan-out so game state stays consistent across backend workers — and SQLite checkpointing means a dropped connection doesn't lose the case.",
            },
            {
                heading: "Guarding the verdict",
                body: "LLM endpoints are hardened against prompt injection with a serialization layer that masks sensitive game state before it ever reaches the verdict call, then load-tested to confirm the whole loop holds up under concurrent lobbies.",
            },
        ],

        architecture: {
            bullets: [
                "FastAPI terminates WebSocket connections and owns lobby lifecycle across concurrent games.",
                "LangGraph fans a single case out into debate, Q&A, and voting phases, each an independently-tuned LLM call.",
                "Redis pub/sub fans verdicts and state updates back out to every connected player in a lobby.",
            ],
        },

        codeSnippet: {
            filename: "debate_graph.py",
            language: "python",
            lines: [
                { text: "graph = StateGraph(CaseState)", tone: "plain" },
                { text: "graph.add_node(\"debate\", run_debate_turn)", tone: "fn" },
                { text: "graph.add_node(\"qa\", run_cross_examination)", tone: "fn" },
                { text: "graph.add_node(\"vote\", tally_verdict)", tone: "fn" },
                { text: "", tone: "plain" },
                { text: "# each phase reads masked state only —", tone: "comment" },
                { text: "# raw game state never reaches the verdict call", tone: "comment" },
                { text: "graph.add_edge(\"debate\", \"qa\")", tone: "plain" },
                { text: "graph.add_edge(\"qa\", \"vote\")", tone: "plain" },
            ],
        },

        results: [
            { value: "Multi-phase", label: "debate → cross-examination → verdict loop, per case" },
            { value: "Horizontal", label: "scaling across backend workers via Redis pub/sub" },
            { value: "Hardened", label: "verdict endpoint against prompt-injection before every call" },
        ],

        annotation: { text: "hardened before every verdict — not just at the door" },
    },

    finsaathi: {
        slug: "finsaathi",
        title: "FinSaathi",
        tagline: "One backend, three specialized AI systems, one login.",
        role: "Solo Backend & AI Engineer",
        timeline: "February 2026",
        stack: ["Node.js", "TypeScript", "Fastify", "Prisma", "PostgreSQL", "BullMQ", "Redis", "Python", "FastAPI", "ChromaDB"],
        tags: ["AI", "FinTech"],
        links: { github: "https://github.com/Weasley18/Finsaathi", demo: null },

        hero: {
            type: "architecture",
            rows: [
                { nodes: [{ label: "Client" }] },
                { nodes: [{ label: "Fastify API", sublabel: "Node.js / TypeScript" }] },
                {
                    nodes: [
                        { label: "Prisma + Postgres", sublabel: "27-model schema", tone: "cool" },
                        { label: "BullMQ + Redis", sublabel: "background jobs", tone: "cool" },
                        { label: "ChromaDB", sublabel: "per-advisor RAG", tone: "cool" },
                    ],
                    fanLabel: "workload split by concern",
                },
                { nodes: [{ label: "Python / FastAPI", sublabel: "Isolation Forest · Prophet" }] },
            ],
        },

        problem: "A financial-empowerment platform needs auth, budgets, goals, advisor matching, and chat under one login — but also a chat experience that actually knows the user's numbers, an advisor voice that sounds like the real advisor, and anomaly/forecasting math that has no business running inside an LLM call.",

        approach: [
            {
                heading: "A schema built for scale",
                body: "A 27-model Prisma/PostgreSQL schema spans auth, budgets, goals, advisor workflows, and partner matching, with BullMQ + Redis handling background jobs like matching and notifications outside the request path.",
            },
            {
                heading: "An advisor that sounds like the advisor",
                body: "A RAG-based \"Advisor Clone\" indexes each advisor's own notes into per-advisor ChromaDB collections for style-matched few-shot retrieval, and an MCP tool-calling layer grounds every chat response in the user's live transaction, budget, and goal data.",
            },
            {
                heading: "LLMs for language, math for math",
                body: "Isolation Forest anomaly detection and Prophet cash-flow forecasting run in a dedicated Python/FastAPI microservice with automatic fallback to legacy heuristics — LLM calls stay reserved for language tasks only.",
            },
            {
                heading: "Speaking the user's language",
                body: "A multi-bank Indian SMS transaction parser (regex templates per bank, with LLM fallback) feeds a Redis-cached, Helsinki-NLP-backed translation pipeline across 12 Indian languages, cutting repeated translation latency and cost.",
            },
        ],

        schema: {
            tables: [
                { name: "User", fields: ["id", "email", "passwordHash", "role"] },
                { name: "Budget", fields: ["id", "userId", "category", "monthlyLimit"] },
                { name: "Goal", fields: ["id", "userId", "targetAmount", "deadline"] },
                { name: "Transaction", fields: ["id", "userId", "amount", "bank", "parsedFrom"] },
                { name: "Advisor", fields: ["id", "name", "chromaCollectionId"] },
            ],
        },

        apiCard: {
            method: "POST",
            endpoint: "/api/advisor/chat",
            request: '{ "message": "Can I afford a ₹40k trip this month?" }',
            response: '{ "reply": "...", "groundedOn": ["budgets", "transactions"] }',
            status: 200,
        },

        results: [
            { value: "27", label: "Prisma models spanning auth, budgets, goals & advisor workflows" },
            { value: "12", label: "Indian languages served by the translation pipeline" },
            { value: "2", label: "numeric workloads (anomaly detection, forecasting) kept off the LLM path" },
        ],

        annotation: { text: "LLM calls stay reserved for language — never for arithmetic" },
    },

    dhenu: {
        slug: "dhenu",
        title: "DHENU",
        tagline: "A bilingual AI vet, running on infrastructure that costs nothing at rest.",
        role: "Backend & Cloud Engineer",
        timeline: "Google Solution Challenge 2025",
        stack: ["React Native (Expo)", "Flask", "SQLAlchemy", "Firebase", "Cloud SQL (MySQL)", "Vertex AI Gemini", "Cloud Run"],
        tags: ["AI", "AgriTech"],
        links: { github: "https://github.com/Dhenu-google/dhenu-app", demo: "https://youtu.be/FxbRTp-LyAU?si=JGy41QeqM1Tns2mY" },

        hero: {
            type: "phone",
            messages: [
                { from: "user", lang: "KN", text: "Which breed suits dry-land grazing near Bidar?" },
                { from: "agent", lang: "EN", text: "For dry-land conditions, indigenous breeds like Deoni or Khillari tend to outperform crossbreds on feed efficiency." },
                { from: "user", lang: "HI", text: "Iska doodh utpaadan kaisa hai?" },
                { from: "agent", lang: "EN", text: "Moderate yield, but far higher resilience to heat stress and local fodder." },
            ],
        },

        problem: "Farmers needed multilingual guidance on indigenous cow breeding and conservation, but a hackathon timeline ruled out fine-tuning models or hosting a fleet of language-specific services — and any backend that stayed warm 24/7 would have burned the team's entire cloud budget.",

        approach: [
            {
                heading: "Two agents, one model",
                body: "Two purpose-built conversational agents run on a single Vertex AI Gemini (gemini-2.0-flash-001) backend, split by role-specific prompt routing across 5 Indian languages — no fine-tuning, no separate hosted models per language.",
            },
            {
                heading: "Skip the RAG pipeline",
                body: "The breeding-recommendation engine is grounded through Gemini's built-in Google Search grounding tool instead of building and maintaining a custom retrieval index.",
            },
            {
                heading: "Data split by workload, not by default",
                body: "A serverless Flask (SQLAlchemy, Alembic) backend on Cloud Run splits data across Firestore and Cloud SQL (MySQL) by access pattern, with scale-to-zero autoscaling keeping infrastructure cost near zero between requests; auth/sync is delegated to Firebase and translation/TTS to managed Google APIs.",
            },
        ],

        architecture: {
            rows: [
                { nodes: [{ label: "React Native App", sublabel: "Expo, 5 languages" }] },
                { nodes: [{ label: "Cloud Run", sublabel: "Flask + SQLAlchemy, scale-to-zero" }] },
                {
                    nodes: [
                        { label: "Firestore", sublabel: "realtime sync", tone: "cool" },
                        { label: "Cloud SQL", sublabel: "structured records", tone: "cool" },
                    ],
                    fanLabel: "split by workload",
                },
                { nodes: [{ label: "Vertex AI Gemini", sublabel: "gemini-2.0-flash-001" }] },
            ],
            bullets: [
                "Cloud Run's scale-to-zero means the backend costs nothing while no farmer is querying it.",
                "Firestore handles realtime sync; Cloud SQL holds structured breeding/herd records — split by access pattern, not by default.",
                "Auth and sync are delegated to Firebase; translation and TTS run on managed Google APIs instead of custom pipelines.",
            ],
        },

        codeSnippet: {
            filename: "breeding_advisor.py",
            language: "python",
            lines: [
                { text: "response = gemini.generate_content(", tone: "fn" },
                { text: "    prompt=build_prompt(query, lang=\"kn\"),", tone: "plain" },
                { text: "    tools=[GoogleSearchRetrieval()],", tone: "plain" },
                { text: "    # grounding, no custom RAG index to maintain", tone: "comment" },
                { text: ")", tone: "plain" },
                { text: "return route_agent(response, agent=\"breeding\")", tone: "fn" },
            ],
        },

        results: [
            { value: "5", label: "Indian languages served through role-based prompt routing" },
            { value: "0", label: "custom RAG pipeline — grounding handled by Gemini's search tool" },
            { value: "Scale-to-zero", label: "Cloud Run autoscaling keeps idle cost near zero" },
        ],

        annotation: { text: "no fine-tuning, no per-language models — just better prompt routing" },
    },

    redretail: {
        slug: "redretail",
        title: "RedRetail",
        tagline: "An automated red team for e-commerce, running its attacks in parallel.",
        role: "Security Tooling Engineer",
        timeline: "July 2025",
        stack: ["Python", "Parallel Execution", "Payload Library", "Risk Scoring"],
        tags: ["AI", "Cyber Security", "Python"],
        links: { github: "https://github.com/Weasley18/sparkathon/tree/main/ecommerce-redteam", demo: "https://youtu.be/R30wI0NyVvI?feature=shared" },

        hero: {
            type: "terminal",
            title: "redretail --scan target.example.com",
            lines: [
                { text: "$ redretail scan --target target.example.com", tone: "prompt" },
                { text: "[*] Loading payload library...", tone: "plain" },
                { text: "[+] SQLi module: testing endpoints", tone: "plain" },
                { text: "[PASS] /api/products?id= — no injection detected", tone: "pass" },
                { text: "[WARN] /api/search?q= — reflected input, verify manually", tone: "warn" },
                { text: "[+] XSS module: testing forms", tone: "plain" },
                { text: "[WARN] /checkout — unescaped output in confirmation email", tone: "warn" },
                { text: "[*] Aggregating risk score...", tone: "plain" },
                { text: "[DONE] report written to report.json", tone: "pass" },
            ],
        },

        problem: "Manually testing every endpoint of an e-commerce site against common attack classes doesn't scale, and a pile of one-off scripts doesn't give a security team anything they can triage. It needed to be a framework, not a script — modular per attack class, fast across many endpoints, and it needed to end in a score, not a wall of logs.",

        approach: [
            {
                heading: "Modular by attack class",
                body: "A modular Python framework treats each vulnerability class — SQL injection, XSS, and others — as its own scanner module, drawing from a shared library of common attack payloads instead of duplicating logic per check.",
            },
            {
                heading: "Parallel, not sequential",
                body: "Test execution runs in parallel across endpoints and forms rather than one at a time, cutting the wall-clock time to scan a full site.",
            },
            {
                heading: "One risk score, not a wall of logs",
                body: "Automated risk-scoring aggregates raw findings from every module into a single report, so results are triageable by a human instead of being a dump of raw scanner output.",
            },
        ],

        architecture: {
            rows: [
                { nodes: [{ label: "Target Site" }] },
                { nodes: [{ label: "Scanner Orchestrator", sublabel: "loads payload library" }] },
                {
                    nodes: [
                        { label: "SQLi Worker", tone: "warm" },
                        { label: "XSS Worker", tone: "warm" },
                        { label: "…Worker", tone: "warm" },
                    ],
                    fanLabel: "parallel test execution",
                },
                { nodes: [{ label: "Risk Aggregator", sublabel: "automated scoring" }] },
            ],
            bullets: [
                "Each attack class is an independent, pluggable scanner module sharing one payload library.",
                "The orchestrator fans requests out across endpoints in parallel instead of scanning sequentially.",
                "The aggregator collapses every module's raw findings into one risk-scored report.",
            ],
        },

        codeSnippet: {
            filename: "scanners/sqli.py",
            language: "python",
            lines: [
                { text: "async def run(target, payloads):", tone: "fn" },
                { text: "    async with TaskGroup() as tg:", tone: "plain" },
                { text: "        for endpoint in target.endpoints:", tone: "plain" },
                { text: "            tg.create_task(", tone: "plain" },
                { text: "                test_endpoint(endpoint, payloads)", tone: "plain" },
                { text: "            )", tone: "plain" },
                { text: "    return aggregate_risk(tg.results)", tone: "fn" },
            ],
        },

        results: [
            { value: "2+", label: "attack classes covered (SQLi, XSS) via a shared payload library" },
            { value: "Parallel", label: "test execution across endpoints instead of sequential scans" },
            { value: "1", label: "aggregated risk score produced per scan, not raw logs" },
        ],

        annotation: { text: "built to plug in new attack classes without touching the orchestrator" },
    },
};
