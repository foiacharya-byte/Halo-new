"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Scroll-reveal wrapper, matching the five reveal types from the reference
// build's .js-r / .js-rs / .js-rr / .js-rl / .js-big CSS classes.
// prefers-reduced-motion is handled globally by MotionProvider.

const VARIANTS = {
  up: { initial: { opacity: 0, y: 64 }, duration: 1 },
  scale: { initial: { opacity: 0, y: 32, scale: 1.1 }, duration: 1.3 },
  right: { initial: { opacity: 0, x: 96 }, duration: 1 },
  left: { initial: { opacity: 0, x: -96 }, duration: 1 },
  big: { initial: { opacity: 0, y: 96, scale: 0.93 }, duration: 1.5 },
} as const;

export function Reveal({
  children,
  delay = 0,
  variant = "up",
  className,
}: {
  children: ReactNode;
  delay?: number;
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const v = VARIANTS[variant];
  return (
    <motion.div
      className={className}
      initial={v.initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: v.duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
