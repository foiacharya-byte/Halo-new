"""
halo/models.py — the four entities + the common envelope, as plain dataclasses.

Why dataclasses (not a DB/ORM)? Zero dependencies, trivially serialised to the
JSON/CSV that Phase 4 needs, and readable by a non-engineer. When the dataset
outgrows flat files we can swap the storage layer without changing these shapes.

The COMMON ENVELOPE (source_links, last_updated, confidence, needs_review,
takedown) is mixed into every entity so trust/provenance/freshness can never be
forgotten — they are fields, not conventions.
"""
from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional

from .util import now_iso


@dataclass
class Envelope:
    """Trust/provenance/freshness carried by every record."""
    id: str = ""
    source_links: list[str] = field(default_factory=list)   # provenance (URLs)
    source_ids: list[str] = field(default_factory=list)     # ids from sources.json
    last_updated: str = field(default_factory=now_iso)
    confidence: float = 0.0          # 0..1 — how sure are we of this record
    needs_review: bool = True        # human should look before it's "trusted"
    takedown: bool = False           # DPDP right-to-remove: hard-hide if True

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Area(Envelope):
    name: str = ""
    type: str = ""                   # ward | locality | village | census_town
    taluka: Optional[str] = None     # Vadodara | Savli | Waghodia | Padra | ...
    zone_group: Optional[str] = None    # VMC zone (North/South/East/West/Central) — INDICATIVE
    ward_number: Optional[str] = None
    pin_codes: list[str] = field(default_factory=list)  # INDICATIVE until India Post-verified
    coordinates: Optional[dict] = None  # {"lat": float, "lon": float} or None (never guessed)
    coordinates_source: Optional[str] = None  # openstreetmap | demo_fixture | None
    aliases: list[str] = field(default_factory=list)
    # status: confirmed_official (>=1 official src) | multi_source (>=2 independent)
    #       | single_source_needs_review (default for curated seed)
    status: str = "single_source_needs_review"


@dataclass
class Service(Envelope):
    name: str = ""
    category: str = ""               # food | electrician | clinic | ...
    description_summary: str = ""
    address: str = ""
    locality: str = ""
    phone_numbers: list[str] = field(default_factory=list)  # normalised, NEVER auto-shown
    contact_consent: bool = False    # true ONLY after owner claims + consents (DPDP)
    rating_score: Optional[float] = None   # external rating, e.g. 4.9
    rating_count: Optional[int] = None
    halo_rating: Optional[float] = None    # our computed score (validate step)
    halo_five_star: bool = False           # our high-trust badge
    permanently_closed: bool = False
    coordinates: Optional[dict] = None   # {"lat","lon"} — only when a source provides it
    is_demo: bool = False                # True = placeholder fixture, never a real listing
    source_platforms: list[str] = field(default_factory=list)
    last_seen: str = field(default_factory=now_iso)


@dataclass
class NewsEvent(Envelope):
    title: str = ""
    short_summary: str = ""
    date: str = ""                   # ISO date of the event/article
    tags: list[str] = field(default_factory=list)   # flood|crime|civic|politics|...
    locations_involved: list[str] = field(default_factory=list)
    sentiment: str = "neutral"       # positive | neutral | negative
    status: str = "reported"         # reported | confirmed (>=2 major sources)
    cluster_id: Optional[str] = None # groups articles about the same event


@dataclass
class TripSpot(Envelope):
    name: str = ""
    distance_km: Optional[float] = None   # from Vadodara city centre
    type: str = ""                   # temple | dam | hill | picnic | nightlife | ...
    best_for_mood: list[str] = field(default_factory=list)  # peaceful|spiritual|party|...
    description_summary: str = ""
    how_to_reach: str = ""


ENTITY_CLASSES = {
    "area": Area,
    "service": Service,
    "news_event": NewsEvent,
    "trip_spot": TripSpot,
}
