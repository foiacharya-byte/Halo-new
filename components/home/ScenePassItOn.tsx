import { Button } from "@/components/ui";
import { Reveal } from "./Reveal";

// Scene 4 — Pass It On. Coded UI mockups instead of photography (no real
// phone/WhatsApp image asset exists — docs/HALO_ASSET_AUDIT.md items D/E).
// Categories only, never invented names or numbers. All three actions open
// the same guided manual form per the spec's MVP scoping instruction.

const CONTACT_ROWS = [
  { label: "Electrician", area: "Gotri" },
  { label: "AC repair", area: "Alkapuri" },
  { label: "Music teacher", area: "Manjalpur" },
];

const CHAT_LINES = [
  { from: "group", text: "Anyone know a good tailor nearby?" },
  { from: "reply", text: "Try the one near Karelibaug, used them last month." },
];

export function ScenePassItOn() {
  return (
    <section id="pass-it-on" className="py-12 sm:py-16" aria-labelledby="pass-it-on-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <h2 id="pass-it-on-heading" className="font-serif text-2xl text-ink sm:text-[28px]">
              There is probably one excellent number hiding in your phone.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Reveal>
            <div className="rounded-halo border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                My trusted contacts
              </p>
              <div className="mt-3 divide-y divide-border">
                {CONTACT_ROWS.map((c) => (
                  <div key={c.label} className="flex items-center gap-3 py-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-sm text-gold" aria-hidden>
                      {c.label[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-ink">{c.label}</p>
                      <p className="truncate text-xs text-ink-faint">{c.area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-halo border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                From a society WhatsApp group
              </p>
              <div className="mt-3 space-y-2">
                {CHAT_LINES.map((l, i) => (
                  <p
                    key={i}
                    className={
                      "w-fit max-w-[90%] rounded-halo px-3 py-2 text-sm " +
                      (l.from === "group"
                        ? "bg-paper text-ink-soft"
                        : "ml-auto bg-gold-soft text-ink")
                    }
                  >
                    {l.text}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/add" variant="primary">
              Add from my phone
            </Button>
            <Button href="/add" variant="secondary">
              Add from a WhatsApp recommendation
            </Button>
            <Button href="/add" variant="ghost">
              Manual entry
            </Button>
          </div>
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-ink-faint">
            Verified trusted contact: <span className="font-medium text-gold">+3 Halo Points</span>.
            Helps a real request succeed: additional points, once verified.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
