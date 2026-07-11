import Link from "next/link";

// Internal review dashboard. In production these routes are gated by an admin
// role check (RLS + server-side authorization); the MVP renders them openly for
// demonstration.

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/seed", label: "Seed research" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink">
            Halo admin
          </p>
          <h1 className="mt-1 font-serif text-2xl text-ink">Review dashboard</h1>
        </div>
      </div>
      <nav className="mb-8 flex flex-wrap gap-1 border-b border-border" aria-label="Admin sections">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-t-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface hover:text-ink"
          >
            {n.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
