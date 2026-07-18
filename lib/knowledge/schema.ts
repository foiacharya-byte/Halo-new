/**
 * Vadodara Knowledge Engine — data model.
 *
 * Governance principles encoded here (see lib/knowledge/README.md):
 *  - Every fact preserves its exact source URL.
 *  - Publication, update and fetch dates are stored SEPARATELY.
 *  - "Official" is not "current"; "publicly accessible" is not "openly licensed".
 *  - Government-/tourism-listed is an AUTHORITY, never Halo trust.
 *  - Community vouches are a separate signal, never merged into authority.
 *  - OpenStreetMap records stay `osmUnverified` until separately confirmed.
 *  - Conflicting values are never silently merged — they become RecordConflicts.
 *  - Missing fields are left absent; nothing is invented.
 */
import { z } from "zod";

/* ── primitives ──────────────────────────────────────────────────────────── */
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD");
export const IsoDateTime = z.string().datetime();

/** How data is obtained. `manual` = a human transcribed it from a document. */
export const AccessMethod = z.enum([
  "official_api",
  "open_data_download",
  "overpass_api",
  "html_extractor",
  "document_download",
  "manual",
]);
export type AccessMethod = z.infer<typeof AccessMethod>;

/** Never assume "open". Default is unknown; confidence is tracked separately. */
export const LicenceId = z.enum([
  "unknown",
  "all_rights_reserved",
  "gov_open_data_india", // GODL-India (data.gov.in default) — confirm per dataset
  "osm_odbl", // OpenStreetMap ODbL 1.0
  "cc_by_4",
  "cc_by_sa_4",
  "public_domain",
  "custom",
]);
export type LicenceId = z.infer<typeof LicenceId>;

export const LicenceConfidence = z.enum(["confirmed", "unconfirmed"]);

/** Image reuse defaults to prohibited/unknown; only "confirmed_allowed" permits use. */
export const ImageReuse = z.enum(["prohibited", "confirmed_allowed", "unknown"]);

/** What a record IS by origin. Deliberately has no "halo_trusted" member. */
export const AuthorityStatus = z.enum([
  "government_listed",
  "tourism_listed",
  "open_data",
  "osm_unverified",
  "postal_reference",
]);
export type AuthorityStatus = z.infer<typeof AuthorityStatus>;

/** Verification is separate from authority (and from community vouches). */
export const VerificationStatus = z.enum(["unverified", "source_confirmed"]);

/* ── provenance: attached to every fact and every record ─────────────────── */
export const Provenance = z.object({
  sourceId: z.string(),
  /** The exact URL the fact came from. Required — no fact without a source. */
  sourceUrl: z.string().url(),
  retrievalMethod: AccessMethod,
  /** When Halo fetched it (always known). */
  fetchedAt: IsoDateTime,
  /** When the SOURCE published it — separate from fetch/update; null if unstated. */
  publishedAt: IsoDate.nullable(),
  /** When the SOURCE last updated it — separate; null if unstated. */
  updatedAt: IsoDate.nullable(),
  licence: LicenceId,
  licenceConfidence: LicenceConfidence,
  httpStatus: z.number().int().nullable(),
  /** SHA-256 of the fetched payload the fact was derived from (for change detection). */
  contentHash: z.string().nullable(),
});
export type Provenance = z.infer<typeof Provenance>;

/** A single attributable field value. Absent facts are simply not present. */
export const Fact = z.object({
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  unit: z.string().nullable().default(null),
  provenance: Provenance,
});
export type Fact = z.infer<typeof Fact>;

/** Community trust — deliberately isolated from source authority. */
export const CommunityVouch = z.object({
  count: z.number().int().nonnegative().default(0),
  note: z.string().default("Independent of source authority; never blended in."),
});

export const KnowledgeRecord = z.object({
  id: z.string(),
  type: z.enum([
    "place",
    "facility",
    "helpline",
    "service",
    "office",
    "boundary",
    "dataset",
    "poi",
    "fact",
  ]),
  name: z.string(),
  authority: AuthorityStatus,
  verification: VerificationStatus.default("unverified"),
  /** OSM data must remain unverified until separately confirmed. */
  osmUnverified: z.boolean().default(false),
  /** Each fact carries its own provenance; the record aggregates them. */
  facts: z.array(Fact).default([]),
  primaryProvenance: Provenance,
  communityVouch: CommunityVouch.default({ count: 0 }),
  licence: LicenceId.default("unknown"),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type KnowledgeRecord = z.infer<typeof KnowledgeRecord>;

/** Conflicting values are recorded, never silently merged. */
export const RecordConflict = z.object({
  id: z.string(),
  recordId: z.string(),
  key: z.string(),
  values: z
    .array(
      z.object({
        value: z.unknown(),
        sourceId: z.string(),
        sourceUrl: z.string().url(),
        fetchedAt: IsoDateTime,
      })
    )
    .min(2),
  detectedAt: IsoDateTime,
  resolution: z.enum(["unresolved", "kept_both", "source_preferred", "manual"]).default("unresolved"),
  resolutionNote: z.string().default(""),
});
export type RecordConflict = z.infer<typeof RecordConflict>;

/* ── operational: ingestion logs and audit reports ──────────────────────── */
export const IngestionRun = z.object({
  id: z.string(),
  sourceId: z.string(),
  kind: z.enum(["audit", "fetch", "extract"]),
  startedAt: IsoDateTime,
  finishedAt: IsoDateTime.nullable(),
  status: z.enum(["running", "success", "partial", "failed", "skipped"]),
  requests: z.number().int().default(0),
  cacheHits: z.number().int().default(0),
  itemsSeen: z.number().int().default(0),
  itemsWritten: z.number().int().default(0),
  robotsRespected: z.boolean().default(true),
  errors: z
    .array(z.object({ at: IsoDateTime, message: z.string(), url: z.string().nullable() }))
    .default([]),
  notes: z.string().default(""),
});
export type IngestionRun = z.infer<typeof IngestionRun>;

export const AuditReport = z.object({
  sourceId: z.string(),
  sourceName: z.string(),
  auditedAt: IsoDateTime,
  reviewer: z.string().default("automated-probe"),
  robots: z.object({
    url: z.string().nullable(),
    fetched: z.boolean(),
    httpStatus: z.number().int().nullable(),
    /** null = unknown (e.g. unreachable). We never PROCEED on unknown. */
    allowsOurAgent: z.boolean().nullable(),
    disallowRules: z.array(z.string()).default([]),
    crawlDelaySeconds: z.number().nullable(),
  }),
  terms: z.object({ url: z.string().nullable(), reachable: z.boolean().nullable() }),
  licence: z.object({
    url: z.string().nullable(),
    declared: LicenceId,
    confidence: LicenceConfidence,
    reuseImages: ImageReuse,
  }),
  access: z.object({
    method: AccessMethod,
    apiDocsUrl: z.string().nullable(),
    probeUrl: z.string().nullable(),
    probeStatus: z.number().int().nullable(),
    probeContentType: z.string().nullable(),
    sampleHash: z.string().nullable(),
  }),
  currencyCaveat: z.string(),
  findings: z.array(z.string()).default([]),
  /** Defaults to needs_review: a human must approve before any extractor is built. */
  decision: z.enum(["approved", "needs_review", "blocked"]).default("needs_review"),
  decisionReasons: z.array(z.string()).default([]),
});
export type AuditReport = z.infer<typeof AuditReport>;

/* ── source registry entry ──────────────────────────────────────────────── */
export const SourceCategory = z.enum([
  "municipal",
  "district",
  "national_open_data",
  "smart_city",
  "osm",
  "postal",
  "tourism",
  "state_department",
]);

export const SourceRegistryEntry = z.object({
  id: z.string(),
  name: z.string(),
  authority: z.string(),
  category: SourceCategory,
  homepageUrl: z.string().url(),
  baseUrls: z.array(z.string().url()).min(1),
  accessMethod: AccessMethod,
  apiDocsUrl: z.string().url().nullable(),
  robotsTxtUrl: z.string().url().nullable(),
  termsUrl: z.string().url().nullable(),
  licenceUrl: z.string().url().nullable(),
  licence: LicenceId.default("unknown"),
  licenceConfidence: LicenceConfidence.default("unconfirmed"),
  imageReuse: ImageReuse.default("unknown"),
  /** "Official is not current." A human-readable caveat carried into provenance. */
  currencyCaveat: z.string(),
  rateLimit: z.object({
    minDelayMs: z.number().int().positive(),
    requestsPerMinute: z.number().int().positive(),
    respectCrawlDelay: z.literal(true),
  }),
  /** Gate: no extractor runs until this is `approved` by a human after audit. */
  extractorStatus: z
    .enum(["not_audited", "audited_pending_review", "approved", "blocked"])
    .default("not_audited"),
  /** Prohibited directories (Google Maps/Justdial/Sulekha) must never be added. */
  prohibited: z.boolean().default(false),
  notes: z.string().default(""),
});
export type SourceRegistryEntry = z.infer<typeof SourceRegistryEntry>;
