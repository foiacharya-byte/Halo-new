/**
 * CLI: audit a single registered source (read-only reconnaissance).
 *
 *   npx tsx scripts/knowledge/audit-source.ts <sourceId>
 *   npx tsx scripts/knowledge/audit-source.ts --list
 *
 * Writes an audit report to data/knowledge/audits/<id>-<date>.{json,md} and an
 * ingestion log line to data/knowledge/logs/ingestion.jsonl. It NEVER extracts
 * content and NEVER approves a source — a human must read the report and set
 * `extractorStatus: "approved"` in lib/knowledge/registry.ts.
 */
import { SOURCES, assertNoProhibited } from "../../lib/knowledge/registry";
import { auditSource } from "../../lib/knowledge/audit";

function list() {
  assertNoProhibited();
  console.log("\nRegistered Knowledge-Engine sources:\n");
  for (const s of SOURCES) {
    console.log(
      `  ${s.id.padEnd(26)} ${s.extractorStatus.padEnd(22)} ${s.accessMethod.padEnd(20)} ${s.name}`
    );
  }
  console.log("\nAudit one with:  npx tsx scripts/knowledge/audit-source.ts <sourceId>\n");
}

async function main() {
  const arg = process.argv[2];
  if (!arg || arg === "--list" || arg === "-l") {
    list();
    if (!arg) console.log("(no source id given — nothing audited)\n");
    return;
  }
  try {
    console.log(`\nAuditing "${arg}" — read-only, robots-respecting…\n`);
    const report = await auditSource(arg);
    console.log(`Decision: ${report.decision.toUpperCase()}`);
    console.log("Findings:");
    for (const f of report.findings) console.log("  - " + f);
    console.log(`\nReport written to data/knowledge/audits/${report.sourceId}-*.md`);
    console.log("A human must confirm the licence + caveats and approve before any extractor is built.\n");
  } catch (e) {
    console.error("Audit failed:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  }
}

void main();
