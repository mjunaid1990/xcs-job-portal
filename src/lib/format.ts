/**
 * Formats UUIDs or database IDs into clean, human-readable reference codes.
 * e.g., 20000000-0000-0000-0000-000000000001 -> CNT-0001
 * e.g., standard random UUID -> CNT-8A2F1C4B
 */
export function formatContractRef(id: string): string {
  if (!id) return "CNT-0001";

  // Clean hyphens
  const clean = id.trim().toLowerCase();

  // Match demo sequential UUIDs like 20000000-0000-0000-0000-000000000001
  const demoMatch = clean.match(/20000000-0000-0000-0000-00000000000([0-9]+)/);
  if (demoMatch) {
    return `CNT-${demoMatch[1].padStart(4, "0")}`;
  }

  // Check ending number if mostly zeroes
  const lastSegment = clean.split("-").pop() || "";
  const num = parseInt(lastSegment, 10);
  if (/^0+[0-9]+$/.test(lastSegment) && !isNaN(num) && num > 0 && num < 10000) {
    return `CNT-${String(num).padStart(4, "0")}`;
  }

  // Fallback: take first 8 hex characters uppercase
  const hexOnly = clean.replace(/[^0-9a-f]/g, "");
  return `CNT-${(hexOnly.slice(0, 8) || "0001").toUpperCase()}`;
}

/**
 * Formats a proposal or job reference into a short tag.
 */
export function formatShortRef(prefix: string, id: string): string {
  if (!id) return `${prefix}-0001`;
  const clean = id.replace(/[^0-9a-f]/gi, "");
  return `${prefix}-${clean.slice(0, 6).toUpperCase()}`;
}
