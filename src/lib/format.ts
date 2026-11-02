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
 * Formats a proposal or job reference into a short tag (e.g. #JOB-0001).
 */
export function formatJobRef(id: string): string {
  if (!id) return "JOB-0001";
  const clean = id.trim().toLowerCase();
  const demoMatch = clean.match(/00000000-0000-0000-0000-00000000000([0-9]+)/);
  if (demoMatch) {
    return `JOB-${demoMatch[1].padStart(4, "0")}`;
  }
  const lastSegment = clean.split("-").pop() || "";
  const num = parseInt(lastSegment, 10);
  if (/^[0-9]+$/.test(lastSegment) && !isNaN(num) && num > 0 && num < 10000) {
    return `JOB-${String(num).padStart(4, "0")}`;
  }
  const hexOnly = clean.replace(/[^0-9a-f]/g, "");
  return `JOB-${(hexOnly.slice(0, 8) || "0001").toUpperCase()}`;
}

/**
 * Generates a clean URL-friendly slug from a job title.
 */
export function formatJobSlug(title: string): string {
  if (!title) return "opportunity";
  return encodeURIComponent(
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80),
  );
}

/**
 * Returns a human-friendly SEO job URL including the encoded title slug.
 * e.g. /jobs/00000000-0000-0000-0000-000000000003-full-stack-ai-copilot-real-time-prompt-engineering
 */
export function getJobUrl(job: { id: string; title?: string }): string {
  if (!job.id) return "/jobs";
  if (!job.title) return `/jobs/${job.id}`;
  const slug = formatJobSlug(job.title);
  return `/jobs/${job.id}-${slug}`;
}

/**
 * Extracts the canonical UUID from an incoming route param that may contain an appended slug.
 * e.g., "00000000-0000-0000-0000-000000000003-full-stack-ai-copilot..." -> "00000000-0000-0000-0000-000000000003"
 */
export function extractJobId(param: string): string {
  if (!param) return "";
  const uuidMatch = param.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  );
  return uuidMatch ? uuidMatch[0] : param;
}

/**
 * Formats a proposal or job reference into a short tag.
 */
export function formatShortRef(prefix: string, id: string): string {
  if (!id) return `${prefix}-0001`;
  const clean = id.replace(/[^0-9a-f]/gi, "");
  return `${prefix}-${clean.slice(0, 6).toUpperCase()}`;
}

/**
 * Returns a human-friendly relative time string (e.g., "Just now", "2h ago", "3d ago").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
