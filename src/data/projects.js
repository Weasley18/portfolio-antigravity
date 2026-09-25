// The grid source of truth. Flagship projects (isFlagship: true) get a real
// `slug` and a matching entry in caseStudies.js for the full /work/:slug page.
export const projects = [
    {
        slug: "the-docket",
        isFlagship: true,
        title: "The Docket",
        subtitle: "AI Courtroom Mystery — Real-Time Multiplayer Deduction Game",
        summary: "A real-time multiplayer courtroom where two LLM agents argue a case to verdict.",
        tags: ["AI", "Full-Stack"],
        date: "August 2026",
        videoPdfLink: null,
        githubRepoLink: "",
        description: [
            "Architected a real-time multiplayer game engine in FastAPI with WebSockets, orchestrating a multi-phase debate-to-verdict loop across concurrent lobbies; containerized and deployed to Railway.",
            "Designed a dual-agent AI courtroom in LangGraph, routing prosecution/defense arguments through independently-tuned LLM calls via dedicated debate, Q&A, and voting nodes, backed by SQLite state checkpointing.",
            "Built a Redis-backed state layer (TTL expiry, per-player rate limiting) with pub/sub WebSocket fan-out, enabling horizontal scaling across backend workers while preserving real-time consistency.",
            "Hardened LLM endpoints against prompt injection with a serialization layer masking sensitive game state pre-verdict; benchmarked via custom load tests, now extending with TTS/STT."
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
        slug: "dhenu",
        isFlagship: true,
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
        isFlagship: true,
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
