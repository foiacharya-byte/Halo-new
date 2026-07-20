"""
scripts/extract/vadodara_places.py — the curated place lists (data, not logic).

These are REAL, well-documented Vadodara place names. They are hand-entered
("curated") and therefore attributed to `src.seed.curated` with status
single_source_needs_review — a real name pending source attribution. Attributes
are kept deliberately sparse: we only carry zone_group / pin_codes for the
original core (all INDICATIVE), and NEVER guess coordinates. A live extractor
later corroborates these against the catalogued directory/census sites and
promotes status to multi_source / confirmed_official.

Format:
  CITY_LOCALITIES: (name, zone_group|None, [pin_codes], [aliases])
  VILLAGES:        (name, taluka|None, [aliases])   -> type="village"
Spelling variants go in [aliases] so validation folds them into one record.
"""

# --- City localities (taluka = Vadodara) -----------------------------------
# The first block (with zone + pins) is the original verified-shape core; the
# second block is the honest expansion (zone/pins left null until verified).
CITY_LOCALITIES = [
    # --- core (indicative zone + pins carried over) ---
    ("Alkapuri", "West", ["390005", "390007"], []),
    ("Sayajigunj", "Central", ["390005", "390020"], ["Sayaji Gunj"]),
    ("Fatehgunj", "North", ["390002"], ["Fateh Gunj"]),
    ("Karelibaug", "East", ["390018"], ["Kareli Baug", "Karelibag"]),
    ("Harni", "East", ["390022"], []),
    ("Sama", "North", ["390008", "390024"], ["Sama-Savli"]),
    ("Gotri", "West", ["390021"], ["Gotri Road"]),
    ("Akota", "West", ["390020"], ["Akota Gardens"]),
    ("Manjalpur", "South", ["390011"], []),
    ("Nizampura", "North", ["390002"], []),
    ("Subhanpura", "West", ["390023"], []),
    ("Vasna", "West", ["390007", "390015"], ["Vasna Road", "Vasna-Bhayli"]),
    ("Tandalja", "West", ["390012"], ["Tandalja Road"]),
    ("Old Padra Road", "West", ["390007", "390015"], ["OP Road", "O P Road"]),
    ("Ellora Park", "West", ["390023"], ["Ellorapark"]),
    ("Race Course", "Central", ["390007"], ["Racecourse"]),
    ("Makarpura", "South", ["390009", "390010", "390013"], ["Makarpura GIDC"]),
    ("Gorwa", "North", ["390016"], ["BIDC Gorwa"]),
    ("Chhani", "North", ["391740"], ["Chani", "Chhani Jakat Naka"]),
    ("Ajwa Road", "East", ["390019"], ["Ajwa"]),
    ("Dandia Bazar", "Central", ["390001"], ["Dandiya Bazar"]),
    ("Mandvi", "Central", ["390001"], []),
    ("Raopura", "Central", ["390001"], []),
    ("Wadi", "Central", ["390017"], []),
    ("Pratapnagar", "South", ["390004"], ["Pratap Nagar"]),
    ("Bapod", "East", ["390019"], []),
    ("Vemali", "East", ["390025"], []),
    ("Diwalipura", "West", ["390015"], ["Diwali Pura", "Divalipura"]),
    ("Waghodia Road", "East", ["390019"], ["Vaghodia Road"]),
    ("Atladara", "West", ["390012"], ["Sun Pharma Road"]),
    ("Manisha", "West", ["390015"], ["Manisha Circle"]),
    ("Vadsar", "South", ["390010"], []),
    ("Tarsali", "South", ["390009"], []),
    # --- honest expansion (zone/pins null = not yet verified) ---
    ("Vadiwadi", None, [], []),
    ("Pratapgunj", None, [], ["Pratap Gunj"]),
    ("Fatehpura", None, [], []),
    ("Amit Nagar", None, [], ["Amitnagar"]),
    ("Nagarwada", None, [], []),
    ("Panigate", None, [], ["Pani Gate"]),
    ("Yakutpura", None, [], []),
    ("Navapura", None, [], ["Nava Pura"]),
    ("Salatwada", None, [], []),
    ("Kothi", None, [], []),
    ("Sursagar", None, [], ["Sur Sagar"]),
    ("Warasiya", None, [], ["Warsiya"]),
    ("Kishanwadi", None, [], ["Kishan Wadi"]),
    ("Jetalpur Road", None, [], ["Jetalpur"]),
    ("New VIP Road", None, [], ["VIP Road"]),
    ("Sardar Estate", None, [], []),
    ("Productivity Road", None, [], []),
    ("Karelibaug Water Tank Road", None, [], []),
    ("Nizampura Road", None, [], []),
    ("Sama Savli Road", None, [], ["Sama-Savli Road"]),
    ("Kalali", None, [], ["Kalali Road"]),
    ("Vadi", None, [], ["Vadi Wadi"]),
]

# --- Villages (taluka set where confident; type = village) ------------------
VILLAGES = [
    ("Sevasi", "Vadodara", []),
    ("Bhayli", "Vadodara", ["Bhayali", "Bhaili"]),
    ("Bhayali", "Vadodara", []),          # deliberate variant to demonstrate merge
    ("Sindhrot", "Vadodara", []),
    ("Angadh", "Vadodara", []),
    ("Undera", "Vadodara", ["Vundera"]),
    ("Vadadala", "Vadodara", []),
    ("Jaspur", "Vadodara", []),
    ("Fajalpur", "Vadodara", []),
    ("Sokhda", "Vadodara", ["Sokhada"]),
    ("Por", "Vadodara", []),
    ("Maneja", "Vadodara", []),
    ("Kapurai", "Vadodara", []),
    ("Dashrath", "Vadodara", ["Dasrath"]),
    ("Sherkhi", "Vadodara", []),
    ("Karachiya", "Vadodara", []),
    ("Bill", "Vadodara", []),
    ("Sayar", "Vadodara", []),
    ("Sanhalim", "Vadodara", []),
    ("Ankhol", "Vadodara", []),
    ("Nandesari", "Savli", ["Nandesari GIDC"]),
    ("Koyali", "Savli", ["Koyali Refinery"]),
    ("Ranoli", "Savli", []),
    ("Bajwa", "Savli", []),
    ("Manjusar", "Savli", ["Manjusar GIDC"]),
    ("Por Ramangamdi", "Vadodara", ["Ramangamdi"]),
    ("Itola", "Vadodara", []),
    ("Vemardi", "Vadodara", []),
    ("Dodka", "Vadodara", []),
    ("Vasna Kotaria", "Vadodara", ["Kotaria"]),
    ("Samiyala", "Vadodara", []),
    ("Kotna", "Vadodara", []),
    ("Ajod", None, []),               # taluka uncertain -> left null (honest)
    ("Karachiya Sim", "Vadodara", []),
    ("Ekalbara", "Padra", []),
    ("Dabhoi Road", None, ["Dabhoi"]),
    ("Bhaili", "Vadodara", []),        # 3rd spelling of Bhayli -> should merge
    ("Sevasi Road", "Vadodara", ["Sevasi"]),   # should merge into Sevasi via alias
]
