/**
 * Source audit — the mandatory gate before any extractor is written.
 *
 * The audit is READ-ONLY reconnaissance. It never scrapes content. It records:
 *  - robots.txt: reachable? does it allow our agent on the base path? crawl-delay?
 *  - terms & licence pages: reachable? (licence is confirmed by a human, not here)
 *  - access probe: for API/open-data sources, a SINGLE metadata request
 *  - the source's currency caveat and image-reuse policy
 * and always ends with `decision: needs_review` (or `blocked`). A human must read
 * the report and flip the registry's `extractorStatus` to "approved" before an
 * extractor may be built — one source at a time.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { AuditReport, IngestionRun } from "./schema";
import { getSource, assertNoProhibited } from "./registry";
import { getRobots, politeFetch, KNOWLEDGE_ROOT, USER_AGENT } from "./http";
import { isAllowed } from "./robots";
import type { z } from "zod";

const AUDIT_DIR = path.join(KNOWLEDGE_ROOT, "audits");
const LOG_DIR = path.join(KNOWLEDGE_ROOT, "logs");

function nowIso() {
  return new Date().toISOString();
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

async function appendLog(run: z.infer<typeof IngestionRun>) {
  await fs.mkdir(LOG_DIR, { recursive: true });
  const line = JSON.stringify(IngestionRun.parse(run)) + "\n";
  await fs.appendFile(path.join(LOG_DIR, "ingestion.jsonl"), line, "utf8");
}

/** Reachability probe that still obeys robots + rate limits. */
async function reachable(url: string | null, minDelayMs: number): Promise<boolean | null> {
  if (!url) return null;
  const r = await politeFetch(url, { minDelayMs, maxRetries: 1 });
  if (r.blockedByRobots || r.error) return r.status ? r.status < 400 : false;
  return r.ok;
}

export async function auditSource(sourceId: string): Promise<z.infer<typeof AuditReport>> {
  assertNoProhibited();
  const src = getSource(sourceId);
  if (!src) throw new Error(`Unknown source id "${sourceId}". See lib/knowledge/registry.ts.`);

  const run: z.infer<typeof IngestionRun> = {
    id: `${sourceId}-audit-${Date.now()}`,
    sourceId,
    kind: "audit",
    startedAt: nowIso(),
    finishedAt: null,
    status: "running",
    requests: 0,
    cacheHits: 0,
    itemsSeen: 0,
    itemsWritten: 0,
    robotsRespected: true,
    errors: [],
    notes: `agent=${USER_AGENT}`,
  };

  const findings: string[] = [];
  const decisionReasons: string[] = [];

  // 1) robots.txt
  const origin = new URL(src.baseUrls[0]).origin;
  const basePath = new URL(src.baseUrls[0]).pathname || "/";
  const rules = await getRobots(origin);
  run.requests++;
  let robotsBlock: z.infer<typeof AuditReport>["robots"];
  if (rules === "unreachable") {
    findings.push("robots.txt could not be fetched — cannot confirm crawl permission.");
    decisionReasons.push("robots.txt unreachable ⇒ not approvable yet.");
    robotsBlock = { url: src.robotsTxtUrl, fetched: false, httpStatus: null, allowsOurAgent: null, disallowRules: [], crawlDelaySeconds: null };
  } else {
    const allowed = isAllowed(rules, basePath);
    robotsBlock = {
      url: src.robotsTxtUrl,
      fetched: true,
      httpStatus: 200,
      allowsOurAgent: allowed,
      disallowRules: rules.disallow.slice(0, 40),
      crawlDelaySeconds: rules.crawlDelaySeconds,
    };
    findings.push(allowed ? `robots.txt allows ${basePath} for our agent.` : `robots.txt DISALLOWS ${basePath}.`);
    if (!allowed) decisionReasons.push("Base path disallowed by robots.txt ⇒ blocked.");
    if (rules.crawlDelaySeconds) findings.push(`Crawl-delay: ${rules.crawlDelaySeconds}s (will be honoured).`);
  }

  // 2) terms + licence reachability (never asserts a licence — that's a human call)
  const termsReachable = await reachable(src.termsUrl, src.rateLimit.minDelayMs);
  if (src.termsUrl) run.requests++;
  const licenceReachable = await reachable(src.licenceUrl, src.rateLimit.minDelayMs);
  if (src.licenceUrl) run.requests++;
  if (src.termsUrl) findings.push(`Terms page ${termsReachable ? "reachable" : "not reachable"}: ${src.termsUrl}`);
  else findings.push("No terms URL on record — must be located before extraction.");
  if (src.licence === "unknown" || src.licenceConfidence === "unconfirmed")
    decisionReasons.push("Licence unknown/unconfirmed ⇒ needs human confirmation before use.");

  // 3) access probe — ONE metadata request for API/open-data sources only
  let probeUrl: string | null = null;
  let probeStatus: number | null = null;
  let probeContentType: string | null = null;
  let sampleHash: string | null = null;
  if (src.accessMethod === "official_api" || src.accessMethod === "open_data_download" || src.accessMethod === "overpass_api") {
    probeUrl = src.apiDocsUrl ?? src.homepageUrl;
    const r = await politeFetch(probeUrl, { minDelayMs: src.rateLimit.minDelayMs, maxRetries: 1 });
    run.requests++;
    if (r.fromCache) run.cacheHits++;
    probeStatus = r.status;
    probeContentType = r.contentType;
    sampleHash = r.contentHash;
    if (r.error) run.errors.push({ at: nowIso(), message: r.error, url: probeUrl });
    findings.push(`Access probe (${probeUrl}) → ${r.status ?? "no response"}${r.blockedByRobots ? " [robots-blocked]" : ""}.`);
  } else {
    findings.push("HTML source — no content probe performed during audit (extractor design happens after approval).");
  }

  if (src.imageReuse !== "confirmed_allowed") {
    findings.push(`Image reuse = ${src.imageReuse}. Do NOT copy any images from this source without confirmed rights.`);
  }

  const report: z.infer<typeof AuditReport> = {
    sourceId: src.id,
    sourceName: src.name,
    auditedAt: nowIso(),
    reviewer: "automated-probe",
    robots: robotsBlock,
    terms: { url: src.termsUrl, reachable: termsReachable },
    licence: {
      url: src.licenceUrl,
      declared: src.licence,
      confidence: src.licenceConfidence,
      reuseImages: src.imageReuse,
    },
    access: {
      method: src.accessMethod,
      apiDocsUrl: src.apiDocsUrl,
      probeUrl,
      probeStatus,
      probeContentType,
      sampleHash,
    },
    currencyCaveat: src.currencyCaveat,
    findings,
    decision: decisionReasons.some((r) => r.includes("blocked")) ? "blocked" : "needs_review",
    decisionReasons: decisionReasons.length ? decisionReasons : ["No blockers found, but human sign-off is required before any extractor."],
  };

  const validated = AuditReport.parse(report);

  // Write JSON + human-readable Markdown
  await fs.mkdir(AUDIT_DIR, { recursive: true });
  const stem = path.join(AUDIT_DIR, `${src.id}-${today()}`);
  await fs.writeFile(stem + ".json", JSON.stringify(validated, null, 2), "utf8");
  await fs.writeFile(stem + ".md", renderMarkdown(validated, src.notes), "utf8");

  run.status = "success";
  run.finishedAt = nowIso();
  await appendLog(run);

  return validated;
}

function renderMarkdown(r: z.infer<typeof AuditReport>, notes: string): string {
  const yn = (v: boolean | null) => (v === null ? "unknown" : v ? "yes" : "no");
  return `# Source audit — ${r.sourceName}

- **Source id:** \`${r.sourceId}\`
- **Audited at:** ${r.auditedAt}
- **Reviewer:** ${r.reviewer}
- **Decision:** **${r.decision.toUpperCase()}**

## robots.txt
- URL: ${r.robots.url ?? "—"}
- Fetched: ${yn(r.robots.fetched)}
- Allows our agent on base path: ${yn(r.robots.allowsOurAgent)}
- Crawl-delay: ${r.robots.crawlDelaySeconds ?? "none"}
- Disallow rules (sample): ${r.robots.disallowRules.length ? r.robots.disallowRules.map((d) => `\`${d}\``).join(", ") : "none"}

## Terms & licence
- Terms URL: ${r.terms.url ?? "—"} (reachable: ${yn(r.terms.reachable)})
- Licence URL: ${r.licence.url ?? "—"}
- Declared licence: \`${r.licence.declared}\` (confidence: ${r.licence.confidence})
- Image reuse: **${r.licence.reuseImages}**

## Access
- Method: \`${r.access.method}\`
- API docs: ${r.access.apiDocsUrl ?? "—"}
- Probe: ${r.access.probeUrl ?? "—"} → ${r.access.probeStatus ?? "no response"}

## Currency caveat
> ${r.currencyCaveat}

## Findings
${r.findings.map((f) => `- ${f}`).join("\n")}

## Decision reasons
${r.decisionReasons.map((f) => `- ${f}`).join("\n")}

## Registry notes
> ${notes || "—"}

---
_This audit is read-only reconnaissance. No content was extracted. An extractor may be built **only** after a human confirms the licence, respects the caveats above, and sets \`extractorStatus: "approved"\` for this source in \`lib/knowledge/registry.ts\`._
`;
}
