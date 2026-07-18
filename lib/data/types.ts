// Core domain types for Halo.
// These mirror the Postgres schema in lib/db/schema.sql so the in-memory
// store and a future Supabase-backed store share one shape.

export type RiskLevel = "standard" | "sensitive" | "high_stakes";

export type PublicState = "public_listing" | "business_managed" | "community_vouched";

export type ModerationStatus =
  | "pending"
  | "needs_information"
  | "approved"
  | "rejected"
  | "duplicate"
  | "withdrawn";

export type CreatedSource = "seed" | "user_submission" | "provider_claim" | "admin";

export type UsedRecency =
  | "within_month"
  | "1_3_months"
  | "3_6_months"
  | "6_12_months"
  | "over_year";

export type WouldUseAgain = "yes" | "no" | "not_sure";

export type PermissionBasis =
  | "publicly_advertised"
  | "has_permission"
  | "unsure";

export type SourceType =
  | "google_places"
  | "justdial"
  | "sulekha"
  | "official_business"
  | "user_contribution"
  | "provider_claim";

export type MatchStatus = "exact" | "probable" | "conflicting" | "not_found";

export interface Area {
  id: string;
  canonicalName: string;
  slug: string;
  aliases: string[];
  ward?: string;
  zone?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string;
  aliases: string[];
  searchKeywords: string[];
  iconKey?: string;
  riskLevel: RiskLevel;
  isSeedable: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface ListingContact {
  id: string;
  contactType: "mobile" | "landline" | "whatsapp";
  // In production value_encrypted holds the ciphertext; the in-memory store
  // keeps the plain value server-side only and never ships it to the client.
  fullValue: string;
  maskedValue: string;
  valueHash: string;
  isPublic: boolean;
  permissionBasis: PermissionBasis;
  verificationStatus: "unverified" | "provider_confirmed" | "moderator_verified";
  whatsapp?: boolean;
}

export interface SourceRef {
  id: string;
  sourceType: SourceType;
  sourceUrl?: string;
  externalId?: string;
  matchStatus: MatchStatus;
  observedAt: string;
  reviewerNotes?: string;
}

export interface ExperienceSignals {
  reliability: number;
  workQuality: number;
  communicationPunctuality: number;
  priceClarity: number;
  respectfulness: number;
}

export interface Vouch {
  id: string;
  listingId: string;
  contributorDisplay: string; // "Priya S." or "Verified Halo contributor"
  useContext: string;
  usefulDetail: string;
  usedRecency: UsedRecency;
  usedMonth?: number;
  usedYear?: number;
  usedAreaId?: string;
  wouldUseAgain: WouldUseAgain;
  signals: ExperienceSignals;
  moderationStatus: ModerationStatus;
  submittedAt: string;
  approvedAt?: string;
}

export interface Listing {
  id: string;
  slug: string;
  displayName: string;
  description?: string;
  primaryAreaId: string;
  serviceAreaIds: string[];
  categoryIds: string[]; // first is primary
  publicState: PublicState;
  businessManaged: boolean;
  googlePlaceId?: string;
  createdSource: CreatedSource;
  contacts: ListingContact[];
  sourceRefs: SourceRef[];
  // Non-public seed confidence — used for ranking only, never shown as trust.
  seedConfidence?: "low" | "medium" | "high" | "manually_verified";
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ListingSubmission {
  id: string;
  contributorDisplay: string;
  proposedName: string;
  proposedPhoneMasked: string;
  proposedPhoneHash: string;
  permissionBasis: PermissionBasis;
  categoryId: string;
  primaryAreaId: string;
  useContext: string;
  usefulDetail?: string;
  usedRecency: UsedRecency;
  signals?: ExperienceSignals;
  wouldUseAgain?: WouldUseAgain;
  moderationStatus: ModerationStatus;
  possibleDuplicateListingId?: string;
  submittedAt: string;
}

export interface ProviderClaim {
  id: string;
  listingId?: string;
  claimType: "list" | "claim" | "correct" | "remove";
  businessName: string;
  claimantName: string;
  categoryId?: string;
  primaryAreaId?: string;
  proposedPhoneMasked?: string;
  proofType?: string;
  proofReference?: string;
  status: ModerationStatus;
  submittedAt: string;
}

export interface SeedMatrixCell {
  id: string;
  areaId: string;
  categoryId: string;
  status:
    | "not_started"
    | "researching"
    | "review_required"
    | "partially_covered"
    | "covered"
    | "revisit_required";
  candidatesFound: number;
  candidatesApproved: number;
  lastResearchedAt?: string;
}

export interface SeedCandidate {
  id: string;
  areaId: string;
  categoryId: string;
  googlePlaceId?: string;
  proposedName: string;
  googleRating?: number;
  googleRatingCount?: number;
  matchConfidence: "low" | "medium" | "high" | "manually_verified";
  phoneMatch: MatchStatus;
  nameMatch: MatchStatus;
  areaMatch: MatchStatus;
  justdialUrl?: string;
  sulekhaUrl?: string;
  officialUrl?: string;
  reviewerNotes?: string;
  status: "pending" | "approved" | "rejected" | "hold";
}

export type EarlyAccessReason = "need_help" | "know_trusted_people" | "both";
export type CommunicationPreference = "email_only" | "email_and_call";

export interface EarlyAccessRecord {
  id: string;
  email: string;
  phone?: string;
  reason: EarlyAccessReason;
  communicationPreference: CommunicationPreference;
  submittedAt: string;
}

export interface SearchLog {
  id: string;
  normalizedQuery: string;
  detectedCategoryId?: string;
  detectedAreaId?: string;
  resultCount: number;
  zeroResult: boolean;
  createdAt: string;
}
