import type {
  Listing,
  ListingContact,
  Vouch,
  SeedMatrixCell,
  SeedCandidate,
  ExperienceSignals,
} from "./types";
import { maskPhone, normalizeIndianPhone, phoneHash } from "../phone";

// Sample directory data for the MVP. These are illustrative records for a
// running, browsable product — NOT a claim that any real business is trusted.
// Seeded listings appear as "Public listing" with no community vouches; a few
// records carry approved sample vouches so the community-vouched state and the
// experience-signal thresholds are demonstrable end to end.

let seq = 0;
const now = new Date("2026-05-01T00:00:00Z").toISOString();

function contact(raw: string, isPublic: boolean): ListingContact {
  const e164 = normalizeIndianPhone(raw)!;
  return {
    id: `contact_${seq++}`,
    contactType: "mobile",
    fullValue: e164,
    maskedValue: maskPhone(e164),
    valueHash: phoneHash(e164),
    isPublic,
    permissionBasis: "publicly_advertised",
    verificationStatus: isPublic ? "moderator_verified" : "unverified",
    whatsapp: true,
  };
}

interface SeedDef {
  name: string;
  categoryIds: string[];
  primaryArea: string;
  serviceAreas?: string[];
  phone?: string;
  publicContact?: boolean;
  description?: string;
  businessManaged?: boolean;
  seedConfidence?: Listing["seedConfidence"];
  createdSource?: Listing["createdSource"];
  googlePlaceId?: string;
}

function listing(def: SeedDef): Listing {
  const slug = def.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `listing_${slug}`,
    slug,
    displayName: def.name,
    description: def.description,
    primaryAreaId: `area_${def.primaryArea}`,
    serviceAreaIds: (def.serviceAreas ?? []).map((a) => `area_${a}`),
    categoryIds: def.categoryIds.map((c) => `cat_${c}`),
    publicState: "public_listing",
    businessManaged: def.businessManaged ?? false,
    googlePlaceId: def.googlePlaceId,
    createdSource: def.createdSource ?? "seed",
    contacts: def.phone ? [contact(def.phone, def.publicContact ?? true)] : [],
    sourceRefs: [
      {
        id: `src_${slug}`,
        sourceType: "google_places",
        externalId: def.googlePlaceId,
        matchStatus: "probable",
        observedAt: now,
        reviewerNotes: "Seed candidate — public source reference only.",
      },
    ],
    seedConfidence: def.seedConfidence ?? "medium",
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  };
}

export const SEED_LISTINGS: Listing[] = [
  listing({ name: "Sharma Electrical Works", categoryIds: ["electrician"], primaryArea: "gotri", serviceAreas: ["subhanpura", "bhayli"], phone: "9825012345", description: "Home electrical repair and fittings.", seedConfidence: "high", googlePlaceId: "ChIJseed0001" }),
  listing({ name: "Gotri Power Solutions", categoryIds: ["electrician", "cctv-installation"], primaryArea: "gotri", phone: "9898023456", seedConfidence: "medium", googlePlaceId: "ChIJseed0002" }),
  listing({ name: "Reliable Home Electricals", categoryIds: ["electrician"], primaryArea: "gotri", phone: "9727034567", seedConfidence: "medium" }),
  listing({ name: "Akota Fan & Motor Repair", categoryIds: ["electrician", "appliance-repair"], primaryArea: "akota", phone: "9924045678", seedConfidence: "medium" }),
  listing({ name: "Manjalpur Cool AC Services", categoryIds: ["ac-repair"], primaryArea: "manjalpur", serviceAreas: ["tarsali", "vasna"], phone: "9909056789", seedConfidence: "high" }),
  listing({ name: "Annapurna Home Tiffin", categoryIds: ["tiffin", "home-food"], primaryArea: "alkapuri", phone: "9825067890", description: "Weekday veg tiffin service.", seedConfidence: "high", businessManaged: true }),
  listing({ name: "Gotri Ghar Ka Khana", categoryIds: ["tiffin"], primaryArea: "gotri", phone: "9898078901", seedConfidence: "medium" }),
  listing({ name: "Karelibaug Master Tailors", categoryIds: ["tailor", "alteration"], primaryArea: "karelibaug", phone: "9909089012", description: "Ladies and gents tailoring, blouse specialists.", seedConfidence: "high" }),
  listing({ name: "Fatehgunj Dry Clean & Laundry", categoryIds: ["laundry", "dry-cleaning"], primaryArea: "fatehgunj", phone: "9727090123", seedConfidence: "medium" }),
  listing({ name: "Sama Care Plumbing", categoryIds: ["plumber"], primaryArea: "sama", serviceAreas: ["nizampura"], phone: "9825101234", seedConfidence: "medium" }),
  listing({ name: "Alkapuri Quick Plumbers", categoryIds: ["plumber"], primaryArea: "alkapuri", phone: "9898112345", seedConfidence: "medium" }),
  listing({ name: "Subhanpura Woodcraft Carpenters", categoryIds: ["carpenter"], primaryArea: "subhanpura", phone: "9909123456", seedConfidence: "medium" }),
  listing({ name: "Harni Mobile Care", categoryIds: ["mobile-repair"], primaryArea: "harni", phone: "9727134567", seedConfidence: "medium" }),
  listing({ name: "Race Course Salon Studio", categoryIds: ["salon"], primaryArea: "race-course", phone: "9825145678", seedConfidence: "high", businessManaged: true }),
  listing({ name: "Ellora Park Pet Clinic", categoryIds: ["veterinary-clinic"], primaryArea: "ellora-park", phone: "9898156789", seedConfidence: "high" }),
  listing({ name: "Old Padra Road Maths Tuition", categoryIds: ["maths-tutor"], primaryArea: "old-padra-road", phone: "9909167890", seedConfidence: "medium" }),
];

// A few approved sample vouches so the community-vouched state and thresholds
// render. Sharma Electrical Works gets 5 vouches (crosses the summary
// threshold); Annapurna gets 2 (below the summary threshold — shows the
// "still forming" state).
function signals(r: number, q: number, c: number, p: number, res: number): ExperienceSignals {
  return { reliability: r, workQuality: q, communicationPunctuality: c, priceClarity: p, respectfulness: res };
}

let vseq = 0;
function vouch(
  listingId: string,
  display: string,
  useContext: string,
  usefulDetail: string,
  s: ExperienceSignals,
  areaId: string
): Vouch {
  return {
    id: `vouch_seed_${vseq++}`,
    listingId,
    contributorDisplay: display,
    useContext,
    usefulDetail,
    usedRecency: "1_3_months",
    usedMonth: 3,
    usedYear: 2026,
    usedAreaId: areaId,
    wouldUseAgain: "yes",
    signals: s,
    moderationStatus: "approved",
    submittedAt: now,
    approvedAt: now,
  };
}

export const SEED_VOUCHES: Vouch[] = [
  vouch("listing_sharma-electrical-works", "Priya S.", "Ceiling-fan regulator repair", "Arrived at the agreed time and explained which part needed replacing.", signals(5, 5, 4, 5, 5), "area_gotri"),
  vouch("listing_sharma-electrical-works", "Ankit M.", "Old wiring replacement", "Rewired two rooms cleanly over a weekend.", signals(4, 5, 4, 4, 5), "area_gotri"),
  vouch("listing_sharma-electrical-works", "Verified Halo contributor", "Switchboard replacement", "Fixed a sparking switchboard the same evening.", signals(5, 4, 5, 4, 4), "area_subhanpura"),
  vouch("listing_sharma-electrical-works", "Rekha D.", "Inverter installation", "Set up an inverter and explained the load clearly.", signals(4, 4, 4, 5, 5), "area_gotri"),
  vouch("listing_sharma-electrical-works", "Sameer P.", "Urgent home visit", "Came within the hour for a power trip issue.", signals(5, 5, 5, 4, 5), "area_bhayli"),
  vouch("listing_annapurna-home-tiffin", "Neha J.", "Weekday tiffin for two", "Home-cooked lunch delivered on time for two weeks.", signals(5, 5, 5, 4, 5), "area_alkapuri"),
  vouch("listing_annapurna-home-tiffin", "Verified Halo contributor", "Jain tiffin", "Accommodated Jain preferences without fuss.", signals(4, 5, 4, 5, 5), "area_alkapuri"),
];

export const SEED_MATRIX: SeedMatrixCell[] = [
  { id: "sm_1", areaId: "area_gotri", categoryId: "cat_electrician", status: "covered", candidatesFound: 8, candidatesApproved: 3, lastResearchedAt: now },
  { id: "sm_2", areaId: "area_gotri", categoryId: "cat_plumber", status: "partially_covered", candidatesFound: 4, candidatesApproved: 0, lastResearchedAt: now },
  { id: "sm_3", areaId: "area_gotri", categoryId: "cat_tiffin", status: "partially_covered", candidatesFound: 3, candidatesApproved: 1, lastResearchedAt: now },
  { id: "sm_4", areaId: "area_akota", categoryId: "cat_electrician", status: "partially_covered", candidatesFound: 2, candidatesApproved: 1, lastResearchedAt: now },
  { id: "sm_5", areaId: "area_manjalpur", categoryId: "cat_ac-repair", status: "review_required", candidatesFound: 5, candidatesApproved: 1, lastResearchedAt: now },
  { id: "sm_6", areaId: "area_karelibaug", categoryId: "cat_tailor", status: "covered", candidatesFound: 6, candidatesApproved: 1, lastResearchedAt: now },
  { id: "sm_7", areaId: "area_alkapuri", categoryId: "cat_tiffin", status: "not_started", candidatesFound: 0, candidatesApproved: 0 },
];

export const SEED_CANDIDATES: SeedCandidate[] = [
  {
    id: "cand_1",
    areaId: "area_manjalpur",
    categoryId: "cat_ac-repair",
    googlePlaceId: "ChIJcand0001",
    proposedName: "CoolBreeze AC Care",
    googleRating: 4.6,
    googleRatingCount: 214,
    matchConfidence: "high",
    phoneMatch: "exact",
    nameMatch: "exact",
    areaMatch: "exact",
    justdialUrl: "https://www.justdial.com/example",
    officialUrl: "https://coolbreeze.example",
    reviewerNotes: "Cross-source confirmed (Google + Justdial + official site).",
    status: "pending",
  },
  {
    id: "cand_2",
    areaId: "area_gotri",
    categoryId: "cat_plumber",
    googlePlaceId: "ChIJcand0002",
    proposedName: "AquaFix Plumbing",
    googleRating: 4.4,
    googleRatingCount: 41,
    matchConfidence: "medium",
    phoneMatch: "probable",
    nameMatch: "exact",
    areaMatch: "exact",
    justdialUrl: "https://www.justdial.com/example2",
    reviewerNotes: "Phone differs by one digit between Google and Justdial — needs manual call.",
    status: "pending",
  },
  {
    id: "cand_3",
    areaId: "area_gotri",
    categoryId: "cat_plumber",
    googlePlaceId: "ChIJcand0003",
    proposedName: "FiveStar Plumbers",
    googleRating: 5.0,
    googleRatingCount: 3,
    matchConfidence: "low",
    phoneMatch: "not_found",
    nameMatch: "probable",
    areaMatch: "exact",
    reviewerNotes: "5.0 with only 3 ratings — does not meet threshold. Hold.",
    status: "hold",
  },
];
