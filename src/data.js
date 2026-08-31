export const personalInfo = {
    name: "Harsh Ringsia",
    role: "Computer Science Student & Developer",
    tagline: "I build systems that turn ambitious ideas into production-ready software — from secure, scalable APIs to AI pipelines that actually ship. As an SDE Intern at Firedesk, I've engineered 10+ backend services with JWT auth and RBAC, optimized PostgreSQL schemas to cut query latency by 40%, and built reusable React interfaces that halved feature build time. On the AI side, I've architected RAG pipelines with fine-tuned LLMs, deployed ML models for financial risk scoring, and shipped multilingual mobile apps used across real-world hackathons. I care about clean architecture, measurable impact, and building things people actually use.",
    email: "harshringsia18@gmail.com",
    phone: "+91-7439746027",
    linkedin: "https://linkedin.com/in/harshringsia",
    github: "https://github.com/Weasley18",
    location: "Bengaluru, India",
    image:  "/profilepic.jpg"
};

export const education = [
    {
        degree: "B.E. in Computer Science-Cyber Security",
        institution: "R.N. Shetty Institute of Technology",
        location: "Bengaluru",
        year: "2023 – 2027"
    },
    {
        degree: "Council for the Indian School Certificate Examinations (1-12)",
        institution: "Don Bosco School",
        location: "Bandel, India",
        year: "2010 – 2022"
    }
];

export const experience = [
    {
        role: "SDE Intern",
        company: "Firedesk (Leistung Technologies)",
        location: "On-Campus",
        duration: "September 2025 - June 2026",
        description: [
            "Engineered 10+ backend REST APIs in Node.js and Express.js, implementing JWT-based authentication and Role-Based Access Control (RBAC) across multiple user roles to secure request handling in production.",

            "Built responsive React interfaces for 5+ application modules, standardizing a reusable component library that cut new-feature build time by 50% and unified UI/UX across the platform.",
            
            "Architected and optimized PostgreSQL relational schemas for 10+ modules, adding indexing strategies and ORM-based migrations that reduced average query latency by 40% and enforced data integrity."
        ]
    },
    {
        role: "Student Researcher",
        company: "Undergraduate Research Forum, RNSIT",
        location: "On-Campus",
        duration: "October 2025 - January 2026",
        description: [
            "Collected and preprocessed EEG/biometric data using NeuroSky, MNE-Python, and SciPy, reducing signal noise by ~30%.",
            "Optimized Random Forest/SVM pipelines, achieving 80–85% migraine classification accuracy.",
            "Building a mobile alert system for early migraine intervention, planning field trials with NGOs."
        ]
    },
    {
        role: "Web Development Freelancing",
        company: "Self (evolvexcse.in, enngee.in)",
        location: "Remote",
        duration: "Part-time",
        description: [
            "Designed and shipped 2 responsive client websites end-to-end using HTML, CSS, JavaScript, and Git-based version control.",
            "Acted as sole developer and point of contact, coordinating directly with stakeholders to deliver on time and maintaining post-launch support for live production sites."
        ]
    },
    {
        role: "Summer Research Intern",
        company: "Indian Institute of Technology Roorkee",
        location: "Remote",
        duration: "May 2024 - June 2024",
        description: [
            "Researched and implemented Python scripts of graph-theory to segment urban maps into 120+ distinct neighborhood clusters.",
            "Achieved 25–30% higher clustering accuracy using a graph-based method over K-means and DBSCAN for neighborhood delineation."
        ]
    }
];

export const projects = [
    {
        title: "AI Courtroom Mystery",
        subtitle: "Real-Time Multiplayer Deduction Game",
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
        title: "Finsaathi",
        subtitle: "AI-Powered Financial Empowerment Platform",
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
        title: "Dhenu",
        subtitle: "AI-Powered App for Indigenous Cow Conservation",
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
        title: "RedRetail",
        subtitle: "AI-Powered Red Teaming for E-commerce Security",
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
        title: "Auror",
        subtitle: "Moody’s Magical Cybersecurity Classroom",
        tags: ["Chatbot", "Cyber Security", "Gemini API"],
        date: "May 2025",
        videoPdfLink: null,
        githubRepoLink: "https://github.com/Weasley18/CY-Advisor",
        description: [
            "Created a character-driven Gemini API chatbot with a Harry Potter theme to teach cybersecurity concepts.",
            "Authored context-aware prompts to shape the chatbot’s tone, achieving 90% positive user feedback.",
            "Designed and developed a minimalist front-end to reduce cognitive load."
        ]
    },
    {
        title: "Dhata",
        subtitle: "Your AI-Powered Companion for Karnataka",
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
        title: "SkyWay Flight Booking System",
        subtitle: "Full Stack Application",
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
        title: "Stock Price Prediction",
        subtitle: "Machine Learning, Finance",
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

export const skills = {
  "Languages": ["Python", "TypeScript/JavaScript", "Java", "C", "SQL"],
  "AI/ML & LLM Engineering": ["LangChain", "LangGraph", "RAG", "Vertex AI/Gemini", "OpenAI API", "Ollama", "ChromaDB", "MCP"],
  "Backend & APIs": ["Node.js", "Express.js", "Fastify", "Flask", "FastAPI", "RESTful APIs", "WebSockets", "SQLAlchemy", "Prisma"],
  "Databases & Messaging": ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Firebase (Firestore)", "Redis"],
  "Tools & Concepts": ["Git/GitHub", "Linux", "Data Structures & Algorithms", "React", "React Native"]
};

export const certifications = [
    "Winner, Codeflix 6.0 (1st place out of 200 participants)-Competitive Coding Compedition",
    "Winner, Schema Showdown (1st place out of 70 participants)-SQL Query Writing Competition",
    "Machine Learning Specialization",
    "Google Cybersecurity Specialization",
    "Introduction to Back-End Development by META",
    "Participated in 10+ hackathons",
    "Leetcode: Contest rating of 1768"
];
