export default function Table({ columns, children, empty }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                    <tr className="border-b border-line bg-paper-dim/60">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`whitespace-nowrap px-4 py-3 font-medium text-ink-soft ${col.className || ""}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-line">{children}</tbody>
            </table>
            {empty}
        </div>
    );
}
