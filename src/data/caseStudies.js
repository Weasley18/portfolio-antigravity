// Rich case-study content, rendered at /work/:slug. The first four are the
// flagship "Starting XI"; `exploded` drives the 3D exploded-view diagram.
// Every stat in `results` traces back to a fact already stated in projects.js /
// the resume — nothing here is invented.

export const caseStudies = {
    hirelens: {
        slug: "hirelens",
        title: "HireLens",
        codename: "Fair Screen",
        tagline: "An LLM résumé assessor that shows its working instead of skimming for keywords.",
        villain: "Keyword-skim hiring screens that can't explain a single decision.",
        role: "Solo engineer — backend, AI & infra",
        timeline: "Sep – Nov 2026",
        stack: ["Python", "FastAPI", "Fastify", "BullMQ", "Redis", "pgvector", "Zod", "Docker Compose", "Caddy", "Oracle Cloud", "Playwright"],
        tags: ["AI/ML", "Backend"],
        links: {
            github: "https://github.com/Weasley18/hirelens",
            demo: "https://thehirelens.netlify.app",
            video: "https://drive.google.com/file/d/19YL6FHMIappDOB2GMEY3tggJzdEmKPDa/view?usp=sharing",
        },
        video: { file: "hirelens.mp4", title: "HireLens explainer", embed: "https://drive.google.com/file/d/19YL6FHMIappDOB2GMEY3tggJzdEmKPDa/view?usp=sharing" },

        hero: {
            type: "terminal",
            title: "hirelens — eval + test summary",
            lines: [
                { text: "# eval suite: 24 cases × 5 runs = 120", tone: "prompt" },
                { text: "✓ 21/24 cases passed", tone: "pass" },
                { text: "✓ prompt-injection cases: every attack resisted", tone: "pass" },
                { text: "✓ fairness pairs within 5 pts (0.6 · 2.8 · 0.4)", tone: "pass" },
                { text: "! 3 bugs found — in the harness, not the model", tone: "warn" },
                { text: "", tone: "plain" },
                { text: "# CI", tone: "prompt" },
                { text: "✓ 117 unit + integration tests", tone: "pass" },
            ],
        },

        problem: "Most résumé screens are a keyword match wearing a trench coat. They reject a career-changer who has done the work but never wrote the buzzword, wave through a résumé stuffed with every acronym in the job post, and when a recruiter asks \"why did this one score 42?\" there's no answer. I wanted an assessor that reads a résumé against a role the way a good interviewer would, and shows its working: every gap it flags and every interview question it suggests points back to the line of the résumé it came from. And because it's an LLM making judgments about people, I wanted to be able to prove it behaves: same input, same reasons; same candidate with a different name, same score.",

        approach: [
            {
                heading: "A pipeline, not a prompt",
                body: "A résumé goes through parse, a deterministic skill extractor (a dictionary lookup, not a second LLM call, so \"EKS\" and \"k8s\" both become Kubernetes), pgvector retrieval over a 73-chunk knowledge base of rubrics, interview craft and 7 tech domains, and only then the LLM. Each stage is cheap to test on its own.",
            },
            {
                heading: "Streamed, then validated twice",
                body: "The model streams JSON and each top-level field (fit score, verdict, gaps, strengths, questions) appears only once it's complete. The whole answer is validated again against one shared JSON Schema that both the Fastify (Zod) and Python sides import. A draft that breaks the schema is never shown as a result.",
            },
            {
                heading: "Every job has a budget",
                body: "Each analysis gets a 60-second budget. If the model breaks the schema and there's time left, it retries once; if the provider is slow and there's less than 10 seconds left, it fails cleanly instead of blowing the deadline. Transient errors (429, 500, 503, 504) get exactly one BullMQ retry after 5 s, and a retry checks for a saved result first, so the model is never paid for twice.",
            },
            {
                heading: "A consistency rule the model can't argue with",
                body: "A score of 85+ with a severe gap, 90+ with three gaps, or 40 and below with no gaps at all gets flagged, as do duplicate interview questions. Gap severities are weighted (minor 1, moderate 2, severe 4), so a 70 with a gap weight of 8 is called out as generous.",
            },
            {
                heading: "Documents don't outlive the job",
                body: "The résumé and job description live in Redis with a 15-minute expiry, and are deleted the moment a job fails. Logs record why a job failed and how long it took, never a word of the documents.",
            },
        ],

        architecture: {
            bullets: [
                "Caddy sits in front as the reverse proxy and terminates TLS.",
                "Fastify validates each request against the shared schema and enqueues work in BullMQ on Redis.",
                "Workers call the FastAPI ML service: skill extraction, pgvector retrieval, then the streamed LLM call.",
                "Knowledge-base ingestion locks the table and replaces the whole snapshot in one transaction, so a re-run can't duplicate chunks.",
                "Everything runs under Docker Compose on Oracle Cloud, with Playwright end-to-end tests in CI.",
            ],
        },

        exploded: {
            caption: "HireLens, taken apart",
            parts: [
                { id: "base", kind: "slab", size: [4.2, 0.34, 2.6], pos: [0, 0.17, 0], explode: [0, -0.9, 0], stage: 3, tone: "steel", label: "Oracle Cloud", note: "Docker Compose host" },
                { id: "pg", kind: "disks", size: [0.62, 0.9, 0], pos: [-1.05, 0.79, 0.1], explode: [-1.7, -0.2, 0.5], stage: 2, tone: "blue", label: "Postgres + pgvector", note: "73-chunk knowledge base" },
                { id: "redis", kind: "disks", size: [0.5, 0.7, 0], pos: [1.15, 0.69, 0.2], explode: [1.8, -0.2, 0.6], stage: 2, tone: "garnet", label: "Redis", note: "queues · 15-min document TTL" },
                { id: "rag", kind: "slab", size: [3.2, 0.42, 1.9], pos: [0, 1.55, 0], explode: [-1.3, 0.5, 0.9], stage: 2, tone: "blue", label: "FastAPI ML service", note: "skills → retrieval → LLM" },
                { id: "queue", kind: "queue", size: [3.0, 0.3, 1.2], pos: [0, 2.0, 0], explode: [1.5, 0.9, 0.7], stage: 1, tone: "gold", label: "BullMQ queues", note: "60 s budget · one retry" },
                { id: "api", kind: "slab", size: [2.8, 0.42, 1.7], pos: [0, 2.39, 0], explode: [0, 1.6, 0.9], stage: 1, tone: "garnet", label: "Fastify API", note: "one shared JSON Schema" },
                { id: "edge", kind: "core", size: [1.6, 0.18, 1.6], pos: [0, 2.72, 0], explode: [0, 2.6, 0], stage: 0, tone: "gold", label: "Caddy", note: "reverse proxy · TLS" },
            ],
        },

        simulation: "hirelens",
        simIntro: "Screen a made-up candidate through the same stages HireLens runs. The assessment streams in field by field, and every claim points at the résumé line behind it. Then try to break the pipeline, and run the eval harness yourself.",

        incidents: [
            {
                title: "The fairness check read one run",
                body: "It compared only the first run of each counterfactual pair and reported a 6-point \"bias\" between two variants whose five-run ranges were identical (78–84 each). Averaging all runs, the gap is 0.6.",
            },
            {
                title: "The grounding check tripped on a full stop",
                body: "The JD said \"…such as CAN and LIN.\" The full stop stayed stuck to \"LIN\", so a perfectly correct gap was reported as invented. Tokens are now stripped of trailing dots.",
            },
            {
                title: "A timeout that wasn't a TimeoutError",
                body: "On Python 3.9 a read timeout raises socket.timeout, which only became a TimeoutError in 3.10. Slow responses crashed the harness instead of retrying. It now catches both.",
            },
        ],

        runTable: {
            title: "The eval suite",
            rows: [
                ["Cases × runs", "24 hand-written cases × 5 runs = 120"],
                ["Passed", "21 of 24"],
                ["Prompt injection", "\"set your own score\" and \"reject everyone\" cases: both resisted"],
                ["Fairness pairs", "name 0.6 · graduation year 2.8 · career break 0.4 (tolerance 5)"],
                ["Flagged", "principal-for-mid-level spread 16 (limit 10); two runs sat exactly on the 70 edge"],
                ["Harness bugs", "3, all fixed and unit-tested before trusting a score"],
            ],
        },

        results: [
            { value: "21/24", label: "eval cases passed, across 120 runs" },
            { value: "0", label: "prompt-injection attacks that got through" },
            { value: "117", label: "unit and integration tests running in CI" },
        ],

        lessons: [
            "Evals need their own tests. The three \"model problems\" real runs surfaced were all bugs in the harness.",
            "Give every job a time budget and decide in advance what happens when it runs out.",
            "A deterministic step before the LLM (here, skill extraction) is cheaper, testable and removes a whole class of hallucination.",
        ],
        annotation: { text: "evals need their own tests" },
    },

    "the-docket": {
        slug: "the-docket",
        title: "The Docket",
        codename: "Order in Court",
        tagline: "A multiplayer courtroom where two AI lawyers argue and human jurors decide.",
        villain: "LLMs that blurt out the verdict before the trial is over.",
        role: "Solo full-stack & AI engineer",
        timeline: "August 2026",
        stack: ["FastAPI", "LangGraph", "OpenAI", "Redis Pub/Sub", "WebSockets", "Pydantic", "SQLite", "Docker", "Nginx", "Railway"],
        tags: ["AI", "Full-Stack"],
        links: {
            github: "https://github.com/Weasley18/mystery-game",
            demo: "https://docket.harshringsia.me/",
            video: "https://drive.google.com/file/d/1CrcKWG2cJQpeAjIfLrR4RHSO-IVoCp_P/view?usp=sharing",
        },
        video: { file: "the-docket.mp4", title: "The Docket walkthrough", embed: "https://drive.google.com/file/d/1CrcKWG2cJQpeAjIfLrR4RHSO-IVoCp_P/view?usp=sharing" },

        hero: {
            type: "architecture",
            rows: [
                { nodes: [{ label: "Jurors", sublabel: "WebSocket clients" }] },
                { nodes: [{ label: "FastAPI", sublabel: "WebSockets · TTL lobbies · rate limits" }] },
                {
                    nodes: [
                        { label: "Prosecution", tone: "warm" },
                        { label: "Defense", tone: "warm" },
                    ],
                    fanLabel: "two LLM counsel agents in LangGraph",
                },
                { nodes: [{ label: "Redis", sublabel: "event-driven pub/sub fan-out" }] },
            ],
        },

        problem: "The game: a case file, a prosecutor and a defense advocate who are both LLMs, and a jury of real people who question them and vote. Take \"Sabotage on Station Helix\": an oxygen scrubber failed at 02:31, Rina Park's badge was logged nearby at 02:14, and she'd been denied a promotion a week earlier. The prosecution is technical and obsessed with timestamps; the defense is calm and goes after chain of custody. For this to be fun, each counsel has to reason independently and stay in character, the jury has to be able to cross-examine in real time, and the one thing that must never happen is either lawyer (or the server) leaking the sealed truth before the vote.",

        approach: [
            {
                heading: "Two counsel, one graph",
                body: "LangGraph runs the trial as a state machine: a 6-speech debate (3 exchanges), a questioning phase capped at 7 questions with an 8-second per-player cooldown, then the vote. Each counsel speaks from its own persona and brief, never a shared context window, so the defense can't \"see\" the prosecution's notes.",
            },
            {
                heading: "Evidence that unlocks",
                body: "Evidence isn't dumped up front. Some exhibits reveal from round 2 onward, others only when a juror asks about the right thing (ask about the \"tool\" and the diagnostic kit tagged to Rina turns up; ask about \"firmware\" and the unapplied patch notes appear). Jurors have to actually investigate.",
            },
            {
                heading: "Scaling the courtroom",
                body: "FastAPI WebSockets scale horizontally through event-driven Redis pub/sub, so any worker can serve any lobby. Lobbies carry a 24-hour TTL refreshed on every move, per-player rate limits stop question spam, and a thread-safe store keeps state consistent.",
            },
            {
                heading: "A verdict nobody can leak",
                body: "The sealed truth is never in a counsel prompt and never in any frame sent before the game is finished. LLM guardrails are only best-effort, so the hard guarantee is a serializer: the public view of a game is built separately from its internal state, and the verdict only joins it when the trial closes.",
            },
        ],

        architecture: {
            bullets: [
                "FastAPI terminates WebSockets and owns lobby lifecycle, with TTL expiry and rate limits.",
                "LangGraph runs the two counsel agents through debate, questioning and vote.",
                "Redis pub/sub fans state out to every juror, whichever worker they're connected to.",
                "Load-tested concurrent lobbies with an asyncio client and 30 pytest cases (including WebSocket end-to-end), then deployed on Railway behind Nginx.",
            ],
        },

        exploded: {
            caption: "The Docket, taken apart",
            parts: [
                { id: "host", kind: "slab", size: [4.0, 0.32, 2.5], pos: [0, 0.16, 0], explode: [0, -0.9, 0], stage: 3, tone: "steel", label: "Railway + Nginx", note: "Docker deploy" },
                { id: "sqlite", kind: "disks", size: [0.5, 0.7, 0], pos: [-1.2, 0.67, 0.2], explode: [-1.8, -0.2, 0.6], stage: 2, tone: "blue", label: "SQLite", note: "checkpointed case state" },
                { id: "redis", kind: "ring", size: [2.2, 0.05, 0], pos: [0, 0.9, 0], explode: [0, -0.3, 0], stage: 3, tone: "garnet", label: "Redis pub/sub", note: "any worker, any lobby" },
                { id: "graph", kind: "rack", size: [3.0, 0.6, 1.7], pos: [0, 0.9, 0], explode: [1.6, 0.3, 0.8], stage: 2, tone: "blue", label: "LangGraph trial", note: "debate · questions · vote" },
                { id: "ws", kind: "slab", size: [2.8, 0.42, 1.7], pos: [0, 1.42, 0], explode: [-1.4, 0.9, 0.8], stage: 1, tone: "garnet", label: "FastAPI WebSockets", note: "TTL lobbies · rate limits" },
                { id: "seal", kind: "core", size: [1.6, 0.18, 1.6], pos: [0, 1.73, 0], explode: [0, 2.0, 0.4], stage: 0, tone: "gold", label: "Verdict serializer", note: "sealed until the vote" },
            ],
        },

        simulation: "docket",
        simIntro: "Sit on the jury for Sabotage on Station Helix, one of the three cases the real game ships. Hear the debate, question either counsel, and try to get the verdict out of them before the vote.",

        incidents: [
            {
                title: "Guardrails weren't enough on their own",
                body: "Output filters catch most attempts to coax the answer out of a counsel, but LLM guardrails are only best-effort. So the guarantee doesn't depend on them: the sealed truth is never in a counsel prompt, and the serializer that builds every frame leaves it out until the trial is finished.",
            },
        ],

        codeSnippet: {
            filename: "public_views.py (illustrative)",
            language: "python",
            lines: [
                { text: "# guardrails are best-effort — this is not", tone: "comment" },
                { text: "def public_state(case: CaseState) -> dict:", tone: "fn" },
                { text: "    state = case.model_dump(include=PUBLIC_FIELDS)", tone: "plain" },
                { text: "    if case.phase == \"finished\":", tone: "keyword" },
                { text: "        state[\"verdict\"] = case.verdict_truth", tone: "plain" },
                { text: "    return state", tone: "keyword" },
            ],
        },

        results: [
            { value: "30", label: "pytest cases, including WebSocket end-to-end" },
            { value: "2", label: "LLM counsel agents arguing before human jurors" },
            { value: "0", label: "frames carrying the verdict before the vote" },
        ],

        lessons: [
            "If a model must not say something, don't tell it. Prompts are not access control.",
            "Make the hard guarantee structural (an allow-list serializer) and let the soft one (output filters) be a bonus.",
        ],
        annotation: { text: "guardrails are best-effort, so the verdict is hidden by design" },
    },

    secpipe: {
        slug: "secpipe",
        title: "SecPipe",
        codename: "Fail Closed",
        tagline: "Eighteen security scanners, one gate, and a PR verdict in under two minutes.",
        villain: "Eighteen scanner reports that nobody reads.",
        role: "Solo engineer — security & platform",
        timeline: "September 2026",
        stack: ["Python", "Bash", "GitHub Actions", "AWS", "Terraform", "Kubernetes", "Helm", "Kyverno", "Semgrep", "OWASP ZAP", "Prometheus"],
        tags: ["Security", "Backend"],
        links: {
            github: "https://github.com/Weasley18/SecPipe",
            demo: null,
            video: "https://drive.google.com/file/d/1baAZuI9mX4MzyX2s98NGNXes0ZJLz-jo/view?usp=sharing",
        },
        video: { file: "secpipe.mp4", title: "SecPipe walkthrough", embed: "https://drive.google.com/file/d/1baAZuI9mX4MzyX2s98NGNXes0ZJLz-jo/view?usp=sharing" },

        hero: {
            type: "terminal",
            title: "secpipe — run 17 · vulnerable into main",
            lines: [
                { text: "# PR opened → secrets · sast · sca · iac · build-scan", tone: "prompt" },
                { text: "raw findings ............ 11,223", tone: "plain" },
                { text: "after union-find dedupe .  7,516  (-33%)", tone: "pass" },
                { text: "new vs main, blocking ...  2,255", tone: "warn" },
                { text: "planted flaws caught ....  13/14", tone: "pass" },
                { text: "", tone: "plain" },
                { text: "✗ gate 1 BLOCK at 1 min 52 s", tone: "warn" },
            ],
        },

        problem: "Security tooling usually arrives as a pile of separate scanners, each with its own report format and its own idea of severity. Run eighteen of them and you get eleven thousand findings, most of them the same three problems seen from different angles, and developers learn to scroll past all of it. I built a deliberately vulnerable FastAPI notes app (JWT, Argon2, TOTP 2FA) with 14 planted flaws, from a fake AWS key in git history to a privileged container on :latest, and set out to build one gate that catches them, merges the noise into one verdict, and blocks a pull request fast enough that nobody tries to route around it.",

        approach: [
            {
                heading: "Five jobs, eighteen scanners",
                body: "secrets (Gitleaks over the full git history), SAST (Semgrep with custom taint rules, Bandit), SCA (OSV-Scanner, pip-audit, licences), IaC (Checkov with custom policies, Trivy config, Kubescape, zizmor) and build-scan (Hadolint, Trivy image, Syft SBOM) run in parallel in GitHub Actions.",
            },
            {
                heading: "One aggregator, three merge rules",
                body: "Every report is parsed into one shape. Union-find then merges findings transitively: same fingerprint (the key in the tree and in an old commit is one finding), same advisory in the same package (OSV, pip-audit and Trivy all reporting CVE-2020-14343 in pyyaml), and same CWE in the same file within 2 lines, closest pairs first and only across tools.",
            },
            {
                heading: "Block on what's new",
                body: "Findings are enriched with cached EPSS scores and the CISA KEV list, then diffed against main: on a PR only new findings block, old ones warn. policy.yaml blocks main at medium and above, and secrets and KEV-listed CVEs always block. Exit codes are 0 pass, 1 block, 2 error.",
            },
            {
                heading: "Signed or it doesn't run",
                body: "When gate 1 passes, the image is pushed by digest, signed keylessly with Cosign and given an SBOM attestation. In the cluster, Kyverno only admits signed images, then ZAP scans the running app through the TLS Ingress for gate 2.",
            },
            {
                heading: "Infrastructure as code, observable",
                body: "Terraform provisions AWS (IAM, ECR, S3) and Kubernetes; Helm deploys; Loki collects logs, Prometheus alerts and Grafana shows the whole pipeline.",
            },
        ],

        architecture: {
            bullets: [
                "GitHub Actions runs five scan jobs in parallel on every pull request.",
                "The Python aggregator dedupes, enriches and applies policy.yaml; gate 1 decides in under 2 minutes.",
                "Passing images are signed and attested; Kyverno admits only signed images into the cluster.",
                "ZAP runs baseline and API scans through the TLS Ingress for gate 2.",
            ],
        },

        exploded: {
            caption: "SecPipe, taken apart",
            parts: [
                { id: "infra", kind: "slab", size: [4.2, 0.34, 2.6], pos: [0, 0.17, 0], explode: [0, -0.9, 0], stage: 3, tone: "steel", label: "AWS + Kubernetes", note: "Terraform · Helm · Kyverno" },
                { id: "obs", kind: "ring", size: [2.35, 0.05, 0], pos: [0, 0.65, 0], explode: [0, -0.35, 0], stage: 3, tone: "blue", label: "Prometheus · Grafana · Loki", note: "alerts & logs" },
                { id: "scanners", kind: "rack", size: [3.4, 0.62, 1.9], pos: [0, 0.65, 0], explode: [-1.6, 0.2, 0.8], stage: 2, tone: "blue", label: "18 scanners", note: "secrets · SAST · SCA · IaC · build" },
                { id: "agg", kind: "slab", size: [3.0, 0.44, 1.7], pos: [0, 1.18, 0], explode: [1.6, 0.6, 0.8], stage: 1, tone: "garnet", label: "Python aggregator", note: "union-find · EPSS/KEV · policy" },
                { id: "gate", kind: "core", size: [1.7, 0.2, 1.7], pos: [0, 1.5, 0], explode: [0, 1.4, 0.6], stage: 1, tone: "gold", label: "Release gate", note: "Cosign + SBOM · fails closed" },
                { id: "ci", kind: "slab", size: [2.4, 0.26, 1.4], pos: [0, 1.73, 0], explode: [0, 2.5, 0], stage: 0, tone: "steel", label: "GitHub Actions", note: "runs on every PR" },
            ],
        },

        simulation: "secpipe",
        simIntro: "Open a pull request against the gate. Plant any of the 14 flaws from SecPipe's real vulnerable branch, watch which scanners catch them, step through the aggregator, and cut DAST's connection mid-scan to see it fail closed.",

        incidents: [
            {
                title: "ZAP passed a SQL injection it never tested",
                body: "DAST originally reached the app through kubectl port-forward. In one run the port-forward died 106 URLs in; ZAP kept going, every remaining probe got no answer, and rule 40018 (SQL injection) reported PASS. Gate 2 passed with a planted SQLi in the app. Now a scan checks GET /healthz before trusting its own report: a target that went silent is an error (exit 2, block), and CI scans through the TLS Ingress instead.",
            },
            {
                title: "The flaw no scanner can see",
                body: "Flaw #11 (no failed-login logging or rate limit) is invisible to every scanner by design, which is why it's the one of 14 not caught. It's covered by unit tests and runtime rules instead, and the page says so rather than pretending 14/14.",
            },
        ],

        runTable: {
            title: "Two real runs",
            rows: [
                ["Run 17 · vulnerable → main", "11,223 raw → 7,516 unique; 2,255 new & blocking (46 critical, 580 high); gate 1 BLOCK at 1 min 52 s, PR comment at 2 min 11 s"],
                ["Run 23 · main", "gate 1 passed at 70 s; image signed and attested by 107 s; Kyverno admitted it; 12/12 admission and NetworkPolicy tests; gate 2 passed at 537 s"],
                ["Run 22 · forced DAST", "ZAP reached 209 URLs through the Ingress, reported the SQL injection and the missing headers; gate 2 BLOCK"],
            ],
        },

        results: [
            { value: "-33%", label: "findings after dedupe (11,223 → 7,516)" },
            { value: "13/14", label: "planted OWASP Top 10 flaws caught, 11 by two or more tools" },
            { value: "1:52", label: "minutes to block a bad pull request" },
        ],

        lessons: [
            "Fail closed. A scan whose target went quiet proves nothing, so it must count as a failure.",
            "Dedupe is the product. Nobody reads 11,223 findings; people read one comment that says what's new.",
            "Be honest about blind spots. 13/14 with a named gap beats a suspicious 14/14.",
        ],
        annotation: { text: "fail closed: silence isn't a pass" },
    },

    "para-football": {
        slug: "para-football",
        title: "Para Football",
        codename: "Street Legend",
        tagline: "Kolkata street football in the browser: 3D, 120 Hz physics, and zero asset files.",
        villain: "Forgetting what street football felt like.",
        role: "Solo — game dev & game AI",
        timeline: "November 2026",
        stack: ["JavaScript", "three.js (WebGL)", "Web Audio API", "Procedural Generation"],
        tags: ["Game Dev", "Game AI"],
        links: {
            github: "https://github.com/Weasley18/kolkata-street-football",
            demo: "https://kolkata-street-football.netlify.app/",
            video: "https://drive.google.com/file/d/1-BquyWNJTeTR7irPc5sttwLCLjGqX9cy/view?usp=sharing",
        },
        video: { file: "para-football.mp4", title: "Para Football gameplay", embed: "https://drive.google.com/file/d/1-BquyWNJTeTR7irPc5sttwLCLjGqX9cy/view?usp=sharing" },

        hero: {
            type: "play",
            url: "https://kolkata-street-football.netlify.app/",
        },

        problem: "I wanted to bottle the feeling of a Kolkata para match (a narrow street, a scrappy ball, everyone joining in) into something you could open in a browser tab and be playing within seconds. No download, no loading bar, no asset pipeline.",

        approach: [
            {
                heading: "Lock the fun core loop first",
                body: "It went from concept to production in 5 hours. That only worked because I made the core loop fun first and left everything else until after.",
            },
            {
                heading: "Physics at 120 Hz",
                body: "The game steps its physics at a fixed 120 Hz, written by hand rather than pulled in from a physics engine, so the simulation doesn't depend on the display's frame rate.",
            },
            {
                heading: "CPU players with roles",
                body: "Each CPU kid picks a job from where the ball and his teammates are (press, carry, cover, mark, hold the shape, keep goal), with 3 difficulty tiers. The opposition plays positions instead of everyone chasing the ball.",
            },
            {
                heading: "Zero asset files",
                body: "The whole game is one web page. Textures are procedural, geometry is built in three.js, and every sound is synthesized live with the Web Audio API.",
            },
        ],

        simulation: "parafootball",
        simIntro: "The CPU brain from the game, flattened onto a tactics board and stepped at the same 120 Hz. Kick the ball anywhere and watch each kid pick his job.",

        results: [
            { value: "5 hrs", label: "from concept to production" },
            { value: "120 Hz", label: "fixed-step physics" },
            { value: "0", label: "asset files: one page, all procedural" },
        ],

        lessons: ["Lock the fun core loop first, then build everything else around it."],
        annotation: { text: "lock the fun core loop first" },
    },

    finsaathi: {
        slug: "finsaathi",
        title: "FinSaathi",
        codename: "Money Talks",
        tagline: "One backend, three specialized AI systems, one login.",
        villain: "Finance chatbots that guess at your numbers.",
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

        exploded: {
            caption: "FinSaathi, taken apart",
            parts: [
                { id: "pg", kind: "slab", size: [4.2, 0.34, 2.6], pos: [0, 0.17, 0], explode: [0, -0.9, 0], stage: 3, tone: "steel", label: "Prisma + Postgres", note: "27-model schema" },
                { id: "redis", kind: "disks", size: [0.5, 0.7, 0], pos: [1.2, 0.69, 0.2], explode: [1.8, -0.2, 0.6], stage: 2, tone: "garnet", label: "BullMQ + Redis", note: "jobs · translation cache" },
                { id: "chroma", kind: "disks", size: [0.6, 0.9, 0], pos: [-1.1, 0.79, 0.1], explode: [-1.8, -0.2, 0.5], stage: 2, tone: "blue", label: "ChromaDB", note: "one collection per advisor" },
                { id: "ml", kind: "rack", size: [3.0, 0.5, 1.7], pos: [0, 1.5, 0], explode: [-1.5, 0.6, 0.9], stage: 2, tone: "blue", label: "Python / FastAPI", note: "Isolation Forest · Prophet" },
                { id: "api", kind: "slab", size: [2.8, 0.42, 1.7], pos: [0, 1.96, 0], explode: [1.5, 1.0, 0.9], stage: 1, tone: "garnet", label: "Fastify API", note: "Node.js · TypeScript" },
                { id: "mcp", kind: "core", size: [1.6, 0.18, 1.6], pos: [0, 2.26, 0], explode: [0, 2.3, 0.4], stage: 0, tone: "gold", label: "MCP tool layer", note: "chat grounded in live data" },
            ],
        },

        lessons: [
            "Use the LLM for language and plain maths for maths: anomaly detection and forecasting run in Python, with heuristics as a fallback.",
            "Ground chat in tools, not memory: the MCP layer fetches the user's real transactions, budgets and goals for every answer.",
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
