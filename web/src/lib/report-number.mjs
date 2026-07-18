/**
 * Extract the report number from a tracker Report cell without depending on
 * Node-only modules, so the helper is safe in both server and client code.
 *
 * The markdown link target is authoritative because labels are presentation
 * text and can drift (or say "Report" instead of the numeric id). Tolerate the
 * legacy shapes the tracker has used over time: markdown links, raw report
 * paths/filenames, and a bare numeric value.
 *
 * @param {string} report
 * @returns {string | null}
 */
export function parseReportNumber(report) {
  const value = String(report ?? "").trim();
  if (!value) return null;

  const markdownTarget = value.match(/\]\([^)]*[\\/](\d+)(?:-[^\\/)]*)?\.md(?:#[^)]*)?\)/i);
  if (markdownTarget) return String(parseInt(markdownTarget[1], 10));

  const rawPath = value.match(/(?:^|[\\/])(\d+)(?:-[^\\/]*)?\.md(?:#\S*)?$/i);
  if (rawPath) return String(parseInt(rawPath[1], 10));

  const numericLabel = value.match(/^\s*\[(\d+)\]/);
  if (numericLabel) return String(parseInt(numericLabel[1], 10));

  const bare = value.match(/^#?(\d+)$/);
  return bare ? String(parseInt(bare[1], 10)) : null;
}
