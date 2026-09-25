import { KeyRound } from "lucide-react";

/**
 * A simplified ER-style illustration: each table renders as a stacked card
 * of field names, with the first field treated as the primary key.
 */
const DBSchemaDiagram = ({ tables = [] }) => (
    <div className="flex flex-wrap justify-center gap-4">
        {tables.map((table) => (
            <div
                key={table.name}
                className="w-40 md:w-44 rounded-lg border border-border bg-bg-elevated shadow-paper overflow-hidden shrink-0"
            >
                <div className="bg-accent-coolSoft text-accent-cool font-mono text-xs font-semibold px-3 py-2 border-b border-border">
                    {table.name}
                </div>
                <ul className="divide-y divide-border/70">
                    {table.fields.map((field, i) => (
                        <li key={field} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono text-text-secondary">
                            {i === 0 ? (
                                <KeyRound size={10} className="text-accent-warm shrink-0" />
                            ) : (
                                <span className="w-2.5 shrink-0" />
                            )}
                            {field}
                        </li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
);

export default DBSchemaDiagram;
