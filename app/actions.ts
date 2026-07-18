"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  addVouch,
  addSubmission,
  addClaim,
  addEarlyAccess,
  findPossibleDuplicates,
  revealPublicNumber,
  moderateVouch,
  moderateSubmission,
  moderateSeedCandidate,
} from "@/lib/data/store";
import type { ExperienceSignals } from "@/lib/data/types";
import { normalizeIndianPhone, maskPhone } from "@/lib/phone";
import { isSpecificEnough } from "@/lib/moderation";

// All mutations run server-side. Contributions land as `pending`; nothing
// auto-publishes. Raw contributor phone numbers are never returned to the
// client or stored in analytics.

const signalSchema = z.object({
  reliability: z.number().min(1).max(5),
  workQuality: z.number().min(1).max(5),
  communicationPunctuality: z.number().min(1).max(5),
  priceClarity: z.number().min(1).max(5),
  respectfulness: z.number().min(1).max(5),
});

const recencySchema = z.enum([
  "within_month",
  "1_3_months",
  "3_6_months",
  "6_12_months",
  "over_year",
]);

export interface ActionResult {
  ok: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

// --- Reveal a public number (only when public + permitted) -----------------
export async function revealNumberAction(listingId: string): Promise<ActionResult> {
  const num = revealPublicNumber(listingId);
  if (!num) return { ok: false, error: "This number is not available publicly." };
  return { ok: true, data: { number: num } };
}

// --- Duplicate check (before creating a listing) ---------------------------
export async function checkDuplicatesAction(input: {
  name?: string;
  phone?: string;
  categoryId?: string;
  areaId?: string;
}): Promise<ActionResult> {
  const phoneE164 = input.phone ? normalizeIndianPhone(input.phone) : null;
  const matches = findPossibleDuplicates({
    name: input.name,
    phoneE164,
    categoryId: input.categoryId,
    areaId: input.areaId,
  });
  return {
    ok: true,
    data: {
      matches: matches.map((m) => ({
        slug: m.listing.slug,
        name: m.listing.displayName,
        reason: m.reason,
        area: m.listing.primaryArea?.name,
        category: m.listing.primaryCategory?.name,
      })),
    },
  };
}

// --- Submit a vouch --------------------------------------------------------
const vouchSchema = z.object({
  listingId: z.string(),
  usedService: z.literal("yes"),
  useContext: z.string().min(3),
  usefulDetail: z.string().max(300),
  usedRecency: recencySchema,
  usedMonth: z.number().optional(),
  usedYear: z.number().optional(),
  usedAreaId: z.string().optional(),
  wouldUseAgain: z.enum(["yes", "no", "not_sure"]),
  signals: signalSchema,
  contributorFirstName: z.string().min(1),
  contributorPhone: z.string(),
  contributorAreaId: z.string().optional(),
  displayChoice: z.enum(["first_initial", "anonymous"]),
  otpVerified: z.literal(true),
  consent: z.literal(true),
});

export async function submitVouchAction(raw: unknown): Promise<ActionResult> {
  const parsed = vouchSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please complete every step before submitting." };
  const v = parsed.data;

  if (!isSpecificEnough(v.useContext)) {
    return { ok: false, error: "Please be specific about what you used them for." };
  }
  const phone = normalizeIndianPhone(v.contributorPhone);
  if (!phone) return { ok: false, error: "Enter a valid mobile number for verification." };

  const display =
    v.displayChoice === "anonymous"
      ? "Verified Halo contributor"
      : `${v.contributorFirstName.trim()} ${(v.contributorFirstName.trim()[0] ?? "").toUpperCase()}.`;

  addVouch({
    listingId: v.listingId,
    contributorDisplay: display,
    useContext: v.useContext.trim(),
    usefulDetail: v.usefulDetail.trim(),
    usedRecency: v.usedRecency,
    usedMonth: v.usedMonth,
    usedYear: v.usedYear,
    usedAreaId: v.usedAreaId,
    wouldUseAgain: v.wouldUseAgain,
    signals: v.signals as ExperienceSignals,
  });

  revalidatePath("/admin");
  revalidatePath("/submissions");
  return { ok: true };
}

// --- Submit a trusted number (add a listing) -------------------------------
const submissionSchema = z.object({
  proposedName: z.string().min(2),
  categoryId: z.string().min(1),
  primaryAreaId: z.string().min(1),
  phone: z.string(),
  whatsapp: z.boolean().optional(),
  permissionBasis: z.enum(["publicly_advertised", "has_permission", "unsure"]),
  useContext: z.string().min(3),
  usefulDetail: z.string().max(300).optional(),
  usedRecency: recencySchema,
  signals: signalSchema.optional(),
  wouldUseAgain: z.enum(["yes", "no", "not_sure"]).optional(),
  possibleDuplicateListingId: z.string().optional(),
  contributorFirstName: z.string().min(1),
  contributorPhone: z.string(),
  contributorAreaId: z.string().optional(),
  otpVerified: z.literal(true),
  consent: z.literal(true),
});

export async function submitNumberAction(raw: unknown): Promise<ActionResult> {
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please complete every required step." };
  const s = parsed.data;

  if (!isSpecificEnough(s.useContext)) {
    return { ok: false, error: "Please be specific about what you used them for." };
  }
  const listingPhone = normalizeIndianPhone(s.phone);
  if (!listingPhone) return { ok: false, error: "Enter a valid phone number for the service." };
  const contributorPhone = normalizeIndianPhone(s.contributorPhone);
  if (!contributorPhone) return { ok: false, error: "Enter a valid mobile number for verification." };

  const display = `${s.contributorFirstName.trim()} ${(s.contributorFirstName.trim()[0] ?? "").toUpperCase()}.`;

  addSubmission({
    contributorDisplay: display,
    proposedName: s.proposedName.trim(),
    proposedPhoneE164: listingPhone,
    proposedPhoneMasked: maskPhone(listingPhone),
    permissionBasis: s.permissionBasis,
    categoryId: s.categoryId,
    primaryAreaId: s.primaryAreaId,
    useContext: s.useContext.trim(),
    usefulDetail: s.usefulDetail?.trim(),
    usedRecency: s.usedRecency,
    signals: s.signals as ExperienceSignals | undefined,
    wouldUseAgain: s.wouldUseAgain,
    possibleDuplicateListingId: s.possibleDuplicateListingId,
  });

  revalidatePath("/admin");
  revalidatePath("/submissions");
  return { ok: true };
}

// --- Business: list / claim / correct / remove -----------------------------
const businessSchema = z.object({
  claimType: z.enum(["list", "claim", "correct", "remove"]),
  businessName: z.string().min(2),
  claimantName: z.string().min(1),
  listingId: z.string().optional(),
  categoryId: z.string().optional(),
  primaryAreaId: z.string().optional(),
  phone: z.string().optional(),
  proofType: z.string().optional(),
  proofReference: z.string().optional(),
});

export async function submitBusinessAction(raw: unknown): Promise<ActionResult> {
  const parsed = businessSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please fill the required fields." };
  const b = parsed.data;
  const phoneMasked = b.phone ? maskPhone(normalizeIndianPhone(b.phone) ?? "") : undefined;

  addClaim({
    claimType: b.claimType,
    businessName: b.businessName.trim(),
    claimantName: b.claimantName.trim(),
    listingId: b.listingId,
    categoryId: b.categoryId,
    primaryAreaId: b.primaryAreaId,
    proposedPhoneMasked: phoneMasked,
    proofType: b.proofType,
    proofReference: b.proofReference,
  });

  revalidatePath("/admin");
  return { ok: true };
}

// --- Early access / waitlist -------------------------------------------------
const earlyAccessSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  reason: z.enum(["need_help", "know_trusted_people", "both"]),
  communicationPreference: z.enum(["email_only", "email_and_call"]),
  name: z.string().max(80).optional(),
  areaId: z.string().optional(),
  interests: z.array(z.string()).max(12).optional(),
});

export async function submitEarlyAccessAction(raw: unknown): Promise<ActionResult> {
  const parsed = earlyAccessSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Enter a valid email to join early access." };
  const e = parsed.data;

  let phone: string | undefined;
  if (e.communicationPreference === "email_and_call") {
    phone = e.phone ? normalizeIndianPhone(e.phone) ?? undefined : undefined;
    if (!phone) return { ok: false, error: "Enter a valid phone number, or switch to email only." };
  }

  addEarlyAccess({
    email: e.email.trim().toLowerCase(),
    phone,
    reason: e.reason,
    communicationPreference: e.communicationPreference,
    name: e.name?.trim() || undefined,
    areaId: e.areaId,
    interests: e.interests,
  });

  return { ok: true };
}

// --- Admin moderation ------------------------------------------------------
export async function moderateVouchAction(id: string, status: string): Promise<ActionResult> {
  moderateVouch(id, status as never);
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  return { ok: true };
}
export async function moderateSubmissionAction(id: string, status: string): Promise<ActionResult> {
  moderateSubmission(id, status as never);
  revalidatePath("/admin");
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/listings");
  return { ok: true };
}
export async function moderateSeedCandidateAction(id: string, status: string): Promise<ActionResult> {
  moderateSeedCandidate(id, status as "approved" | "rejected" | "hold");
  revalidatePath("/admin/seed");
  return { ok: true };
}
