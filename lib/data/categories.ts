import type { Category, RiskLevel } from "./types";

// Extensible category taxonomy. Aliases and search keywords live here (in the
// "database"), not hard-coded inside components — they power the parser and
// deterministic search.

let order = 0;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Def {
  name: string;
  aliases?: string[];
  keywords?: string[];
  risk?: RiskLevel;
  iconKey?: string;
  seedable?: boolean;
}

const groups: { group: Def; children: Def[] }[] = [
  {
    group: { name: "Home repair and maintenance", iconKey: "wrench" },
    children: [
      { name: "Electrician", aliases: ["electrical", "light repair", "switch repair", "fan repair", "wiring", "bijli", "current ka kaam"], keywords: ["fan", "switchboard", "mcb", "inverter"] },
      { name: "Plumber", aliases: ["plumbing", "nal", "pipe repair", "tap repair", "leakage"] },
      { name: "Carpenter", aliases: ["carpentry", "sutar", "furniture repair", "woodwork"] },
      { name: "Painter", aliases: ["painting", "wall painting", "colour", "putty"] },
      { name: "Locksmith", aliases: ["lock repair", "key maker", "chabi"] },
      { name: "Appliance repair", aliases: ["appliance", "washing machine repair", "fridge repair", "microwave repair"] },
      { name: "AC repair", aliases: ["ac", "air conditioner", "ac service", "ac gas"] },
      { name: "RO repair", aliases: ["ro", "water purifier", "ro service"] },
      { name: "Pest control", aliases: ["pest", "cockroach", "termite", "fumigation"] },
      { name: "Home cleaning", aliases: ["cleaning", "deep cleaning", "house cleaning", "safai"] },
      { name: "Waterproofing", aliases: ["waterproof", "leak seal", "terrace waterproofing"] },
      { name: "CCTV installation", aliases: ["cctv", "camera", "security camera"] },
      { name: "Packers and movers", aliases: ["packers", "movers", "shifting", "relocation"] },
    ],
  },
  {
    group: { name: "Appliance and electronics repair", iconKey: "plug" },
    children: [
      { name: "Mobile repair", aliases: ["mobile", "phone repair", "screen replacement"] },
      { name: "Laptop repair", aliases: ["laptop", "notebook repair"] },
      { name: "Computer repair", aliases: ["computer", "pc repair", "desktop repair"] },
      { name: "TV repair", aliases: ["tv", "television repair", "led repair"] },
    ],
  },
  {
    group: { name: "Food and daily needs", iconKey: "utensils" },
    children: [
      { name: "Tiffin", aliases: ["dabba", "lunch service", "home food", "ghar ka khana", "meal service", "tiffin service"], keywords: ["lunch", "dinner", "veg", "jain"] },
      { name: "Home food", aliases: ["homemade food", "ghar ka khana"] },
      { name: "Caterer", aliases: ["catering", "catrer"] },
      { name: "Home baker", aliases: ["baker", "home bakes", "cake", "homebaker"] },
      { name: "Bakery", aliases: ["cake shop", "pastry"] },
      { name: "Meal service", aliases: ["subscription meals"] },
    ],
  },
  {
    group: { name: "Education and classes", iconKey: "book" },
    children: [
      { name: "Maths tutor", aliases: ["maths tuition", "math teacher", "maths teacher", "ganit"] },
      { name: "Science tutor", aliases: ["science tuition", "physics tutor", "chemistry tutor", "biology tutor"] },
      { name: "Language tutor", aliases: ["english tutor", "spoken english", "hindi tutor", "gujarati tutor"] },
      { name: "Music teacher", aliases: ["music class", "keyboard class", "guitar class", "singing class"] },
      { name: "Dance class", aliases: ["dance", "dancing class", "garba class"] },
      { name: "Art class", aliases: ["drawing class", "painting class", "sketching"] },
      { name: "Coding class", aliases: ["coding", "programming class", "computer class"] },
      { name: "Driving school", aliases: ["driving class", "car driving", "learn driving"] },
    ],
  },
  {
    group: { name: "Tailoring, laundry and clothing", iconKey: "scissors" },
    children: [
      { name: "Tailor", aliases: ["tailoring", "darji", "stitching", "blouse stitching"], keywords: ["blouse", "suit", "kurta"] },
      { name: "Boutique", aliases: ["designer", "boutique wear"] },
      { name: "Alteration", aliases: ["cloth alteration", "fitting", "altering"] },
      { name: "Laundry", aliases: ["dhobi", "washing", "ironing", "istri"] },
      { name: "Dry cleaning", aliases: ["dry clean", "drycleaner"] },
    ],
  },
  {
    group: { name: "Beauty and personal care", iconKey: "sparkles" },
    children: [
      { name: "Salon", aliases: ["parlour", "beauty parlour", "hair salon", "unisex salon"] },
      { name: "Barber", aliases: ["hair cutting", "hajam", "mens salon"] },
      { name: "Makeup artist", aliases: ["makeup", "bridal makeup", "mua"] },
      { name: "Mehendi artist", aliases: ["mehendi", "henna", "mehndi"] },
    ],
  },
  {
    group: { name: "Events and weddings", iconKey: "confetti" },
    children: [
      { name: "Photographer", aliases: ["photography", "photoshoot", "wedding photographer"] },
      { name: "Decorator", aliases: ["decoration", "event decor", "flower decoration"] },
      { name: "DJ", aliases: ["dj service", "sound system"] },
      { name: "Event caterer", aliases: ["event catering", "wedding caterer"] },
      { name: "Florist", aliases: ["flower shop", "flowers", "phool"] },
      { name: "Pandit", aliases: ["priest", "purohit", "pooja"] },
      { name: "Venue", aliases: ["banquet", "party plot", "hall"] },
    ],
  },
  {
    group: { name: "Automotive", iconKey: "car" },
    children: [
      { name: "Mechanic", aliases: ["garage", "car repair", "auto repair"] },
      { name: "Puncture repair", aliases: ["puncture", "tyre repair"] },
      { name: "Towing", aliases: ["tow", "crane service"] },
      { name: "Car wash", aliases: ["car cleaning", "car washing"] },
      { name: "Detailing", aliases: ["car detailing", "polishing"] },
      { name: "Battery service", aliases: ["battery", "car battery", "jump start"] },
      { name: "Two-wheeler repair", aliases: ["bike repair", "scooter repair", "two wheeler"] },
    ],
  },
  {
    group: { name: "Pets", iconKey: "paw" },
    children: [
      { name: "Veterinary clinic", aliases: ["vet", "veterinary", "pet doctor"], risk: "sensitive" },
      { name: "Pet groomer", aliases: ["grooming", "dog grooming", "pet grooming"] },
      { name: "Pet boarding", aliases: ["boarding", "pet hostel", "dog boarding"] },
      { name: "Pet trainer", aliases: ["dog trainer", "training"] },
      { name: "Pet shop", aliases: ["pet store"] },
    ],
  },
  {
    group: { name: "Health", iconKey: "health", risk: "high_stakes" },
    children: [
      { name: "Doctor", aliases: ["physician", "clinic", "gp"], risk: "high_stakes", seedable: true },
      { name: "Dentist", aliases: ["dental clinic", "dental"], risk: "high_stakes", seedable: true },
      { name: "Diagnostic laboratory", aliases: ["lab", "pathology", "blood test"], risk: "high_stakes", seedable: true },
      { name: "Mental-health professional", aliases: ["psychologist", "psychiatrist", "counsellor", "therapist"], risk: "high_stakes", seedable: true },
      { name: "Physiotherapist", aliases: ["physio", "physiotherapy"], risk: "sensitive" },
    ],
  },
  {
    group: { name: "Home-support agencies", iconKey: "home", risk: "sensitive" },
    children: [
      { name: "Childcare agency", aliases: ["nanny agency", "babysitter agency", "creche"], risk: "sensitive" },
      { name: "Elder-care agency", aliases: ["elder care", "attendant agency", "caretaker agency"], risk: "sensitive" },
      { name: "Domestic-help agency", aliases: ["maid agency", "househelp agency", "bai agency"], risk: "sensitive" },
    ],
  },
  {
    group: { name: "Professional services", iconKey: "briefcase" },
    children: [
      { name: "Chartered accountant", aliases: ["ca", "accountant", "tax consultant"], risk: "high_stakes" },
      { name: "Lawyer", aliases: ["advocate", "legal", "vakil"], risk: "high_stakes" },
      { name: "Architect", aliases: ["architecture"] },
      { name: "Interior designer", aliases: ["interior design", "interiors"] },
      { name: "Printer", aliases: ["printing", "print shop", "digital printing"] },
      { name: "Graphic designer", aliases: ["graphic design", "designer", "logo design"] },
      { name: "Financial advisor", aliases: ["financial advisor", "investment advisor", "wealth advisor"], risk: "high_stakes" },
    ],
  },
  {
    group: { name: "Local shops", iconKey: "store" },
    children: [
      { name: "Grocery store", aliases: ["kirana", "grocery", "provision store"] },
      { name: "Stationery shop", aliases: ["stationery", "stationary"] },
      { name: "Hardware shop", aliases: ["hardware", "sanitary"] },
      { name: "Medical store", aliases: ["pharmacy", "chemist", "medical"], risk: "sensitive" },
    ],
  },
  {
    group: { name: "Travel, delivery and transport", iconKey: "truck" },
    children: [
      { name: "Cab service", aliases: ["taxi", "car rental", "cab"] },
      { name: "Auto rickshaw", aliases: ["rickshaw", "auto"] },
      { name: "Courier", aliases: ["courier service", "parcel"] },
      { name: "Local delivery", aliases: ["pickup drop", "delivery boy"] },
      { name: "Tempo / goods carrier", aliases: ["tempo", "goods carrier", "chhota hathi"] },
    ],
  },
];

function buildCategories(): Category[] {
  const out: Category[] = [];
  for (const { group, children } of groups) {
    const gslug = slugify(group.name);
    const groupId = `cat_${gslug}`;
    out.push({
      id: groupId,
      parentId: null,
      name: group.name,
      slug: gslug,
      aliases: (group.aliases ?? []).map((a) => a.toLowerCase()),
      searchKeywords: group.keywords ?? [],
      iconKey: group.iconKey,
      riskLevel: group.risk ?? "standard",
      isSeedable: group.seedable ?? true,
      isActive: true,
      sortOrder: order++,
    });
    for (const child of children) {
      const cslug = slugify(child.name);
      out.push({
        id: `cat_${cslug}`,
        parentId: groupId,
        name: child.name,
        slug: cslug,
        aliases: (child.aliases ?? []).map((a) => a.toLowerCase()),
        searchKeywords: child.keywords ?? [],
        iconKey: group.iconKey,
        riskLevel: child.risk ?? group.risk ?? "standard",
        isSeedable: child.seedable ?? (child.risk === "high_stakes" ? false : true),
        isActive: true,
        sortOrder: order++,
      });
    }
  }
  return out;
}

export const CATEGORIES: Category[] = buildCategories();

const catById = new Map(CATEGORIES.map((c) => [c.id, c]));
const catBySlug = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function getCategoryById(id: string): Category | undefined {
  return catById.get(id);
}
export function getCategoryBySlug(slug: string): Category | undefined {
  return catBySlug.get(slug);
}
export function getTopLevelCategories(): Category[] {
  return CATEGORIES.filter((c) => c.parentId === null).sort((a, b) => a.sortOrder - b.sortOrder);
}
export function getChildren(parentId: string): Category[] {
  return CATEGORIES.filter((c) => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
}

// Alias index for the parser: every alias/keyword/name -> category.
export const CATEGORY_ALIAS_INDEX: { alias: string; category: Category }[] = CATEGORIES.flatMap(
  (c) => {
    const terms = new Set<string>([
      c.name.toLowerCase(),
      ...c.aliases,
      ...c.searchKeywords.map((k) => k.toLowerCase()),
    ]);
    return Array.from(terms).map((alias) => ({ alias, category: c }));
  }
);
