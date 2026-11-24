// The grid source of truth. Flagship projects (isFlagship: true) are the
// "Starting XI" on Home/Work. Any project with a `slug` also has a matching
// entry in caseStudies.js for the full /work/:slug page.
export const projects = [
    {
        slug: "hirelens",
        isFlagship: true,
        title: "HireLens",
        subtitle: "LLM Candidate Assessment Platform",
        summary: "An LLM résumé assessor that grounds every gap and interview question in cited evidence.",
        tags: ["AI/ML", "Backend"],
        date: "Sep – Nov 2026",
        videoPdfLink: "https://drive.google.com/file/d/19YL6FHMIappDOB2GMEY3tggJzdEmKPDa/view?usp=sharing",
        githubRepoLink: "https://github.com/Weasley18/hirelens",
        liveLink: "https://thehirelens.netlify.app",
        description: [
            "Built an LLM resume assessor to replace keyword-skim hiring screens, grounding each gap and interview question in cited evidence.",
            "Architected microservices behind a reverse proxy: a Fastify API, BullMQ asynchronous job queues and a FastAPI RAG service.",
            "Made jobs fault-tolerant with timeouts, retries and idempotent pgvector ingestion, validated against a single shared JSON Schema.",
            "Passed 21/24 eval cases over 120 runs, resisted every prompt-injection test, and shipped with 117 unit and integration tests in CI."
        ]
    },
    {
        slug: "the-docket",
        isFlagship: true,
        title: "The Docket",
        subtitle: "AI Courtroom Mystery",
        summary: "A multiplayer courtroom where two LLM counsel agents argue cases before human jurors.",
        tags: ["AI", "Full-Stack"],
        date: "August 2026",
        videoPdfLink: "https://drive.google.com/file/d/1CrcKWG2cJQpeAjIfLrR4RHSO-IVoCp_P/view?usp=sharing",
        githubRepoLink: "https://github.com/Weasley18/mystery-game",
        liveLink: "https://docket.harshringsia.me/",
        description: [
            "Made a multiplayer courtroom game where two LLM counsel agents, orchestrated in LangGraph, argue cases before human jurors.",
            "Horizontally scaled FastAPI WebSockets via event-driven Redis pub/sub, adding TTL lobbies, rate limits and a thread-safe store.",
            "Load-tested concurrent lobbies with an asyncio client and 30 pytest cases incl. WebSocket end-to-end, then deployed on Railway."
        ]
    },
    {
        slug: "secpipe",
        isFlagship: true,
        title: "SecPipe",
        subtitle: "Automated DevSecOps CI/CD Security Gate",
        summary: "Eighteen security scanners merged into one CI gate that blocks a bad PR in under two minutes.",
        tags: ["Security", "Backend"],
        date: "September 2026",
        videoPdfLink: "https://drive.google.com/file/d/1baAZuI9mX4MzyX2s98NGNXes0ZJLz-jo/view?usp=sharing",
        githubRepoLink: "https://github.com/Weasley18/SecPipe",
        liveLink: null,
        description: [
            "Unified 18 siloed SAST/SCA/IaC/DAST scanners into one DevSecOps CI/CD gate for a FastAPI app (JWT, Argon2, TOTP 2FA).",
            "Wrote a Python aggregator that dedupes via union-find, caches EPSS/CISA KEV data, and gates Cosign and SBOM attestation.",
            "Cut 11,223 raw findings to 7,516 (-33%), caught 13/14 planted OWASP Top 10 flaws like SSRF, and blocked the PR in <2 min."
        ]
    },
    {
        slug: "finsaathi",
        isFlagship: true,
        title: "FinSaathi",
        subtitle: "AI-Powered Financial Empowerment Platform",
        summary: "A fintech backend with an AI advisor clone, grounded chat, and anomaly detection.",
        tags: ["AI", "FinTech"],
        date: "Feb 2026",
        videoPdfLink: "",
        githubRepoLink: "https://github.com/Weasley18/Finsaathi",
        description: [
            "Architected a Node.js/TypeScript backend on Fastify with a 27-model Prisma/PostgreSQL schema spanning auth, budgets, goals, advisor workflows, and partner matching, backed by BullMQ + Redis for background jobs.",
            "Built a RAG-based \"Advisor Clone,\" indexing each advisor's notes into per-advisor ChromaDB collections for style-matched few-shot retrieval, plus an MCP tool-calling layer grounding every chat response in the user's live transaction/budget/goal data.",
            "Offloaded numerical workloads (Isolation Forest anomaly detection, Prophet cash-flow forecasting) to a dedicated Python/FastAPI microservice with automatic fallback to legacy heuristics, reserving LLM calls for language tasks only.",
            "Built a multi-bank Indian SMS transaction parser (regex templates per bank with LLM fallback) and a Redis-cached, Helsinki-NLP-backed translation pipeline across 12 Indian languages, cutting repeated translation latency and cost."
        ]
    },
    {
        slug: "para-football",
        isFlagship: false,
        title: "Para Football",
        subtitle: "Kolkata Street Football",
        summary: "A 3D street football game in the browser, with 120 Hz physics and zero asset files.",
        tags: ["Game Dev", "Game AI"],
        date: "November 2026",
        videoPdfLink: "https://drive.google.com/file/d/1-BquyWNJTeTR7irPc5sttwLCLjGqX9cy/view?usp=sharing",
        githubRepoLink: "https://github.com/Weasley18/kolkata-street-football",
        liveLink: "https://kolkata-street-football.netlify.app/",
        description: [
            "Built a 3D street football game to hit Kolkata para nostalgia, coding 120 Hz physics and role-based CPU AI with 3 difficulty tiers.",
            "Took it from concept to production in just 5 hours as a single web page with zero asset files."
        ]
    },
    {
        slug: "dhenu",
        isFlagship: false,
        title: "DHENU",
        subtitle: "AI-Powered App for Indigenous Cow Conservation",
        summary: "A serverless, multilingual mobile app built for the Google Solution Challenge.",
        tags: ["AI", "AgriTech"],
        date: "Google Solution Challenge 2025",
        videoPdfLink: "https://youtu.be/FxbRTp-LyAU?si=JGy41QeqM1Tns2mY",
        githubRepoLink: "https://github.com/Dhenu-google/dhenu-app",
        description: [
            "Architected a serverless REST backend in Flask (SQLAlchemy, Alembic) on Google Cloud Run, splitting data across Firestore and Cloud SQL (MySQL) by workload, with scale-to-zero autoscaling minimizing infrastructure cost.",
            "Designed two purpose-built conversational AI agents on a single Vertex AI Gemini (gemini-2.0-flash-001) backend via role-specific prompt routing across 5 Indian languages, avoiding the cost of fine-tuning or hosting separate models.",
            "Built a breeding-recommendation engine grounded via Gemini's built-in Google Search grounding tool in place of a custom RAG pipeline; delegated auth/sync to Firebase and offloaded translation/TTS to managed Google APIs."
        ]
    },
    {
        slug: "redretail",
        isFlagship: false,
        title: "RedRetail",
        subtitle: "AI-Powered Red Teaming for E-commerce Security",
        summary: "A modular scanner that automates vulnerability discovery across e-commerce sites.",
        tags: ["AI", "Cyber Security", "Python"],
        date: "July 2025",
        videoPdfLink: "https://youtu.be/R30wI0NyVvI?feature=shared",
        githubRepoLink: "https://github.com/Weasley18/sparkathon/tree/main/ecommerce-redteam",
        description: [
            "Constructed a modular Python framework to automate vulnerability detection.",
            "Vulnerability scanners for e-commerce threats (SQLi, XSS, etc) using a library of common attack payloads.",
            "Architected framework for efficiency with parallel test execution and automated risk-scoring."
        ]
    },
    {
        slug: null,
        isFlagship: false,
        title: "Auror",
        subtitle: "Moody's Magical Cybersecurity Classroom",
        summary: "A Harry Potter–themed Gemini chatbot that teaches cybersecurity concepts.",
        tags: ["Chatbot", "Cyber Security", "Gemini API"],
        date: "May 2025",
        videoPdfLink: null,
        githubRepoLink: "https://github.com/Weasley18/CY-Advisor",
        description: [
            "Created a character-driven Gemini API chatbot with a Harry Potter theme to teach cybersecurity concepts.",
            "Authored context-aware prompts to shape the chatbot's tone, achieving 90% positive user feedback.",
            "Designed and developed a minimalist front-end to reduce cognitive load."
        ]
    },
    {
        slug: null,
        isFlagship: false,
        title: "Dhata",
        subtitle: "Your AI-Powered Companion for Karnataka",
        summary: "A 30-hour-hackathon citizen assistance app with offline-first SOS.",
        tags: ["AI", "Mobile Application", "React Native"],
        date: "April 2025",
        videoPdfLink: "https://drive.google.com/file/d/1oD0C3aCY0eZ0Y3Uk5M4Ppl537LF_LcQO/view?usp=sharing",
        githubRepoLink: "https://github.com/Dhata-Srishti/app",
        description: [
            "Built a cross-platform citizen assistance app in a 30-hour hackathon.",
            "Implemented integrated service access and navigation with Google Maps MCP.",
            "Integrated an offline-first SOS feature and enabled content accessibility in 3 languages."
        ]
    },
    {
        slug: null,
        isFlagship: false,
        title: "SkyWay Flight Booking System",
        subtitle: "Full Stack Application",
        summary: "A React/Flask/MySQL booking system with role-based admin controls.",
        tags: ["React", "Flask", "MySQL"],
        date: "July 2024",
        videoPdfLink: null,
        githubRepoLink: "https://github.com/Weasley18/Flights",
        description: [
            "Designed a Full-stack app using React for frontend, Python Flask for backend, and MySQL.",
            "Implemented secure user and admin authentication using JWT.",
            "Admin functions for flight and airport management with role-based access control."
        ]
    },
    {
        slug: null,
        isFlagship: false,
        title: "Stock Price Prediction",
        subtitle: "Machine Learning, Finance",
        summary: "An LSTM network trained on 5 years of market data for trend forecasting.",
        tags: ["Machine Learning", "Keras", "TensorFlow"],
        date: "May 2024",
        videoPdfLink: null,
        githubRepoLink: "https://github.com/Weasley18/Google-Stock-Price-Analysis",
        description: [
            "Trained an LSTM NN on 5 years of market data to identify trends.",
            "Achieved precise forecasting with a low RMSE of 56.5 on test data.",
            "Performed data pre-processing and feature engineering."
        ]
    }
];
