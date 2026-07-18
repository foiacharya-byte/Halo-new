"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// Shared scroll-reveal wrapper: soft upward fade, once per scene, 300-500ms.
// prefers-reduced-motion is handled globally by MotionProvider.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
