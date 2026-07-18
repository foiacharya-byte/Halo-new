import type { Area } from "./types";

// Starter Vadodara area taxonomy. This is a starting point, NOT a claim of
// completeness — admins can add areas, aliases, merges and subdivisions.
// Aliases include common spellings and English/Hinglish/transliterated forms.

function area(
  canonicalName: string,
  aliases: string[],
  opts: Partial<Area> = {}
): Area {
  const slug = canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `area_${slug}`,
    canonicalName,
    slug,
    aliases: aliases.map((a) => a.toLowerCase()),
    isActive: true,
    sortOrder: 0,
    ...opts,
  };
}

export const AREAS: Area[] = [
  area("Alkapuri", ["alkapuri", "alkpuri"]),
  area("Akota", ["akota"]),
  area("Gotri", ["gotri", "gotri road"]),
  area("Karelibaug", ["karelibaug", "kareli baug", "kareli bagh", "karelibag"]),
  area("Manjalpur", ["manjalpur", "manjlpur"]),
  area("Sama", ["sama", "sama road"]),
  area("Fatehgunj", ["fatehgunj", "fatehganj", "fateh gunj"]),
  area("Sayajigunj", ["sayajigunj", "sayaji gunj", "sayajiganj"]),
  area("Subhanpura", ["subhanpura", "shubhanpura"]),
  area("Nizampura", ["nizampura"]),
  area("Harni", ["harni", "harni road"]),
  area("Waghodia Road", ["waghodia", "waghodia road", "vaghodia"]),
  area("Ajwa Road", ["ajwa", "ajwa road"]),
  area("Old Padra Road", ["old padra road", "opr", "padra road"]),
  area("New VIP Road", ["new vip road", "vip road", "nvr"]),
  area("Raopura", ["raopura", "rao pura"]),
  area("Dandia Bazar", ["dandia bazar", "dandiya bazar", "dandia bazaar"]),
  area("Mandvi", ["mandvi"]),
  area("Gorwa", ["gorwa"]),
  area("Atladara", ["atladara", "atladra"]),
  area("Tarsali", ["tarsali"]),
  area("Makarpura", ["makarpura", "makarpura gidc"]),
  area("Vasna", ["vasna", "vasna road"]),
  area("Bhayli", ["bhayli", "bhaili"]),
  area("Sevasi", ["sevasi"]),
  area("Diwalipura", ["diwalipura", "diwali pura"]),
  area("Ellora Park", ["ellora park", "ellorapark"]),
  area("Race Course", ["race course", "racecourse"]),
  area("Chhani", ["chhani", "chani"]),
  area("Chhani Jakat Naka", ["chhani jakat naka", "jakat naka"]),
  area("Sama-Savli Road", ["sama savli road", "sama-savli", "savli road"]),
  area("Sun Pharma Road", ["sun pharma road", "sunpharma road"]),
  area("Kalali", ["kalali"]),
  area("Tandalja", ["tandalja"]),
  area("Mujmahuda", ["mujmahuda", "muj mahuda"]),
  area("Warasiya", ["warasiya", "varasiya"]),
  area("Pratapgunj", ["pratapgunj", "pratapganj"]),
  area("Bapod", ["bapod"]),
  area("Kapurai", ["kapurai"]),
];

export const ALL_VADODARA: Area = {
  id: "area_all",
  canonicalName: "All Vadodara",
  slug: "all-vadodara",
  aliases: ["all vadodara", "vadodara", "baroda", "all"],
  isActive: true,
  sortOrder: -1,
};

const areaBySlug = new Map(AREAS.map((a) => [a.slug, a]));
const areaById = new Map(AREAS.map((a) => [a.id, a]));

export function getAreaBySlug(slug: string): Area | undefined {
  return areaBySlug.get(slug);
}

export function getAreaById(id: string): Area | undefined {
  if (id === ALL_VADODARA.id) return ALL_VADODARA;
  return areaById.get(id);
}

// Build a lookup from every alias token to its area, for the parser.
export const AREA_ALIAS_INDEX: { alias: string; area: Area }[] = AREAS.flatMap(
  (a) => [a.canonicalName.toLowerCase(), ...a.aliases].map((alias) => ({ alias, area: a }))
);
