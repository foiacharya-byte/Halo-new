/**
 * Source registry — the single, authoritative list of where the Vadodara
 * Knowledge Engine is permitted to look.
 *
 * IMPORTANT
 *  - Prohibited directories (Google Maps, Justdial, Sulekha, etc.) are NEVER
 *    added here. `assertNoProhibited()` enforces it.
 *  - Every entry starts `extractorStatus: "not_audited"`. No extractor may run
 *    until an audit report exists and a human flips this to "approved".
 *  - Licences default to unknown/unconfirmed. Publicly accessible ≠ openly
 *    licensed. Image reuse defaults to prohibited/unknown.
 *  - `currencyCaveat` records that "official" is not automatically "current".
 */
import { SourceRegistryEntry } from "./schema";

const CONSERVATIVE = { minDelayMs: 4000, requestsPerMinute: 10, respectCrawlDelay: true as const };
const SLOW = { minDelayMs: 8000, requestsPerMinute: 6, respectCrawlDelay: true as const };

export const SOURCES: SourceRegistryEntry[] = [
  {
    id: "vmc",
    name: "Vadodara Municipal Corporation",
    authority: "Vadodara Municipal Corporation (VMC)",
    category: "municipal",
    homepageUrl: "https://vmc.gov.in/",
    baseUrls: ["https://vmc.gov.in/"],
    accessMethod: "html_extractor",
    apiDocsUrl: null,
    robotsTxtUrl: "https://vmc.gov.in/robots.txt",
    termsUrl: null,
    licenceUrl: null,
    licence: "unknown",
    licenceConfidence: "unconfirmed",
    imageReuse: "prohibited",
    currencyCaveat:
      "Civic pages (helplines, ward offices, tenders) can lag reality; treat every value as as-of the fetch date until re-confirmed.",
    rateLimit: CONSERVATIVE,
    extractorStatus: "not_audited",
    prohibited: false,
    notes: "Target: helplines, ward/zone offices, VMC services. Terms & licence must be located during audit.",
  },
  {
    id: "vadodara_district",
    name: "Vadodara District Administration",
    authority: "Vadodara District Administration (Collectorate), Govt of Gujarat",
    category: "district",
    homepageUrl: "https://vadodara.nic.in/",
    baseUrls: ["https://vadodara.nic.in/"],
    accessMethod: "html_extractor",
    apiDocsUrl: null,
    robotsTxtUrl: "https://vadodara.nic.in/robots.txt",
    termsUrl: "https://vadodara.nic.in/website-policies/",
    licenceUrl: null,
    licence: "unknown",
    licenceConfidence: "unconfirmed",
    imageReuse: "prohibited",
    currencyCaveat:
      "NIC district portals publish notices with their own dates; capture published/updated dates from the page, never assume freshness.",
    rateLimit: CONSERVATIVE,
    extractorStatus: "not_audited",
    prohibited: false,
    notes: "Target: emergency contacts, department directory, public notices. Content usually GIGW/NIC policy-governed.",
  },
  {
    id: "data_gov_in",
    name: "Data.gov.in (Open Government Data Platform India)",
    authority: "National Informatics Centre / MeitY, Government of India",
    category: "national_open_data",
    homepageUrl: "https://www.data.gov.in/",
    baseUrls: ["https://api.data.gov.in/", "https://www.data.gov.in/"],
    accessMethod: "official_api",
    apiDocsUrl: "https://data.gov.in/help/how-use-datasets-apis",
    robotsTxtUrl: "https://www.data.gov.in/robots.txt",
    termsUrl: "https://www.data.gov.in/Godl",
    licenceUrl: "https://www.data.gov.in/Godl",
    licence: "gov_open_data_india", // GODL-India — CONFIRM per dataset during audit
    licenceConfidence: "unconfirmed",
    imageReuse: "unknown",
    currencyCaveat:
      "Datasets carry their own 'updated' timestamps and can be stale for years; store the dataset's own dates, not the fetch date alone.",
    rateLimit: CONSERVATIVE,
    extractorStatus: "not_audited",
    prohibited: false,
    notes:
      "Official API needs a per-account api-key (env DATA_GOV_IN_API_KEY). Per-dataset licence (usually GODL) must be confirmed individually.",
  },
  {
    id: "smart_cities_data",
    name: "Smart Cities Open Data Portal",
    authority: "Smart Cities Mission, MoHUA, Government of India",
    category: "smart_city",
    homepageUrl: "https://smartcities.data.gov.in/",
    baseUrls: ["https://smartcities.data.gov.in/"],
    accessMethod: "open_data_download",
    apiDocsUrl: null,
    robotsTxtUrl: "https://smartcities.data.gov.in/robots.txt",
    termsUrl: null,
    licenceUrl: null,
    licence: "gov_open_data_india",
    licenceConfidence: "unconfirmed",
    imageReuse: "unknown",
    currencyCaveat:
      "Smart-city datasets are project-era snapshots; many are one-off. Never present as live without a fresh update timestamp.",
    rateLimit: CONSERVATIVE,
    extractorStatus: "not_audited",
    prohibited: false,
    notes: "Check whether a Vadodara city node exists and whether datasets are CKAN/API or file downloads.",
  },
  {
    id: "osm_overpass",
    name: "OpenStreetMap (via Overpass API)",
    authority: "OpenStreetMap contributors",
    category: "osm",
    homepageUrl: "https://www.openstreetmap.org/",
    baseUrls: ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"],
    accessMethod: "overpass_api",
    apiDocsUrl: "https://wiki.openstreetmap.org/wiki/Overpass_API",
    robotsTxtUrl: "https://overpass-api.de/robots.txt",
    termsUrl: "https://operations.osmfoundation.org/policies/api/",
    licenceUrl: "https://www.openstreetmap.org/copyright",
    licence: "osm_odbl", // ODbL 1.0 — attribution + share-alike obligations apply
    licenceConfidence: "confirmed",
    imageReuse: "unknown",
    currencyCaveat:
      "Crowd-sourced; accuracy and completeness vary block to block. Records MUST stay osmUnverified until separately confirmed.",
    rateLimit: SLOW,
    extractorStatus: "not_audited",
    prohibited: false,
    notes:
      "Bounded queries to the Vadodara bbox only. Respect the Overpass usage policy (light, cached, off-peak). ODbL share-alike must be honoured on any published derivative.",
  },
  {
    id: "india_post",
    name: "India Post — PIN code / post office directory",
    authority: "Department of Posts, Government of India",
    category: "postal",
    homepageUrl: "https://www.indiapost.gov.in/",
    baseUrls: ["https://www.indiapost.gov.in/"],
    accessMethod: "html_extractor",
    apiDocsUrl: null,
    robotsTxtUrl: "https://www.indiapost.gov.in/robots.txt",
    termsUrl: "https://www.indiapost.gov.in/VAS/Pages/disclaimer.aspx",
    licenceUrl: null,
    licence: "unknown",
    licenceConfidence: "unconfirmed",
    imageReuse: "prohibited",
    currencyCaveat:
      "PIN/post-office lists change rarely but do change (splits, renames). Prefer the data.gov.in PIN dataset (dated) where possible.",
    rateLimit: CONSERVATIVE,
    extractorStatus: "not_audited",
    prohibited: false,
    notes: "A dated 'All India Pincode Directory' also exists on data.gov.in — audit both and prefer the one with clearer licence + dates.",
  },
  {
    id: "gujarat_tourism",
    name: "Gujarat Tourism",
    authority: "Tourism Corporation of Gujarat Ltd (TCGL)",
    category: "tourism",
    homepageUrl: "https://www.gujarattourism.com/",
    baseUrls: ["https://www.gujarattourism.com/"],
    accessMethod: "html_extractor",
    apiDocsUrl: null,
    robotsTxtUrl: "https://www.gujarattourism.com/robots.txt",
    termsUrl: "https://www.gujarattourism.com/terms-and-conditions.html",
    licenceUrl: null,
    licence: "all_rights_reserved", // tourism copy/photos are typically © TCGL
    licenceConfidence: "unconfirmed",
    imageReuse: "prohibited",
    currencyCaveat:
      "Marketing content; timings/fees drift and are often aspirational. Never treat as authoritative for hours or prices without a second source.",
    rateLimit: CONSERVATIVE,
    extractorStatus: "not_audited",
    prohibited: false,
    notes: "TEXT facts about Vadodara attractions only (names, locations, descriptions). NEVER copy TCGL images without confirmed rights.",
  },
  {
    id: "gujarat_state_departments",
    name: "Gujarat State Government departments (entry point)",
    authority: "Government of Gujarat (various departments)",
    category: "state_department",
    homepageUrl: "https://gujaratindia.gov.in/",
    baseUrls: ["https://gujaratindia.gov.in/"],
    accessMethod: "html_extractor",
    apiDocsUrl: null,
    robotsTxtUrl: "https://gujaratindia.gov.in/robots.txt",
    termsUrl: null,
    licenceUrl: null,
    licence: "unknown",
    licenceConfidence: "unconfirmed",
    imageReuse: "prohibited",
    currencyCaveat:
      "Department pages vary widely in freshness and structure; each department is audited and registered as its OWN entry before extraction.",
    rateLimit: CONSERVATIVE,
    extractorStatus: "not_audited",
    prohibited: false,
    notes:
      "Placeholder/entry point. Concrete departments (e.g. Health & Family Welfare, GSRTC, GWSSB, MGVCL, Revenue) get individual registry entries after their own audit — one at a time.",
  },
];

/** Directories Halo must never ingest, regardless of anything else. */
export const PROHIBITED_HOSTS = [
  "google.com/maps",
  "maps.google.com",
  "goo.gl/maps",
  "justdial.com",
  "sulekha.com",
  "yellowpages",
];

export function getSource(id: string): SourceRegistryEntry | undefined {
  return SOURCES.find((s) => s.id === id);
}

/** Fails loudly if a prohibited host ever sneaks into the registry. */
export function assertNoProhibited(): void {
  for (const s of SOURCES) {
    for (const url of [s.homepageUrl, ...s.baseUrls]) {
      const host = url.toLowerCase();
      const bad = PROHIBITED_HOSTS.find((p) => host.includes(p));
      if (bad) throw new Error(`Registry contains a prohibited source (${bad}) in "${s.id}".`);
    }
    if (s.prohibited) throw new Error(`Source "${s.id}" is flagged prohibited and must not be listed.`);
  }
}
