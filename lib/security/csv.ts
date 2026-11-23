/**
 * Formula-safe CSV cell escaping (client + server isomorphic).
 * Neutralizes spreadsheet formula injection (=, +, -, @, tab, CR).
 */
export function escapeCsvCell(
  value: string | number | null | undefined
): string {
  const raw = String(value ?? "");
  const neutralized = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  const escaped = neutralized.replace(/"/g, '""');
  return `"${escaped}"`;
}
