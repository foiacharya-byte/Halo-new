import { Reveal } from "./Reveal";

// Mirrors the real /search behaviour (strong-result vs. no-result — see
// lib/search/parser.ts) without fabricating specific business names or
// ratings: the left panel is a labelled template, not a claim of real data.

export function SceneSearchFirst() {
  return (
    <section id="search-first" className="py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-halo border border-border bg-surface p-6 sm:p-8">
              <h3 className="font-serif text-xl text-ink">Search first. Get answers instantly when we have them.</h3>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-paper p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/halo/matched/03_scene_search_or_request/result_avatar_01.svg" alt="" className="h-10 w-10 shrink-0 rounded-full" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">AC repair · Gotri</p>
                    <p className="truncate text-xs text-ink-faint">Category and area confirmed · updated recently</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/halo/matched/03_scene_search_or_request/search_success_check.svg" alt="" className="h-6 w-6 shrink-0" aria-hidden />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-paper p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/halo/matched/03_scene_search_or_request/result_avatar_02.svg" alt="" className="h-10 w-10 shrink-0 rounded-full" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">Tailor · Karelibaug</p>
                    <p className="truncate text-xs text-ink-faint">Community-vouched · used within 3 months</p>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/halo/matched/03_scene_search_or_request/search_success_check.svg" alt="" className="h-6 w-6 shrink-0" aria-hidden />
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-soft">
                Every result shows why it matched and what was actually verified — not a star rating
                pretending to be certainty.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-halo border border-coral/30 bg-coral-soft p-6 sm:p-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/halo/matched/03_scene_search_or_request/coral_sparkles.svg" alt="" className="absolute right-4 top-4 h-10 w-10" aria-hidden />
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/halo/matched/03_scene_search_or_request/no_result_question.svg" alt="" className="h-12 w-12 shrink-0" aria-hidden />
                <h3 className="font-serif text-xl text-ink">Not found yet? Let the community help.</h3>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                When Halo doesn&rsquo;t have a strong enough answer yet, post the request. Someone in
                Vadodara may pass on a number they&rsquo;d personally vouch for.
              </p>
              <div className="mt-5 flex items-center gap-3 rounded-lg border border-dashed border-coral/40 bg-surface/70 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/halo/matched/03_scene_search_or_request/request_avatar_stack.svg" alt="" className="h-9 shrink-0" aria-hidden />
                <div>
                  <p className="text-sm text-ink">&ldquo;Classical music teacher for kids in Manjalpur&rdquo;</p>
                  <p className="mt-1 text-xs text-ink-faint">We don&rsquo;t have a strong enough answer yet.</p>
                </div>
              </div>
              {/* /request/new doesn't exist yet — mirrors the real no-result
                  CTA HaloEmptySearch already uses today (routes to /add). */}
              <div className="mt-5">
                <a
                  href="/add"
                  className="inline-block rounded-full bg-coral px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral/90"
                >
                  Post this request
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
