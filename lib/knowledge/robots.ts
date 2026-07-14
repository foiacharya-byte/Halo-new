/**
 * Minimal, conservative robots.txt evaluation.
 *
 * Philosophy: when in doubt, DISALLOW. We never bypass robots; if a robots file
 * is unreachable or unparseable, callers must treat the target as not-allowed
 * until a human decides otherwise.
 */
export interface RobotsRules {
  /** Rules that apply to our user-agent (or `*`). */
  disallow: string[];
  allow: string[];
  crawlDelaySeconds: number | null;
}

/** Parse robots.txt text, selecting the group for our agent (falling back to `*`). */
export function parseRobots(text: string, userAgent: string): RobotsRules {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/#.*$/, "").trim());
  const groups: { agents: string[]; disallow: string[]; allow: string[]; crawlDelay: number | null }[] = [];
  let current: (typeof groups)[number] | null = null;
  let lastWasAgent = false;

  for (const line of lines) {
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      if (!lastWasAgent || !current) {
        current = { agents: [], disallow: [], allow: [], crawlDelay: null };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (field === "disallow") current.disallow.push(value);
    else if (field === "allow") current.allow.push(value);
    else if (field === "crawl-delay") {
      const n = Number(value);
      if (!Number.isNaN(n)) current.crawlDelay = n;
    }
  }

  const ua = userAgent.toLowerCase();
  const specific = groups.find((g) => g.agents.some((a) => a !== "*" && ua.includes(a)));
  const star = groups.find((g) => g.agents.includes("*"));
  const chosen = specific ?? star;
  if (!chosen) return { disallow: [], allow: [], crawlDelaySeconds: null };
  return {
    disallow: chosen.disallow.filter(Boolean),
    allow: chosen.allow.filter(Boolean),
    crawlDelaySeconds: chosen.crawlDelay,
  };
}

/** Longest-match Allow/Disallow decision for a path. Empty Disallow = allow all. */
export function isAllowed(rules: RobotsRules, path: string): boolean {
  const match = (pattern: string): number => {
    if (pattern === "") return -1; // an empty Disallow means "allow everything"
    // Very small glob: `*` wildcard, `$` end-anchor. Good enough for gov sites.
    const re = new RegExp(
      "^" +
        pattern
          .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
          .replace(/\*/g, ".*")
          .replace(/\\\$$/, "$") +
        (pattern.endsWith("$") ? "" : "")
    );
    return re.test(path) ? pattern.replace(/\*/g, "").length : -1;
  };
  let bestAllow = -1;
  let bestDisallow = -1;
  for (const a of rules.allow) bestAllow = Math.max(bestAllow, match(a));
  for (const d of rules.disallow) bestDisallow = Math.max(bestDisallow, match(d));
  if (bestDisallow === -1) return true;
  return bestAllow >= bestDisallow;
}
