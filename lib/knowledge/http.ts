/**
 * Polite HTTP client for the Knowledge Engine.
 *
 * Guarantees:
 *  - A descriptive, contactable User-Agent (never impersonates a browser).
 *  - robots.txt is fetched and OBEYED before any content request. Unreachable or
 *    disallowed ⇒ we do not fetch.
 *  - Per-host rate limiting (max(min delay, robots Crawl-delay)).
 *  - Retries with exponential backoff on 429/5xx only.
 *  - On-disk content-addressed cache with a TTL (so audits/re-runs don't re-hit).
 *  - Never bypasses CAPTCHAs or authentication; a 401/403/CAPTCHA is a hard stop.
 */
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isAllowed, parseRobots, type RobotsRules } from "./robots";

export const USER_AGENT =
  "HaloVadodaraKnowledgeEngine/0.1 (+https://halo.local/knowledge; contact: foiacharya@gmail.com)";

export const KNOWLEDGE_ROOT = path.join(process.cwd(), "data", "knowledge");
const CACHE_DIR = path.join(KNOWLEDGE_ROOT, "cache");

export interface FetchResult {
  ok: boolean;
  status: number | null;
  contentType: string | null;
  body: string | null;
  fromCache: boolean;
  contentHash: string | null;
  fetchedAt: string;
  blockedByRobots: boolean;
  error: string | null;
}

const lastHostHit = new Map<string, number>();
const robotsCache = new Map<string, RobotsRules | "unreachable">();

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
function nowIso(): string {
  return new Date().toISOString();
}
async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Raw fetch with timeout; never throws. */
async function rawFetch(url: string, timeoutMs = 20000): Promise<Response | { error: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    return res;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}

/** Fetch + parse robots.txt for an origin, cached in-process. */
export async function getRobots(origin: string): Promise<RobotsRules | "unreachable"> {
  if (robotsCache.has(origin)) return robotsCache.get(origin)!;
  const res = await rawFetch(new URL("/robots.txt", origin).toString(), 12000);
  let rules: RobotsRules | "unreachable";
  if ("error" in res || res.status >= 500) rules = "unreachable";
  else if (res.status === 404) rules = { disallow: [], allow: [], crawlDelaySeconds: null }; // no robots ⇒ allowed
  else if (res.status >= 400) rules = "unreachable";
  else rules = parseRobots(await res.text(), USER_AGENT);
  robotsCache.set(origin, rules);
  return rules;
}

async function respectRate(host: string, minDelayMs: number, crawlDelaySeconds: number | null) {
  const need = Math.max(minDelayMs, (crawlDelaySeconds ?? 0) * 1000);
  const last = lastHostHit.get(host) ?? 0;
  const wait = last + need - Date.now();
  if (wait > 0) await sleep(wait);
  lastHostHit.set(host, Date.now());
}

export interface PoliteOptions {
  minDelayMs: number;
  maxRetries?: number;
  cacheTtlMs?: number;
  /** If true, skip the robots check (ONLY used to fetch robots.txt itself). */
  isRobotsFile?: boolean;
}

/**
 * The one entry point every extractor/audit must use. Obeys robots, rate limits,
 * retries, and caches. Returns a structured result; never throws.
 */
export async function politeFetch(url: string, opts: PoliteOptions): Promise<FetchResult> {
  const { minDelayMs, maxRetries = 3, cacheTtlMs = 24 * 60 * 60 * 1000, isRobotsFile = false } = opts;
  const u = new URL(url);
  const base: FetchResult = {
    ok: false,
    status: null,
    contentType: null,
    body: null,
    fromCache: false,
    contentHash: null,
    fetchedAt: nowIso(),
    blockedByRobots: false,
    error: null,
  };

  // Cache read
  await ensureDir(CACHE_DIR);
  const cacheFile = path.join(CACHE_DIR, sha256(url) + ".json");
  try {
    const cached = JSON.parse(await fs.readFile(cacheFile, "utf8"));
    if (Date.now() - new Date(cached.fetchedAt).getTime() < cacheTtlMs) {
      return { ...cached, fromCache: true };
    }
  } catch {
    /* cache miss */
  }

  // robots gate (skip only for robots.txt fetches)
  let crawlDelay: number | null = null;
  if (!isRobotsFile) {
    const rules = await getRobots(u.origin);
    if (rules === "unreachable") {
      return { ...base, blockedByRobots: true, error: "robots.txt unreachable — refusing to fetch" };
    }
    if (!isAllowed(rules, u.pathname)) {
      return { ...base, blockedByRobots: true, error: `Disallowed by robots.txt: ${u.pathname}` };
    }
    crawlDelay = rules.crawlDelaySeconds;
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await respectRate(u.host, minDelayMs, crawlDelay);
    const res = await rawFetch(url);
    if ("error" in res) {
      if (attempt === maxRetries) return { ...base, error: res.error, fetchedAt: nowIso() };
      await sleep(minDelayMs * Math.pow(2, attempt));
      continue;
    }
    const status = res.status;
    // Hard stops — never retry, never bypass.
    if (status === 401 || status === 403) {
      return { ...base, status, error: "Authentication/authorization required — hard stop (no bypass).", fetchedAt: nowIso() };
    }
    if (status === 429 || status >= 500) {
      if (attempt === maxRetries) return { ...base, status, error: `Server said ${status}`, fetchedAt: nowIso() };
      await sleep(minDelayMs * Math.pow(2, attempt));
      continue;
    }
    const contentType = res.headers.get("content-type");
    const body = await res.text();
    const result: FetchResult = {
      ok: status >= 200 && status < 300,
      status,
      contentType,
      body,
      fromCache: false,
      contentHash: sha256(body),
      fetchedAt: nowIso(),
      blockedByRobots: false,
      error: status >= 200 && status < 300 ? null : `HTTP ${status}`,
    };
    // Cache write (best-effort)
    try {
      await fs.writeFile(cacheFile, JSON.stringify(result), "utf8");
    } catch {
      /* ignore */
    }
    return result;
  }
  return base;
}
