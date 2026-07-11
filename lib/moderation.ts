// Contribution-quality checks. Kept out of the "use server" actions file so it
// can be imported by both server actions and server components.

// Low-signal phrases that should be rejected / clarified before submission.
const BANNED_PHRASES = [
  "best",
  "very good",
  "amazing service",
  "amazing",
  "five stars",
  "5 stars",
  "must try",
  "number one",
  "no 1",
  "awesome",
  "good service",
  "nice",
];

export function isSpecificEnough(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length < 12) return false;
  const collapsed = t.replace(/[^a-z ]/g, "").trim();
  if (BANNED_PHRASES.includes(collapsed)) return false;
  // Must contain more than two meaningful words.
  const words = collapsed.split(/\s+/).filter((w) => w.length > 2);
  return words.length >= 3;
}
