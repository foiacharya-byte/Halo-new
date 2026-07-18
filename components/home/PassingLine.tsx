"use client";

import { motion, useReducedMotion } from "framer-motion";

// The Passing Line — Halo's one signature visual behaviour (see
// docs/HALO_PRELAUNCH_IMPLEMENTATION_PLAN.md, Phase 1). A thin line that
// represents a trusted number passing from person -> group -> Halo ->
// requester -> outcome. It is generated line art, not photography, so it
// carries no dependency on the missing Vadodara image assets
// (docs/HALO_ASSET_AUDIT.md §5-6).
//
// Two shapes:
//  - "path": a horizontal line threading through a row of labels (used
//    under the hero search, and to connect How-It-Works steps).
//  - "gather": several short lines converging to a single point (used to
//    show scattered word-of-mouth fragments becoming one Halo answer).

export function PassingLinePath({
  labels,
  className,
}: {
  labels: string[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const n = Math.max(labels.length, 1);
  const step = 100 / (n + 1);
  const points = labels.map((_, i) => step * (i + 1));
  const d = `M 0 20 ${points.map((x) => `L ${x} 20`).join(" ")} L 100 20`;

  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-10 w-full overflow-visible">
        <motion.path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          strokeLinecap="round"
          className="text-gold/70"
          initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          whileInView={reduceMotion ? undefined : { pathLength: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        {points.map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={20}
            r={1.4}
            className="fill-gold"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.3 + i * (0.7 / n) }}
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-ink-faint">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </div>
  );
}

// Six origins spaced radially (not corner-to-corner) so the converging
// lines read as a soft gather, not a literal X.
const GATHER_ORIGINS = Array.from({ length: 6 }, (_, i) => {
  const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
  const r = 46;
  return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
});

export function PassingLineGather({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {GATHER_ORIGINS.map((o, i) => {
        const midX = o.x + (50 - o.x) * 0.4;
        const midY = o.y + (50 - o.y) * 0.4 - 3;
        return (
          <motion.path
            key={i}
            d={`M ${o.x} ${o.y} Q ${midX} ${midY} 50 50`}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            strokeLinecap="round"
            className="text-gold/50"
            initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
            whileInView={reduceMotion ? undefined : { pathLength: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, delay: i * 0.1, ease: "easeInOut" }}
          />
        );
      })}
      <motion.circle
        cx={50}
        cy={50}
        r={4}
        className="fill-gold"
        initial={reduceMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.4, delay: reduceMotion ? 0 : 0.55 }}
      />
    </svg>
  );
}

// A short gold pulse — used when a scene wants to signal "verified".
export function PassingLinePulse({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className={className}
      initial={reduceMotion ? { opacity: 0.35 } : { scale: 1, opacity: 0.5 }}
      animate={reduceMotion ? undefined : { scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
      transition={reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
