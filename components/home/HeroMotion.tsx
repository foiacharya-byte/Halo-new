"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Floating glass panel — real Halo content (trust cards, activity), not
// decoration. Gentle vertical drift only; MotionProvider's
// reducedMotion="user" config already turns this off for anyone who has
// asked their OS for less motion.
export function FloatCard({
  children,
  className = "",
  rotate = 0,
  delay = 0,
  duration = 5,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={className}
      style={{ rotate }}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
      whileHover={{ rotate: 0 }}
    >
      {children}
    </motion.div>
  );
}

// Signature rotating badge — Halo's own take on the "passing it on" motion
// motif: trust travels in a loop, person to person.
export function SpinBadge({ label, className = "" }: { label: string; className?: string }) {
  const pathId = "hero-spin-badge-path";
  return (
    <div className={className}>
      <div className="absolute inset-0 rounded-full bg-gold shadow-2xl" />
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <path id={pathId} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
          <text className="fill-accent-ink text-[10.5px] font-bold uppercase tracking-[0.15em]">
            <textPath href={`#${pathId}`} startOffset="0%">
              {label}
            </textPath>
          </text>
        </svg>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent-ink" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7 17L17 7M17 7H9M17 7V15" />
        </svg>
      </div>
    </div>
  );
}
