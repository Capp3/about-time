/**
 * Export utilities for Broadcast Timekeeper
 * Uses SheetJS (xlsx) for Excel export — install with:
 *   npm install xlsx
 */
import * as XLSX from "xlsx";

export function exportToCSV(rows: Record<string, any>[], filename: string): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => {
        const val = String(row[h] ?? "").replace(/"/g, '\\"');
        return val.includes(",") || val.includes("\n") ? `"${val}"` : val;
      }).join(",")
    ),
  ];
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

export function exportToExcel(rows: Record<string, any>[], filename: string): void {
  if (!rows.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Timesheet");

  // Auto-width columns
  const colWidths = Object.keys(rows[0]).map(key => ({
    wch: Math.max(key.length, ...rows.map(r => String(r[key] ?? "").length)) + 2,
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
