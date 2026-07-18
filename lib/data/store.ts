// In-memory data layer for the Halo MVP.
//
// This is the single seam between the product and its persistence. It runs on
// seed data out of the box so the whole directory — search, listings, vouches,
// submissions, moderation — is functional with zero configuration. In
// production this module is where a Supabase-backed adapter plugs in (see
// lib/db/schema.sql for the matching Postgres schema and RLS model). Public
// mappers here guarantee a raw contributor/listing phone number is NEVER
// shipped to the client.

import { AREAS, ALL_VADODARA, getAreaById } from "./areas";
import { CATEGORIES, getCategoryById } from "./categories";
import { SEED_CANDIDATES, SEED_LISTINGS, SEED_MATRIX, SEED_VOUCHES } from "./seed";
import type {
  CommunicationPreference,
  EarlyAccessReason,
  EarlyAccessRecord,
  ExperienceSignals,
  Listing,
  ListingSubmission,
  ProviderClaim,
  PublicState,
  SearchLog,
  Vouch,
} from "./types";
import { phoneHash } from "../phone";
import { parseQuery, expandBranches, type SearchBranch, type ParsedQuery } from "../search/parser";

// --- Mutable store (module-level; resets on server restart) ---------------
const db = {
  listings: [...SEED_LISTINGS] as Listing[],
  vouches: [...SEED_VOUCHES] as Vouch[],
  submissions: [] as ListingSubmission[],
  claims: [] as ProviderClaim[],
  searchLogs: [] as SearchLog[],
  seedMatrix: [...SEED_MATRIX],
  seedCandidates: [...SEED_CANDIDATES],
  earlyAccess: [] as EarlyAccessRecord[],
};

let idCounter = 1000;
function nextId(prefix: string): string {
  return `${prefix}_${idCounter++}_${Math.random().toString(36).slice(2, 8)}`;
}

// --- Trust computation -----------------------------------------------------
export const SUMMARY_MIN_VOUCHES = 5; // full five-signal summary threshold
export const DIMENSION_MIN_ANSWERS = 3; // per-dimension threshold

export function approvedVouchesFor(listingId: string): Vouch[] {
  return db.vouches.filter((v) => v.listingId === listingId && v.moderationStatus === "approved");
}

export function computePublicState(listing: Listing): PublicState {
  const hasVouches = approvedVouchesFor(listing.id).length > 0;
  if (hasVouches) return "community_vouched";
  return "public_listing";
}

export interface SignalSummary {
  ready: boolean; // threshold met for the full summary
  vouchCount: number;
  dimensions: {
    key: keyof ExperienceSignals;
    label: string;
    average: number | null; // null when below per-dimension threshold
    answers: number;
  }[];
  wouldUseAgain: { yes: number; no: number; notSure: number } | null;
}

const DIMENSION_LABELS: { key: keyof ExperienceSignals; label: string }[] = [
  { key: "reliability", label: "Reliability" },
  { key: "workQuality", label: "Quality of work" },
  { key: "communicationPunctuality", label: "Communication & punctuality" },
  { key: "priceClarity", label: "Price clarity" },
  { key: "respectfulness", label: "Respectfulness" },
];

export function computeSignalSummary(listingId: string): SignalSummary {
  const vouches = approvedVouchesFor(listingId);
  const count = vouches.length;
  const ready = count >= SUMMARY_MIN_VOUCHES;

  const dimensions = DIMENSION_LABELS.map(({ key, label }) => {
    const values = vouches.map((v) => v.signals[key]).filter((n) => typeof n === "number");
    const answers = values.length;
    const average = answers >= DIMENSION_MIN_ANSWERS ? values.reduce((a, b) => a + b, 0) / answers : null;
    return { key, label, average, answers };
  });

  let wouldUseAgain: SignalSummary["wouldUseAgain"] = null;
  if (ready) {
    wouldUseAgain = {
      yes: vouches.filter((v) => v.wouldUseAgain === "yes").length,
      no: vouches.filter((v) => v.wouldUseAgain === "no").length,
      notSure: vouches.filter((v) => v.wouldUseAgain === "not_sure").length,
    };
  }

  return { ready, vouchCount: count, dimensions, wouldUseAgain };
}

// Derive the "why people used this service" chips from approved use contexts.
export function useReasons(listingId: string, limit = 6): string[] {
  const vouches = approvedVouchesFor(listingId);
  const seen = new Set<string>();
  const reasons: string[] = [];
  for (const v of vouches) {
    const key = v.useContext.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      reasons.push(v.useContext.trim());
    }
  }
  return reasons.slice(0, limit);
}

// --- Public DTOs (safe to ship to the client) ------------------------------
export interface PublicContact {
  contactType: string;
  maskedValue: string;
  isPublic: boolean;
  whatsapp?: boolean;
  verificationStatus: string;
  // NOTE: fullValue is intentionally omitted. Reveal via a server action.
}

export interface PublicListing {
  id: string;
  slug: string;
  displayName: string;
  description?: string;
  primaryArea: { id: string; name: string; slug: string } | null;
  serviceAreas: { id: string; name: string }[];
  categories: { id: string; name: string; slug: string; riskLevel: string }[];
  primaryCategory: { id: string; name: string; slug: string; riskLevel: string } | null;
  publicState: PublicState;
  businessManaged: boolean;
  vouchCount: number;
  useReasons: string[];
  hasPublicContact: boolean;
  contactPreview: PublicContact | null;
  updatedLabel: string;
  sourceRefs: { sourceType: string; sourceUrl?: string }[];
  googlePlaceId?: string;
}

function monthYearLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", { month: "long", year: "numeric" });
}

export function toPublicListing(listing: Listing): PublicListing {
  const publicState = computePublicState(listing);
  const primaryArea = getAreaById(listing.primaryAreaId);
  const primaryCat = getCategoryById(listing.categoryIds[0]);
  const publicContact = listing.contacts.find((c) => c.isPublic) ?? null;

  return {
    id: listing.id,
    slug: listing.slug,
    displayName: listing.displayName,
    description: listing.description,
    primaryArea: primaryArea
      ? { id: primaryArea.id, name: primaryArea.canonicalName, slug: primaryArea.slug }
      : null,
    serviceAreas: listing.serviceAreaIds
      .map((id) => getAreaById(id))
      .filter(Boolean)
      .map((a) => ({ id: a!.id, name: a!.canonicalName })),
    categories: listing.categoryIds
      .map((id) => getCategoryById(id))
      .filter(Boolean)
      .map((c) => ({ id: c!.id, name: c!.name, slug: c!.slug, riskLevel: c!.riskLevel })),
    primaryCategory: primaryCat
      ? { id: primaryCat.id, name: primaryCat.name, slug: primaryCat.slug, riskLevel: primaryCat.riskLevel }
      : null,
    publicState,
    businessManaged: listing.businessManaged,
    vouchCount: approvedVouchesFor(listing.id).length,
    useReasons: useReasons(listing.id),
    hasPublicContact: !!publicContact,
    contactPreview: publicContact
      ? {
          contactType: publicContact.contactType,
          maskedValue: publicContact.maskedValue,
          isPublic: publicContact.isPublic,
          whatsapp: publicContact.whatsapp,
          verificationStatus: publicContact.verificationStatus,
        }
      : null,
    updatedLabel: monthYearLabel(listing.updatedAt),
    sourceRefs: listing.sourceRefs.map((s) => ({ sourceType: s.sourceType, sourceUrl: s.sourceUrl })),
    googlePlaceId: listing.googlePlaceId,
  };
}

export interface PublicVouch {
  id: string;
  contributorDisplay: string;
  useContext: string;
  usefulDetail: string;
  usedLabel: string;
  areaName: string | null;
  wouldUseAgain: string;
  monthYear: string;
}

const RECENCY_LABELS: Record<string, string> = {
  within_month: "Within the last month",
  "1_3_months": "1–3 months ago",
  "3_6_months": "3–6 months ago",
  "6_12_months": "6–12 months ago",
  over_year: "More than a year ago",
};

export function toPublicVouch(v: Vouch): PublicVouch {
  const area = v.usedAreaId ? getAreaById(v.usedAreaId) : undefined;
  const wua = v.wouldUseAgain === "yes" ? "Yes" : v.wouldUseAgain === "no" ? "No" : "Not sure";
  return {
    id: v.id,
    contributorDisplay: v.contributorDisplay,
    useContext: v.useContext,
    usefulDetail: v.usefulDetail,
    usedLabel: RECENCY_LABELS[v.usedRecency] ?? v.usedRecency,
    areaName: area?.canonicalName ?? null,
    wouldUseAgain: wua,
    monthYear:
      v.usedMonth && v.usedYear
        ? new Date(v.usedYear, v.usedMonth - 1).toLocaleString("en-IN", { month: "long", year: "numeric" })
        : monthYearLabel(v.approvedAt ?? v.submittedAt),
  };
}

// --- Lookups ---------------------------------------------------------------
export function getListingBySlug(slug: string): Listing | undefined {
  return db.listings.find((l) => l.slug === slug);
}
export function getListingById(id: string): Listing | undefined {
  return db.listings.find((l) => l.id === id);
}

export function getPublicListingBySlug(slug: string): PublicListing | undefined {
  const l = getListingBySlug(slug);
  return l ? toPublicListing(l) : undefined;
}

export function getApprovedPublicVouches(listingId: string): PublicVouch[] {
  return approvedVouchesFor(listingId)
    .sort((a, b) => (b.approvedAt ?? "").localeCompare(a.approvedAt ?? ""))
    .map(toPublicVouch);
}

// Reveal a full public number — only for genuinely public/permitted contacts.
export function revealPublicNumber(listingId: string): string | null {
  const l = getListingById(listingId);
  if (!l) return null;
  const c = l.contacts.find((c) => c.isPublic && c.verificationStatus !== "unverified");
  return c ? c.fullValue : null;
}

// --- Search + ranking ------------------------------------------------------
export interface SearchResult {
  parsed: ParsedQuery;
  branches: SearchBranch[];
  requiresBranchSelection: boolean;
  results: PublicListing[];
  groupedResults?: { label: string; results: PublicListing[] }[];
}

function listingMatchesBranch(listing: Listing, branch: SearchBranch): boolean {
  if (branch.categoryId && !listing.categoryIds.includes(branch.categoryId)) {
    // Also allow child categories when a top-level group is requested.
    const cat = getCategoryById(branch.categoryId);
    const childIds = CATEGORIES.filter((c) => c.parentId === branch.categoryId).map((c) => c.id);
    const matchesChild = listing.categoryIds.some((id) => childIds.includes(id));
    if (!(cat && matchesChild)) return false;
  }
  if (branch.areaId && branch.areaId !== ALL_VADODARA.id) {
    const inArea =
      listing.primaryAreaId === branch.areaId || listing.serviceAreaIds.includes(branch.areaId);
    if (!inArea) return false;
  }
  if (branch.nameTerms && branch.nameTerms.length) {
    const name = listing.displayName.toLowerCase();
    const anyHit = branch.nameTerms.some((t) => name.includes(t));
    if (!anyHit) return false;
  }
  return true;
}

// Fuzzy name score for provider-name ranking (0..1, higher is better).
function nameScore(listing: Listing, terms: string[]): number {
  if (!terms.length) return 0;
  const name = listing.displayName.toLowerCase();
  let hits = 0;
  for (const t of terms) if (name.includes(t)) hits++;
  return hits / terms.length;
}

const CONFIDENCE_RANK: Record<string, number> = {
  manually_verified: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function rankListings(
  listings: Listing[],
  branch: SearchBranch,
  parsed: ParsedQuery
): Listing[] {
  return [...listings].sort((a, b) => {
    // 1. exact phone match handled separately (phone intent short-circuits).
    // 2. exact provider-name match
    const an = nameScore(a, parsed.detectedNameTerms);
    const bn = nameScore(b, parsed.detectedNameTerms);
    if (an !== bn) return bn - an;

    // 4. community-vouched status
    const av = approvedVouchesFor(a.id).length;
    const bv = approvedVouchesFor(b.id).length;
    const avVouched = av > 0 ? 1 : 0;
    const bvVouched = bv > 0 ? 1 : 0;
    if (avVouched !== bvVouched) return bvVouched - avVouched;

    // 5/6. vouch quality & recency approximated by count
    if (av !== bv) return bv - av;

    // 8. profile completeness (has contact, has description)
    const ac = (a.contacts.length ? 1 : 0) + (a.description ? 1 : 0);
    const bc = (b.contacts.length ? 1 : 0) + (b.description ? 1 : 0);
    if (ac !== bc) return bc - ac;

    // 9. seed confidence for listings with no Halo vouches
    const acf = CONFIDENCE_RANK[a.seedConfidence ?? "low"] ?? 1;
    const bcf = CONFIDENCE_RANK[b.seedConfidence ?? "low"] ?? 1;
    if (acf !== bcf) return bcf - acf;

    // 10. alphabetical tie-breaker
    return a.displayName.localeCompare(b.displayName);
  });
}

export function search(rawQuery: string): SearchResult {
  const parsed = parseQuery(rawQuery);

  // Phone-exact intent short-circuits to a hash lookup.
  if (parsed.intentType === "PHONE_EXACT" && parsed.detectedPhone) {
    const hash = phoneHash(parsed.detectedPhone);
    const matches = db.listings.filter((l) => l.contacts.some((c) => c.valueHash === hash));
    logSearch(parsed, matches.length);
    return {
      parsed,
      branches: [],
      requiresBranchSelection: false,
      results: matches.map(toPublicListing),
    };
  }

  const branches = expandBranches(parsed);

  if (parsed.requiresBranchSelection) {
    // Return branch metadata; also compute grouped results for "View both".
    const grouped = branches.map((branch) => {
      const matched = db.listings.filter((l) => listingMatchesBranch(l, branch));
      const ranked = rankListings(matched, branch, parsed);
      return { label: branch.label, results: ranked.map(toPublicListing) };
    });
    const total = grouped.reduce((n, g) => n + g.results.length, 0);
    logSearch(parsed, total);
    return {
      parsed,
      branches,
      requiresBranchSelection: true,
      results: grouped.flatMap((g) => g.results),
      groupedResults: grouped,
    };
  }

  const branch = branches[0];
  const matched = db.listings.filter((l) => listingMatchesBranch(l, branch));
  const ranked = rankListings(matched, branch, parsed);
  logSearch(parsed, ranked.length);
  return {
    parsed,
    branches,
    requiresBranchSelection: false,
    results: ranked.map(toPublicListing),
  };
}

// Search a single explicit branch (after the user picks one).
export function searchBranch(rawQuery: string, branchIndex: number): SearchResult {
  const parsed = parseQuery(rawQuery);
  const branches = expandBranches(parsed);
  const branch = branches[branchIndex] ?? branches[0];
  const matched = db.listings.filter((l) => listingMatchesBranch(l, branch));
  const ranked = rankListings(matched, branch, parsed);
  return {
    parsed,
    branches,
    requiresBranchSelection: false,
    results: ranked.map(toPublicListing),
  };
}

// --- Search logging (no raw phone input ever stored) -----------------------
function logSearch(parsed: ParsedQuery, resultCount: number) {
  const isPhone = parsed.intentType === "PHONE_EXACT";
  db.searchLogs.push({
    id: nextId("log"),
    // For phone searches store only that it was a phone lookup, never the digits.
    normalizedQuery: isPhone ? "[phone lookup]" : parsed.normalizedQuery,
    detectedCategoryId: parsed.detectedCategories[0]?.id,
    detectedAreaId: parsed.detectedAreas[0]?.id,
    resultCount,
    zeroResult: resultCount === 0,
    createdAt: new Date().toISOString(),
  });
}

export function getSearchLogs(): SearchLog[] {
  return [...db.searchLogs].reverse();
}
export function getZeroResultQueries(): SearchLog[] {
  return db.searchLogs.filter((l) => l.zeroResult).reverse();
}

// --- Duplicate detection ---------------------------------------------------
export interface DuplicateMatch {
  listing: PublicListing;
  reason: string;
}

export function findPossibleDuplicates(input: {
  phoneE164?: string | null;
  name?: string;
  categoryId?: string;
  areaId?: string;
  googlePlaceId?: string;
}): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const seen = new Set<string>();

  const add = (l: Listing, reason: string) => {
    if (seen.has(l.id)) return;
    seen.add(l.id);
    matches.push({ listing: toPublicListing(l), reason });
  };

  // 1/2. exact phone / hash match
  if (input.phoneE164) {
    const hash = phoneHash(input.phoneE164);
    for (const l of db.listings) {
      if (l.contacts.some((c) => c.valueHash === hash)) add(l, "Same phone number");
    }
  }

  // 6. Google Place ID match
  if (input.googlePlaceId) {
    for (const l of db.listings) {
      if (l.googlePlaceId && l.googlePlaceId === input.googlePlaceId) add(l, "Same Google listing");
    }
  }

  // 3/4/5. fuzzy name + category + area
  if (input.name) {
    const n = input.name.toLowerCase().trim();
    const tokens = n.split(/\s+/).filter((t) => t.length > 2);
    for (const l of db.listings) {
      const ln = l.displayName.toLowerCase();
      const overlap = tokens.filter((t) => ln.includes(t)).length;
      const nameClose = overlap >= Math.max(1, Math.ceil(tokens.length / 2));
      if (!nameClose) continue;
      const catOk = !input.categoryId || l.categoryIds.includes(input.categoryId);
      const areaOk =
        !input.areaId || l.primaryAreaId === input.areaId || l.serviceAreaIds.includes(input.areaId);
      if (nameClose && catOk && areaOk) add(l, "Similar name in the same area/category");
    }
  }

  return matches;
}

// --- Mutations (contributions land as pending; nothing auto-publishes) -----
export interface AddVouchInput {
  listingId: string;
  contributorDisplay: string;
  useContext: string;
  usefulDetail: string;
  usedRecency: Vouch["usedRecency"];
  usedMonth?: number;
  usedYear?: number;
  usedAreaId?: string;
  wouldUseAgain: Vouch["wouldUseAgain"];
  signals: ExperienceSignals;
}

export function addVouch(input: AddVouchInput): Vouch {
  const v: Vouch = {
    id: nextId("vouch"),
    listingId: input.listingId,
    contributorDisplay: input.contributorDisplay,
    useContext: input.useContext,
    usefulDetail: input.usefulDetail,
    usedRecency: input.usedRecency,
    usedMonth: input.usedMonth,
    usedYear: input.usedYear,
    usedAreaId: input.usedAreaId,
    wouldUseAgain: input.wouldUseAgain,
    signals: input.signals,
    moderationStatus: "pending",
    submittedAt: new Date().toISOString(),
  };
  db.vouches.push(v);
  return v;
}

export interface AddSubmissionInput {
  contributorDisplay: string;
  proposedName: string;
  proposedPhoneE164: string;
  proposedPhoneMasked: string;
  permissionBasis: ListingSubmission["permissionBasis"];
  categoryId: string;
  primaryAreaId: string;
  useContext: string;
  usefulDetail?: string;
  usedRecency: ListingSubmission["usedRecency"];
  signals?: ExperienceSignals;
  wouldUseAgain?: Vouch["wouldUseAgain"];
  possibleDuplicateListingId?: string;
}

export function addSubmission(input: AddSubmissionInput): ListingSubmission {
  const s: ListingSubmission = {
    id: nextId("sub"),
    contributorDisplay: input.contributorDisplay,
    proposedName: input.proposedName,
    proposedPhoneMasked: input.proposedPhoneMasked,
    proposedPhoneHash: phoneHash(input.proposedPhoneE164),
    permissionBasis: input.permissionBasis,
    categoryId: input.categoryId,
    primaryAreaId: input.primaryAreaId,
    useContext: input.useContext,
    usefulDetail: input.usefulDetail,
    usedRecency: input.usedRecency,
    signals: input.signals,
    wouldUseAgain: input.wouldUseAgain,
    moderationStatus: "pending",
    possibleDuplicateListingId: input.possibleDuplicateListingId,
    submittedAt: new Date().toISOString(),
  };
  db.submissions.push(s);
  return s;
}

export function addClaim(input: Omit<ProviderClaim, "id" | "status" | "submittedAt">): ProviderClaim {
  const c: ProviderClaim = {
    ...input,
    id: nextId("claim"),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  db.claims.push(c);
  return c;
}

export interface AddEarlyAccessInput {
  email: string;
  phone?: string;
  reason: EarlyAccessReason;
  communicationPreference: CommunicationPreference;
}

// De-duplicates by email — re-submitting just updates the existing record
// rather than inflating a count anywhere the product might one day show.
export function addEarlyAccess(input: AddEarlyAccessInput): EarlyAccessRecord {
  const existing = db.earlyAccess.find((e) => e.email.toLowerCase() === input.email.toLowerCase());
  if (existing) {
    existing.phone = input.phone;
    existing.reason = input.reason;
    existing.communicationPreference = input.communicationPreference;
    return existing;
  }
  const e: EarlyAccessRecord = {
    id: nextId("early"),
    email: input.email,
    phone: input.phone,
    reason: input.reason,
    communicationPreference: input.communicationPreference,
    submittedAt: new Date().toISOString(),
  };
  db.earlyAccess.push(e);
  return e;
}

// --- Admin / moderation ----------------------------------------------------
export function listPendingVouches(): Vouch[] {
  return db.vouches.filter((v) => v.moderationStatus === "pending");
}
export function listSubmissions(): ListingSubmission[] {
  return [...db.submissions].reverse();
}
export function listClaims(): ProviderClaim[] {
  return [...db.claims].reverse();
}
export function listAllListings(): PublicListing[] {
  return db.listings.map(toPublicListing);
}
export function getSeedMatrix() {
  return db.seedMatrix;
}
export function getSeedCandidates() {
  return db.seedCandidates;
}

export function moderateVouch(id: string, status: Vouch["moderationStatus"]) {
  const v = db.vouches.find((x) => x.id === id);
  if (v) {
    v.moderationStatus = status;
    if (status === "approved") v.approvedAt = new Date().toISOString();
  }
}

export function moderateSubmission(id: string, status: ListingSubmission["moderationStatus"]) {
  const s = db.submissions.find((x) => x.id === id);
  if (!s) return;
  s.moderationStatus = status;
  // Approving a submission creates a "Public listing" (no community vouch).
  if (status === "approved") {
    const slug = s.proposedName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const nowIso = new Date().toISOString();
    const canPublishContact = s.permissionBasis !== "unsure";
    db.listings.push({
      id: nextId("listing"),
      slug: db.listings.some((l) => l.slug === slug) ? `${slug}-${idCounter}` : slug,
      displayName: s.proposedName,
      primaryAreaId: s.primaryAreaId,
      serviceAreaIds: [],
      categoryIds: [s.categoryId],
      publicState: "public_listing",
      businessManaged: false,
      createdSource: "user_submission",
      contacts: [
        {
          id: nextId("contact"),
          contactType: "mobile",
          fullValue: "", // full value would be decrypted from storage in prod
          maskedValue: s.proposedPhoneMasked,
          valueHash: s.proposedPhoneHash,
          isPublic: canPublishContact,
          permissionBasis: s.permissionBasis,
          verificationStatus: canPublishContact ? "moderator_verified" : "unverified",
        },
      ],
      sourceRefs: [
        {
          id: nextId("src"),
          sourceType: "user_contribution",
          matchStatus: "not_found",
          observedAt: nowIso,
        },
      ],
      seedConfidence: "low",
      createdAt: nowIso,
      updatedAt: nowIso,
      publishedAt: nowIso,
    });
  }
}

export function moderateSeedCandidate(id: string, status: "approved" | "rejected" | "hold") {
  const c = db.seedCandidates.find((x) => x.id === id);
  if (c) c.status = status;
}

// Contributor dashboard (demo: returns everything, as there is no auth wired).
export function getContributorSubmissions(): {
  submissions: ListingSubmission[];
  vouches: Vouch[];
} {
  return {
    submissions: [...db.submissions].reverse(),
    vouches: db.vouches.filter((v) => !v.id.startsWith("vouch_seed_")).reverse(),
  };
}

export { AREAS, ALL_VADODARA, CATEGORIES };
