/**
 * Converte uma lista de objetos em CSV e dispara o download no navegador.
 * columns: [{ key: 'name', label: 'Nome' }, ...] — define ordem e cabeçalho.
 */
export function exportToCSV(filename, rows, columns) {
    if (!rows || rows.length === 0) return;

    const header = columns.map((c) => escapeCsvValue(c.label)).join(";");
    const body = rows
        .map((row) => columns.map((c) => escapeCsvValue(row[c.key])).join(";"))
        .join("\n");

    // BOM (\uFEFF) garante acentuação correta ao abrir no Excel.
    const csvContent = "\uFEFF" + header + "\n" + body;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function escapeCsvValue(value) {
    const str = value === null || value === undefined ? "" : String(value);
    if (str.includes(";") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}
