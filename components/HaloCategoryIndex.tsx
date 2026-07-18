import Link from "next/link";
import { getTopLevelCategories, getChildren } from "@/lib/data/categories";

// Restrained, text-based directory index. Two/three columns on desktop;
// expandable list on mobile via native <details> (works without JS).

export function HaloCategoryIndex() {
  const groups = getTopLevelCategories();

  return (
    <section aria-labelledby="browse-heading">
      <h2 id="browse-heading" className="font-serif text-2xl text-ink">
        Browse by need
      </h2>

      <div className="mt-6 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => {
          const children = getChildren(group.id).slice(0, 8);
          return (
            <details
              key={group.id}
              className="group border-b border-border py-3 sm:border-none sm:py-0 sm:[&_summary]:cursor-default"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink">
                {group.name}
                <span className="text-ink-faint transition-transform group-open:rotate-45 sm:hidden" aria-hidden>
                  +
                </span>
              </summary>
              <ul className="mt-2 space-y-1 sm:mt-3 sm:mb-6">
                {children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/search?q=${encodeURIComponent(child.name)}`}
                      className="text-sm text-ink-soft hover:text-accent-ink"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
