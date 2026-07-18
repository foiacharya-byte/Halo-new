import { Avatar } from "./Avatar";
import { Reveal } from "./Reveal";

const CONTACTS = [
  { name: "Electrician Rakesh", area: "Gotri" },
  { name: "AC repair Ketan", area: "Alkapuri" },
  { name: "Tiffin Aunty", area: "Sama" },
];

const CHAT_LINES = [
  { mine: false, text: "Anyone know a good tailor nearby?" },
  { mine: true, text: "Try the one near Karelibaug, used them last month." },
];

export function ScenePassItOn() {
  return (
    <section id="pass-it-on" className="bg-paper-deep/40 py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Reveal>
          <h2 className="mx-auto max-w-xl text-center font-serif text-2xl text-ink sm:text-[28px]">
            That one trusted number is probably in your phone.
          </h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 items-center gap-10 sm:grid-cols-2">
          <Reveal className="flex items-center justify-center gap-6">
            <div className="relative w-56 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/halo/matched/04_scene_pass_it_on/phone_frame.svg" alt="" className="w-full" aria-hidden />
              <div className="absolute inset-x-[19%] inset-y-[8%] bottom-[13%] flex flex-col justify-start gap-2 overflow-hidden pt-3">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-ink-faint">My trusted contacts</p>
                {CONTACTS.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 rounded-lg bg-paper p-1.5">
                    <Avatar name={c.name} size={28} />
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-medium text-ink">{c.name}</p>
                      <p className="truncate text-[9px] text-ink-faint">{c.area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden w-48 shrink-0 overflow-hidden rounded-[28px] border border-border bg-paper shadow-card sm:block">
              <div className="flex items-center gap-2 bg-accent px-3 py-2.5">
                <Avatar name="Trusted Circle" size={24} />
                <p className="text-[11px] font-medium text-white">Trusted Circle</p>
              </div>
              <div className="flex flex-col gap-2 p-3">
                {CHAT_LINES.map((l, i) => (
                  <p
                    key={i}
                    className={
                      "w-fit max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[10px] leading-snug " +
                      (l.mine ? "ml-auto bg-accent-soft text-ink" : "border border-border bg-surface text-ink-soft")
                    }
                  >
                    {l.text}
                  </p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                Pass it on. Help someone. Earn Halo Points — from your phone contacts or a WhatsApp
                recommendation you&rsquo;d actually vouch for.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a href="/add" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/halo/matched/04_scene_pass_it_on/source_phone_icon.svg" alt="" className="h-4 w-4" aria-hidden />
                  Add from phone
                </a>
                <a href="/add" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/halo/matched/04_scene_pass_it_on/source_whatsapp_icon.svg" alt="" className="h-4 w-4" aria-hidden />
                  Add from WhatsApp
                </a>
              </div>
              <div className="mt-5 inline-flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/halo/matched/04_scene_pass_it_on/halo_points_plus_3_badge.svg" alt="" className="h-10 w-10" aria-hidden />
                <p className="text-sm text-ink-soft">
                  Earn <strong className="font-medium text-ink">3 Halo Points</strong> once your contact is
                  verified — never for a raw submission.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
