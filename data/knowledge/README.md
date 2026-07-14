# data/knowledge

Working data for the Vadodara Knowledge Engine (`lib/knowledge`).

| Folder       | Committed? | Contents                                                        |
|--------------|-----------|------------------------------------------------------------------|
| `cache/`     | no        | Content-addressed HTTP cache (obeys TTL). Safe to delete.        |
| `audits/`    | **yes**   | Per-source audit reports (`<id>-<date>.json` + `.md`).           |
| `logs/`      | no        | `ingestion.jsonl` — one line per audit/fetch/extract run.        |
| `processed/` | **yes**   | Normalised `KnowledgeRecord[]` per source (added after approval).|

`cache/` and `logs/` are git-ignored (see their `.gitignore`). Audit reports are
committed so the provenance/permission trail is reviewable in the repo.
