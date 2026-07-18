import crypto from "node:crypto";

// Phone-privacy primitives for Halo.
//
// Halo stores two contact concepts separately (contributor vs. listing).
// A raw number is NEVER shipped to the client in previews and NEVER stored in
// analytics. We keep:
//   - a normalized E.164 value (server-side only)
//   - a deterministic secure hash (duplicate matching)
//   - a masked display value (safe for previews)

const HASH_SALT = process.env.HALO_PHONE_HASH_SALT ?? "halo-dev-salt-do-not-use-in-prod";

/**
 * Normalize an Indian mobile/landline to E.164 (+91XXXXXXXXXX) where possible.
 * Returns null when the input cannot be recognised as a phone number.
 */
export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let d = digits.replace(/^\+/, "");

  // Strip a leading country code / trunk prefix.
  if (d.startsWith("0091")) d = d.slice(4);
  else if (d.startsWith("91") && d.length > 10) d = d.slice(2);
  else if (d.startsWith("0")) d = d.slice(1);

  // Indian mobile numbers are 10 digits starting 6-9.
  if (/^[6-9]\d{9}$/.test(d)) return `+91${d}`;

  // Landline: allow 10-11 digit fixed-line numbers (with STD code).
  if (/^\d{10,11}$/.test(d)) return `+91${d}`;

  return null;
}

/** True when a token looks like a phone number the user typed. */
export function looksLikePhone(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

/** Deterministic, salted hash for duplicate detection. Never reversible. */
export function phoneHash(e164: string): string {
  return crypto.createHmac("sha256", HASH_SALT).update(e164).digest("hex");
}

/** Mask an E.164 number for preview: +91 98••• ••421 style. */
export function maskPhone(e164: string): string {
  const local = e164.replace(/^\+91/, "");
  if (local.length < 6) return "•••• •••";
  const start = local.slice(0, 2);
  const end = local.slice(-3);
  return `${start}••• ••${end}`;
}
