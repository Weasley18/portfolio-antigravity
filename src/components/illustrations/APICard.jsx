const METHOD_CLASSES = {
    GET: "bg-accent-coolSoft text-accent-cool",
    POST: "bg-accent-warmSoft text-accent-warm",
    PUT: "bg-accent-coolSoft text-accent-cool",
    DELETE: "bg-accent-warmSoft text-accent-warm",
};

/**
 * A request/response illustration: method badge + endpoint, then a
 * JSON-styled request body and response with a status chip.
 */
const APICard = ({ method = "GET", endpoint, request, response, status = 200 }) => (
    <div className="rounded-xl border border-border bg-bg-elevated shadow-paper overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-secondary/60">
            <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${METHOD_CLASSES[method] || METHOD_CLASSES.GET}`}>
                {method}
            </span>
            <span className="font-mono text-xs md:text-sm text-ink truncate">{endpoint}</span>
            <span className="ml-auto font-mono text-[11px] text-sage">{status}</span>
        </div>
        <div className="px-4 py-3 space-y-3">
            <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary mb-1">Request</p>
                <pre className="font-mono text-[11px] md:text-xs text-text-primary overflow-x-auto">{request}</pre>
            </div>
            <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-secondary mb-1">Response</p>
                <pre className="font-mono text-[11px] md:text-xs text-sage overflow-x-auto">{response}</pre>
            </div>
        </div>
    </div>
);

export default APICard;
