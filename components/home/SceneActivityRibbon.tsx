import { Avatar } from "./Avatar";

const ACTIVITY = [
  { name: "Meera", text: "Meera passed on AC technician in Gotri", time: "5m ago" },
  { name: "Yash", text: "Yash posted a request for maid in Sama", time: "12m ago" },
  { name: "Dhruv", text: "Dhruv confirmed contact for laptop repair in Akota", time: "18m ago" },
  { name: "Kavyo", text: "Kavyo earned 3 Halo Points for a verified contact", time: "27m ago" },
  { name: "Nilesh", text: "Nilesh's request for gym in Akota was answered", time: "32m ago" },
];

// Illustrative preview — no live activity feed exists yet. Real area names
// (lib/data/areas.ts), fictional example activity per
// public/assets/halo/matched/docs/PHOTO_SOURCES_AND_LICENSES.md.
export function SceneActivityRibbon() {
  return (
    <div className="overflow-hidden bg-accent py-4" aria-label="Illustrative preview of Halo activity across Vadodara">
      <div className="mx-auto mb-2 max-w-content px-4 sm:px-6">
        <span className="inline-flex items-center rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white/80">
          Illustrative preview · Vadodara is active on Halo
        </span>
      </div>
      <div className="flex w-max animate-[marquee_40s_linear_infinite] gap-10 px-4 motion-reduce:animate-none sm:px-6">
        {[...ACTIVITY, ...ACTIVITY].map((a, i) => (
          <div key={i} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap">
            <Avatar name={a.name} size={32} className="border-2 border-white/40" />
            <span className="text-sm text-white">
              {a.text} <span className="text-white/60">· {a.time}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
