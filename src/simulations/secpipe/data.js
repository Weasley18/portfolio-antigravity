// SecPipe simulation data.
//
// The 14 flaws, which tools catch them, and every number quoted here come
// from the SecPipe repo (README "What SecPipe catches" and "Results").
// The code snippets are short illustrations of each flaw, not the exact
// lines on the vulnerable branch.

export const jobs = [
    { id: 'secrets', name: 'secrets', tools: 'Gitleaks, full git history' },
    { id: 'sast', name: 'sast', tools: 'Semgrep + custom rules, Bandit' },
    { id: 'sca', name: 'sca', tools: 'OSV-Scanner, pip-audit, licences' },
    { id: 'iac', name: 'iac', tools: 'Checkov + custom policies, Trivy config, Kubescape, zizmor' },
    { id: 'build', name: 'build-scan', tools: 'Hadolint, Trivy image, Syft SBOM' },
];
export const SCAN_STAGES = jobs.map((j) => j.id);

export const flaws = [
    { n: 1, label: 'Fake AWS key and DB password', code: 'AWS_ACCESS_KEY_ID = "AKIA…EXAMPLE"   # also in git history', stages: ['secrets'], tools: ['Gitleaks', 'custom rules'], policy: 'secrets always block' },
    { n: 2, label: 'SQL built with an f-string', code: 'db.execute(f"SELECT * FROM notes WHERE title LIKE \'%{q}%\'")', stages: ['sast', 'dast'], tools: ['Semgrep taint rule', 'Bandit', 'ZAP active scan'] },
    { n: 3, label: 'IDOR on GET /notes/{id}', code: 'return db.get(Note, note_id)   # no owner check', stages: ['sast'], tools: ['Semgrep heuristic'], severity: 'high', note: 'A heuristic flags it; confirming broken access control still needs a human.' },
    { n: 4, label: 'JWT signature check off', code: 'jwt.decode(token, "secret123", options={"verify_signature": False})', stages: ['sast', 'secrets'], tools: ['Semgrep (custom)', 'Gitleaks (custom)'], severity: 'critical' },
    { n: 5, label: 'yaml.load on uploads', code: 'data = yaml.load(upload.file)', stages: ['sast'], tools: ['Semgrep (custom)', 'Bandit'] },
    { n: 6, label: 'SSRF in link previews', code: 'httpx.get(payload.url)   # whatever URL the user sends', stages: ['sast'], tools: ['Semgrep taint rule'] },
    { n: 7, label: 'subprocess with shell=True', code: 'subprocess.run(f"convert {name} out.pdf", shell=True)', stages: ['sast'], tools: ['Bandit', 'Semgrep'] },
    { n: 8, label: 'MD5 password hashing', code: 'hashlib.md5(password.encode()).hexdigest()', stages: ['sast'], tools: ['Semgrep (custom)', 'Bandit'] },
    { n: 9, label: 'Old libraries', code: 'PyYAML==5.3.1\nPyJWT==2.3.0', stages: ['sca', 'build'], tools: ['pip-audit', 'OSV-Scanner', 'Trivy'], severity: 'critical', note: 'pyyaml@5.3.1, CVE-2020-14343, EPSS 0.06: reported by three tools, merged into one finding.' },
    { n: 10, label: 'CORS * with credentials, debug tracebacks', code: 'allow_origins=["*"], allow_credentials=True, debug=True', stages: ['sast', 'dast'], tools: ['Semgrep (custom)', 'ZAP baseline + API scan'] },
    { n: 11, label: 'No failed-login logging or rate limit', code: '# login() returns 401 and forgets it ever happened', stages: [], tools: [], note: 'Invisible to scanners by design. Unit tests and the runtime rules cover it instead.' },
    { n: 12, label: 'Root user, end-of-life base, secret in ENV', code: 'FROM <end-of-life base>\nENV DB_PASSWORD=…\nADD . /app', stages: ['build'], tools: ['Hadolint', 'Trivy image + config', 'Checkov'], severity: 'high' },
    { n: 13, label: 'Public S3 bucket, SSH open to 0.0.0.0/0, IAM *', code: 'acl         = "public-read"\ncidr_blocks = ["0.0.0.0/0"]', stages: ['iac'], tools: ['Checkov + 2 custom checks', 'Trivy config'] },
    { n: 14, label: 'Privileged container on :latest', code: 'image: secnotes:latest\nsecurityContext:\n  privileged: true', stages: ['iac', 'admission'], tools: ['Kubescape', 'Checkov', 'Kyverno + PSA at admission'] },
];

export const realRuns = {
    vulnerable: {
        title: 'Real run 17 · vulnerable into main',
        rows: [
            ['Scanners', '18 (16 ran; Snyk and SonarCloud skip without a token)'],
            ['Findings', '11,223 raw → 7,516 unique after dedupe (−33%)'],
            ['Blocking, new vs main', '2,255 (46 critical, 580 high, 1,629 medium)'],
            ['Planted flaws caught', '13 of 14; 11 by two or more tools'],
            ['Time to decision', 'gate 1 blocked at 1 min 52 s; PR comment at 2 min 11 s'],
        ],
    },
    main: {
        title: 'Real run 23 · main',
        rows: [
            ['Gate 1', 'passed 70 s into the run'],
            ['Artifact', 'pushed by digest, signed keylessly and attested by 107 s'],
            ['Cluster', 'Kyverno admitted the signed image; 12/12 admission and NetworkPolicy tests'],
            ['DAST', 'ZAP through the TLS Ingress: baseline 23 URLs, API scan 207, nothing above informational'],
            ['Gate 2', 'passed at 537 s'],
        ],
    },
};

/* ---------- inside the aggregator ---------- */

// Illustrative raw findings in the shape the parsers produce.
export const rawFindings = [
    { id: 'f1', tool: 'osv-scanner', category: 'sca', title: 'pyyaml 5.3.1', pkg: 'pyyaml', advisory: 'CVE-2020-14343', severity: 'critical', where: 'requirements.txt' },
    { id: 'f2', tool: 'pip-audit', category: 'sca', title: 'PyYAML 5.3.1', pkg: 'PyYAML', advisory: 'CVE-2020-14343', severity: 'critical', where: 'requirements.txt' },
    { id: 'f3', tool: 'trivy', category: 'container', title: 'PyYAML 5.3.1 in the image', pkg: 'PyYAML', advisory: 'CVE-2020-14343', severity: 'critical', where: 'site-packages' },
    { id: 'f4', tool: 'bandit', category: 'sast', title: 'B324: md5 for security', file: 'auth.py', line: 41, cwe: 'CWE-327', severity: 'high' },
    { id: 'f5', tool: 'semgrep', category: 'sast', title: 'secnotes-md5-password', file: 'auth.py', line: 42, cwe: 'CWE-327', severity: 'medium' },
    { id: 'f6', tool: 'semgrep', category: 'sast', title: 'insecure-hash-md5', file: 'auth.py', line: 41, cwe: 'CWE-327', severity: 'medium' },
    { id: 'f7', tool: 'semgrep', category: 'sast', title: 'secnotes-sqli-fstring', file: 'notes.py', line: 88, cwe: 'CWE-89', severity: 'high' },
    { id: 'f8', tool: 'bandit', category: 'sast', title: 'B608: SQL built from strings', file: 'notes.py', line: 88, cwe: 'CWE-89', severity: 'medium' },
    { id: 'f9', tool: 'gitleaks', category: 'secret', title: 'Secret detected (aws-access-key)', file: 'config.py', line: 12, severity: 'critical', fingerprint: 'secret:aws-access-key:config.py:12' },
    { id: 'f10', tool: 'gitleaks', category: 'secret', title: 'Secret detected (aws-access-key), older commit', file: 'config.py', line: 12, severity: 'critical', fingerprint: 'secret:aws-access-key:config.py:12' },
];

export const aggSteps = [
    { id: 'parse', name: 'Parse and normalise', what: 'Every report becomes one shape. Package names are compared case-insensitively, with - _ and . treated alike.' },
    { id: 'exact', name: 'Rule 1 · same fingerprint', what: 'Category + CVE or rule + location. Gitleaks finds the key in the tree and in an old commit: one finding.' },
    { id: 'advisory', name: 'Rule 2 · same advisory, same package', what: 'OSV-Scanner, pip-audit and Trivy all report CVE-2020-14343 in pyyaml. Union-find makes the merge transitive.' },
    { id: 'code', name: 'Rule 3 · same CWE, same file, ≤ 2 lines', what: 'Closest pairs first, and only across tools: two results from one tool never merge, so one Semgrep rule stays separate.' },
    { id: 'enrich', name: 'Enrich', what: 'EPSS and the CISA KEV list, cached. pyyaml’s EPSS is 0.06, under the 0.1 bump threshold.' },
    { id: 'diff', name: 'Diff against main', what: 'On a PR only findings new against the base branch block; old ones warn.' },
    { id: 'policy', name: 'Apply policy.yaml', what: 'main blocks at medium and above; secrets and KEV-listed CVEs always block. Exit 0 pass, 1 block, 2 error.' },
];

export const sevRank = { low: 1, medium: 2, high: 3, critical: 4 };

/* ---------- DAST, fail closed ---------- */

export const dastModes = [
    {
        id: 'before',
        label: 'Before the fix: the port-forward dies',
        transport: 'kubectl port-forward',
        stopAt: 106,
        total: 209,
        log: [
            { text: 'zap api-scan → http://127.0.0.1:8080/openapi.json' },
            { text: 'kubectl port-forward: lost connection to pod', tone: 'bad' },
            { text: 'ZAP keeps going; every remaining probe gets no answer' },
            { text: 'rule 40018 SQL Injection: PASS (never actually tested)', tone: 'bad' },
            { text: 'report: 0 alerts above informational → gate 2 PASS', tone: 'bad' },
        ],
        outcome: { tone: 'bad', title: 'A planted SQL injection passed', body: 'This really happened (blind spot N4). With its target gone, ZAP “passed” every rule it could no longer test.' },
    },
    {
        id: 'silent',
        label: 'Now: the target goes silent',
        transport: 'TLS Ingress',
        stopAt: 120,
        total: 209,
        log: [
            { text: 'zap api-scan → https://secnotes.localtest.me:8443/openapi.json' },
            { text: 'target stops answering', tone: 'bad' },
            { text: 'scan finished; checking GET /healthz before trusting the report' },
            { text: 'target stopped answering during the api scan; failing closed', tone: 'warn' },
            { text: 'gate 2: scanner error → exit 2 → BLOCK', tone: 'good' },
        ],
        outcome: { tone: 'good', title: 'Failed closed', body: 'A scan whose target went quiet proves nothing, so it counts as a failure, not a pass. CI also scans through the TLS Ingress now, not a port-forward.' },
    },
    {
        id: 'healthy',
        label: 'Now: a healthy scan of the vulnerable app',
        transport: 'TLS Ingress',
        stopAt: 209,
        total: 209,
        log: [
            { text: 'zap api-scan → https://secnotes.localtest.me:8443/openapi.json' },
            { text: '40018 SQL Injection · /notes/search?q=\'  (flaw #2)', tone: 'bad' },
            { text: '90022 application error disclosure  (flaw #10)', tone: 'bad' },
            { text: '10021, 90004, 10035 missing security headers  (flaw #10)', tone: 'bad' },
            { text: 'GET /healthz 200 · 209 URLs reached · gate 2: BLOCK', tone: 'good' },
        ],
        outcome: { tone: 'good', title: 'Caught it for real', body: 'Forced run 22: ZAP reached 209 URLs through the Ingress and reported the SQL injection and the flaw #10 headers. Gate 2 blocked.' },
    },
];
