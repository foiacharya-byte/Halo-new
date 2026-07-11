import { CATEGORIES, getCategoryById } from "./categories";
import { AREAS, ALL_VADODARA } from "./areas";
import type { Option } from "@/components/HaloSelectors";

// Serializable option lists for client selectors. Categories list leaf services
// (with their group as a secondary label); groups themselves are also
// selectable.

export function categoryOptions(): Option[] {
  return CATEGORIES.filter((c) => c.parentId !== null).map((c) => ({
    id: c.id,
    label: c.name,
    group: getCategoryById(c.parentId!)?.name,
  }));
}

export function areaOptions(includeAll = true): Option[] {
  const base = AREAS.map((a) => ({ id: a.id, label: a.canonicalName }));
  return includeAll ? [{ id: ALL_VADODARA.id, label: ALL_VADODARA.canonicalName }, ...base] : base;
}
