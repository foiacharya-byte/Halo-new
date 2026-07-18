import { Button } from "@/components/ui";
import { Reveal } from "./Reveal";

// Scene 3 — Search first, or post a request. This mirrors the real /search
// behaviour (strong-result vs. no-result — see lib/search/parser.ts and
// app/search/page.tsx) without fabricating specific business names, ratings
// or review counts here: the left panel is a labelled template of *what a
// result looks like*, not a claim that these are real listings.

export function SceneSearchFirst() {
  return (
    <section id="search-first" className="py-16 sm:py-20" aria-labelledby="search-first-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Reveal>
          <h2 id="search-first-heading" className="sr-only">
            Search first, or post a request
          </h2>
        </Reveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-halo border border-border bg-surface p-6 sm:p-8">
              <h3 className="font-serif text-xl text-ink">
                Search first. Get answers instantly when we have them.
              </h3>
              <div className="mt-5 rounded-lg border border-dashed border-border bg-paper p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  What a result looks like
                </p>
                <div className="mt-3 space-y-3">
                  <ResultTemplateRow
                    category="AC repair"
                    area="Gotri"
                    note="Category and area confirmed · updated recently"
                  />
                  <ResultTemplateRow
                    category="Tailor"
                    area="Karelibaug"
                    note="Community-vouched · used within 3 months"
                  />
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-soft">
                Every result shows why it matched and what was actually verified — not a star rating
                pretending to be certainty.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="h-full rounded-halo border border-coral/30 bg-coral-soft p-6 sm:p-8">
              <h3 className="font-serif text-xl text-ink">Not found yet? Let the community help.</h3>
              <p className="mt-3 text-sm text-ink-soft">
                When Halo doesn&rsquo;t have a strong enough answer yet, post the request. Someone in
                Vadodara may pass on a number they&rsquo;d personally vouch for.
              </p>
              <div className="mt-5 rounded-lg border border-dashed border-coral/40 bg-surface/70 p-4">
                <p className="text-sm text-ink">
                  &ldquo;Classical music teacher for kids in Manjalpur&rdquo;
                </p>
                <p className="mt-1 text-xs text-ink-faint">We don&rsquo;t have a strong enough answer yet.</p>
              </div>
              {/* /request/new doesn't exist until Phase 2 (docs/HALO_PAGE_STATES.md §4);
                  this mirrors the real no-result CTA HaloEmptySearch already uses today. */}
              <div className="mt-5">
                <Button href="/add" variant="coral">
                  Post this request
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ResultTemplateRow({ category, area, note }: { category: string; area: string; note: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">
          {category} · {area}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-faint">{note}</p>
      </div>
      <span className="shrink-0 text-xs text-accent-ink">View details →</span>
    </div>
  );
}
