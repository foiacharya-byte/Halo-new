import type { ReactNode } from "react";

// A real device frame — bezel, dynamic island, home indicator — instead of
// a flat rounded rectangle standing in for "a phone". Purely a screen
// container: whatever is passed as children fills the clipped viewport.
export default function IphoneFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  // Always include an explicit width utility (e.g. "w-44") — this
  // component intentionally has no default width of its own, since a
  // baked-in `w-full` here would collide with the caller's width class at
  // equal CSS specificity and win unpredictably depending on Tailwind's
  // generated stylesheet order, not the className string order.
  className: string;
}) {
  return (
    <div className={`relative aspect-[9/19.5] ${className}`}>
      <div className="absolute inset-0 rounded-[2.6rem] bg-[#111714] shadow-2xl" />
      <div className="absolute inset-[3px] rounded-[2.4rem] bg-[#111714] ring-1 ring-white/10" />
      <div className="absolute inset-[10px] overflow-hidden rounded-[2.05rem] bg-surface">
        {children}
      </div>
      {/* Dynamic island */}
      <div className="absolute left-1/2 top-[18px] h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-[#111714]" />
      {/* Home indicator */}
      <div className="absolute bottom-[14px] left-1/2 h-[4px] w-[110px] -translate-x-1/2 rounded-full bg-ink/25" />
    </div>
  );
}
