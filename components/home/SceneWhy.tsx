import { Reveal } from "./Reveal";

const WHY_LINES: [string, string][] = [
  ["The names people ", "trust."],
  ["The places they ", "return to."],
  ["The food they ", "recommend."],
  ["The events they wish ", "more people knew about."],
];

export function SceneWhy() {
  return (
    <section id="why" className="relative z-[1] overflow-hidden bg-paper-deep/70 px-6 py-[clamp(80px,10vw,120px)] sm:px-16">
      <div className="relative z-[1] mx-auto max-w-[1200px]">
        <div className="mx-auto mb-[clamp(48px,6vw,80px)] max-w-[780px] text-center">
          <Reveal variant="left">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">How Baroda already works</p>
          </Reveal>
          <Reveal variant="big">
            <h2 className="font-display mb-[clamp(24px,3vw,38px)] text-[clamp(32px,4.5vw,58px)] font-normal leading-[1.08] tracking-tight text-ink">
              The best things in Baroda
              <br />
              <em className="italic text-ink-soft">usually come through someone you trust.</em>
            </h2>
          </Reveal>
          <Reveal>
            <p className="mx-auto max-w-[58ch] text-[clamp(16px,1.6vw,19px)] leading-[1.72] text-ink-soft">
              A neighbour&rsquo;s number. A cousin&rsquo;s recommendation. A society group message. A saved
              contact. An Instagram story. A place someone says,{" "}
              <span className="font-gu text-accent">&ldquo;અહીં જજો.&rdquo;</span> That is how Baroda finds what
              is good — but most of it disappears inside phones, groups, pages, and conversations. Halo is being
              built to bring that trusted local life into one shared place.
            </p>
          </Reveal>
        </div>

        <Reveal>
          <p className="font-serif mx-auto max-w-[24ch] text-center text-[clamp(18px,2vw,26px)] italic leading-[1.3] tracking-tight text-accent">
            Word of mouth — <span className="text-ink-soft">finally written down.</span>
          </p>
        </Reveal>

        <Reveal>
          <div className="mt-[clamp(32px,4.2vw,56px)] grid grid-cols-1 gap-x-[clamp(40px,6vw,84px)] gap-y-[clamp(26px,3.4vw,52px)] sm:grid-cols-2">
            {WHY_LINES.map(([lead, emph]) => (
              <div key={lead + emph} className="border-t border-ink/15 pt-[clamp(15px,1.8vw,22px)]">
                <p className="font-serif text-[clamp(19px,2vw,27px)] font-normal leading-[1.24] tracking-tight text-[#E8DFC9]">
                  {lead}
                  <em className="italic">{emph}</em>
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <p className="font-serif mx-auto mt-[clamp(42px,5.5vw,72px)] max-w-[22ch] text-center text-[clamp(24px,2.9vw,42px)] font-normal leading-[1.18] tracking-tight text-ink">
            All of it — <em className="italic text-accent">finally seen properly.</em>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
