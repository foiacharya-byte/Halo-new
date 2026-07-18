import { AREA_ALIAS_INDEX, ALL_VADODARA } from "../data/areas";
import { CATEGORY_ALIAS_INDEX } from "../data/categories";
import type { Area, Category } from "../data/types";
import { looksLikePhone, normalizeIndianPhone } from "../phone";

// Deterministic, server-side query parser. No LLM. Handles service, category,
// provider name, locality, phone, combined intents, misspellings (light) and
// Vadodara aliases in English / Hinglish / transliterated Gujarati.

export type IntentType =
  | "PHONE_EXACT"
  | "PROVIDER_NAME"
  | "CATEGORY_ONLY"
  | "AREA_ONLY"
  | "CATEGORY_AREA"
  | "MULTIPLE_CATEGORIES"
  | "MULTIPLE_AREAS"
  | "GENERAL";

export interface ParsedQuery {
  rawQuery: string;
  normalizedQuery: string;
  detectedPhone: string | null; // E.164 when a phone intent is found
  detectedNameTerms: string[];
  detectedAreas: Area[];
  detectedCategories: Category[];
  unmatchedTerms: string[];
  intentType: IntentType;
  requiresBranchSelection: boolean;
}

const CONNECTOR_WORDS = new Set([
  "in", "near", "around", "at", "on", "the", "a", "an", "for", "me", "my",
  "please", "want", "need", "looking", "find", "some", "any",
]);

// Words that split a query into separate intents.
const SPLIT_WORDS = new Set(["and", "or", "&", "+"]);

function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s+&]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein distance for light misspelling tolerance.
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 2) return 99;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function fuzzyThreshold(term: string): number {
  if (term.length <= 4) return 1;
  return 2;
}

// Try to match a sequence of tokens (1..3 words) against an alias index.
interface Resolution<T> {
  item: T;
  exact: boolean;
  distance: number;
}

function buildResolver<T>(index: { alias: string; item: T }[]) {
  const exact = new Map<string, T>();
  for (const e of index) exact.set(e.alias, e.item);
  const aliasList = index;
  return function resolve(phrase: string): Resolution<T> | null {
    const hit = exact.get(phrase);
    if (hit) return { item: hit, exact: true, distance: 0 };
    let best: Resolution<T> | null = null;
    const threshold = fuzzyThreshold(phrase);
    for (const e of aliasList) {
      if (Math.abs(e.alias.length - phrase.length) > 2) continue;
      const d = editDistance(phrase, e.alias);
      if (d <= threshold && (!best || d < best.distance)) {
        best = { item: e.item, exact: false, distance: d };
      }
    }
    return best;
  };
}

const resolveCategory = buildResolver<Category>(
  CATEGORY_ALIAS_INDEX.map((e) => ({ alias: e.alias, item: e.category }))
);
const resolveArea = buildResolver<Area>(
  AREA_ALIAS_INDEX.map((e) => ({ alias: e.alias, item: e.area }))
);

interface Consumed {
  categories: Category[];
  areas: Area[];
  nameTerms: string[];
  unmatched: string[];
}

// Greedy multi-word matcher over a token list. Tries 3-, 2-, then 1-word spans.
function consumeSegment(tokens: string[]): Consumed {
  const categories: Category[] = [];
  const areas: Area[] = [];
  const nameTerms: string[] = [];
  const unmatched: string[] = [];

  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (CONNECTOR_WORDS.has(tok)) {
      i++;
      continue;
    }

    // Evaluate every span at this position and pick the strongest match.
    // Ranking: exact beats fuzzy; longer spans beat shorter; closer beats
    // farther. This ensures an exact area ("gotri") wins over an accidental
    // fuzzy category match.
    let best:
      | { kind: "category" | "area"; item: Category | Area; span: number; exact: boolean; distance: number }
      | null = null;

    const maxSpan = Math.min(3, tokens.length - i);
    for (let span = maxSpan; span >= 1; span--) {
      const phrase = tokens.slice(i, i + span).join(" ");
      if (CONNECTOR_WORDS.has(phrase)) continue;
      const candidates: {
        kind: "category" | "area";
        item: Category | Area;
        exact: boolean;
        distance: number;
      }[] = [];
      const cat = resolveCategory(phrase);
      if (cat) candidates.push({ kind: "category", item: cat.item, exact: cat.exact, distance: cat.distance });
      const ar = resolveArea(phrase);
      if (ar) candidates.push({ kind: "area", item: ar.item, exact: ar.exact, distance: ar.distance });

      for (const c of candidates) {
        const cand = { ...c, span };
        if (!best) {
          best = cand;
        } else if (cand.exact !== best.exact) {
          if (cand.exact) best = cand;
        } else if (cand.span !== best.span) {
          if (cand.span > best.span) best = cand;
        } else if (cand.distance < best.distance) {
          best = cand;
        }
      }
    }

    if (best) {
      if (best.kind === "category") {
        const c = best.item as Category;
        if (!categories.some((x) => x.id === c.id)) categories.push(c);
      } else {
        const a = best.item as Area;
        if (!areas.some((x) => x.id === a.id)) areas.push(a);
      }
      i += best.span;
    } else {
      nameTerms.push(tok);
      unmatched.push(tok);
      i++;
    }
  }
  return { categories, areas, nameTerms, unmatched };
}

export function parseQuery(rawQuery: string): ParsedQuery {
  const normalizedQuery = normalize(rawQuery);

  // 1. Phone intent — highest priority.
  if (looksLikePhone(rawQuery)) {
    const e164 = normalizeIndianPhone(rawQuery);
    if (e164) {
      return {
        rawQuery,
        normalizedQuery,
        detectedPhone: e164,
        detectedNameTerms: [],
        detectedAreas: [],
        detectedCategories: [],
        unmatchedTerms: [],
        intentType: "PHONE_EXACT",
        requiresBranchSelection: false,
      };
    }
  }

  const tokens = normalizedQuery.split(" ").filter(Boolean);

  // 2. Split into segments on and/or so multi-intent can branch.
  const segments: string[][] = [];
  let current: string[] = [];
  for (const t of tokens) {
    if (SPLIT_WORDS.has(t)) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push(t);
    }
  }
  if (current.length) segments.push(current);

  // Consume each segment, then merge.
  const perSegment = segments.map(consumeSegment);

  const allCategories: Category[] = [];
  const allAreas: Area[] = [];
  const nameTerms: string[] = [];
  const unmatched: string[] = [];
  for (const seg of perSegment) {
    for (const c of seg.categories) if (!allCategories.some((x) => x.id === c.id)) allCategories.push(c);
    for (const a of seg.areas) if (!allAreas.some((x) => x.id === a.id)) allAreas.push(a);
    nameTerms.push(...seg.nameTerms);
    unmatched.push(...seg.unmatched);
  }

  // Distinct top-level categories (a group and its child count as related).
  const distinctCategories = allCategories;
  const multipleCategories = distinctCategories.length > 1;
  const multipleAreas = allAreas.length > 1;

  let intentType: IntentType;
  let requiresBranchSelection = false;

  if (multipleCategories) {
    intentType = "MULTIPLE_CATEGORIES";
    requiresBranchSelection = true;
  } else if (multipleAreas) {
    intentType = "MULTIPLE_AREAS";
    requiresBranchSelection = true;
  } else if (distinctCategories.length === 1 && allAreas.length === 1) {
    intentType = "CATEGORY_AREA";
  } else if (distinctCategories.length === 1) {
    intentType = "CATEGORY_ONLY";
  } else if (allAreas.length === 1 && nameTerms.length === 0) {
    intentType = "AREA_ONLY";
  } else if (nameTerms.length > 0 && distinctCategories.length === 0 && allAreas.length === 0) {
    intentType = "PROVIDER_NAME";
  } else if (nameTerms.length > 0) {
    intentType = "PROVIDER_NAME";
  } else {
    intentType = "GENERAL";
  }

  return {
    rawQuery,
    normalizedQuery,
    detectedPhone: null,
    detectedNameTerms: nameTerms,
    detectedAreas: allAreas,
    detectedCategories: distinctCategories,
    unmatchedTerms: unmatched,
    intentType,
    requiresBranchSelection,
  };
}

// Expand a parsed multi-intent query into concrete search branches.
export interface SearchBranch {
  label: string;
  categoryId?: string;
  areaId?: string;
  nameTerms?: string[];
}

export function expandBranches(parsed: ParsedQuery): SearchBranch[] {
  const areas = parsed.detectedAreas.length ? parsed.detectedAreas : [ALL_VADODARA];
  const cats = parsed.detectedCategories;

  if (parsed.intentType === "MULTIPLE_CATEGORIES") {
    // One branch per category, keeping the (single) area.
    const area = parsed.detectedAreas[0];
    return cats.map((c) => ({
      label: area ? `${c.name} in ${area.canonicalName}` : c.name,
      categoryId: c.id,
      areaId: area?.id,
    }));
  }

  if (parsed.intentType === "MULTIPLE_AREAS") {
    const cat = cats[0];
    return parsed.detectedAreas.map((a) => ({
      label: cat ? `${cat.name} in ${a.canonicalName}` : a.canonicalName,
      categoryId: cat?.id,
      areaId: a.id,
    }));
  }

  // Single branch.
  const cat = cats[0];
  const area = parsed.detectedAreas[0];
  return [
    {
      label: cat && area ? `${cat.name} in ${area.canonicalName}` : cat ? cat.name : area ? area.canonicalName : parsed.rawQuery,
      categoryId: cat?.id,
      areaId: area?.id,
      nameTerms: parsed.detectedNameTerms.length ? parsed.detectedNameTerms : undefined,
    },
  ];
}
