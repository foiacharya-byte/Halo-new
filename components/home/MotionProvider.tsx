"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// App-wide reduced-motion guarantee: every framer-motion animation anywhere
// in the tree honours the OS/browser prefers-reduced-motion setting, on top
// of the CSS-level rule already in app/globals.css for pure CSS transitions.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
