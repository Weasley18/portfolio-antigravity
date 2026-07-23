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
        company: "Firedesk",
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
            "Developed responsive websites for clients, creating user-centric digital experiences.",
            "Managed end-to-end project lifecycles using methodologies and Git."
        ]
    },
    {
        role: "Summer Research Intern",
        company: "Indian Institute of Technology Roorkee",
        location: "Remote",
        duration: "May 2024 - June 2024",
        description: [
            "Authored Python scripts using graph theory algorithms to segment maps into 120+ distinct neighborhood clusters.",
            "Achieved 25–30% higher accuracy in spatial clustering using a graph-based method over K-means and DBSCAN."
        ]
    }
];

export const projects = [
    {
        title: "Finsaathi",
        subtitle: "AI-Powered Financial Empowerment Platform",
        tags: ["AI", "Fintech"],
        date: "Feb 2026",
        videoPdfLink: "",
        githubRepoLink: "https://github.com/Weasley18/Finsaathi",
        description: [
            "Engineered a conversational advisor utilizing a fine-tuned Llama 8B model and RAG pipeline (ChromaDB), integrated with Anthropic’s MCP for real-time, hallucination-free financial data retrieval.",
            "Developed a scalable Node.js/TypeScript backend and React Native frontend serving 4 distinct personas, featuring multilingual support (12 Indian languages) and gamified automated UPI micro-savings.",
            "Implemented an XGBoost-based Financial Health Score and proactive anomaly detection using Isolation Forest, ensuring data privacy via DistilBERT, federated scoring, and AES-256-GCM encryption."
        ]
    },
    {
        title: "Dhenu",
        subtitle: "AI Mobile Application for Cow Conservation",
        tags: ["AI", "Mobile Application", "GCP"],
        date: "Mar 2025",
        videoPdfLink: "https://youtu.be/FxbRTp-LyAU?si=JGy41QeqM1Tns2mY",
        githubRepoLink: "https://github.com/Dhenu-google/dhenu-app",
        description: [
            "Built a mobile app for conserving indigenous cow breeds with a community forum and AI health advisor.",
            "Configured a Gemini API, increasing cross-breeding recommendation accuracy by 35%.",
            "Integrated Firebase for secure data management and real-time geo-tagging alerts."
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
  "languages": ["C", "Java", "Python", "JavaScript", "TypeScript", "SQL"],
  "frameworksAndLibraries": ["React", "React Native", "Node.js", "Express.js", "RESTful APIs", "Pandas", "Langchain"],
  "databasesAndCloud": ["PostgreSQL", "MongoDB", "Firebase", "Google Cloud Platform (GCP)", "Docker"],
  "toolsAndConcepts": ["Git/GitHub", "Linux", "Data Structures & Algorithms", "Data Visualization", "HTML", "CSS", "Bootstrap"]
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
