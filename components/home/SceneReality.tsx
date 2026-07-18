"use client";

import { motion } from "framer-motion";
import { PassingLineGather } from "./PassingLine";
import { Reveal } from "./Reveal";

// Scene 2 — The Reality. Illustrative, unattributed fragments of how people
// actually ask around today (no invented names, no claim these are real
// messages) gathering into one Halo answer via The Passing Line.

const FRAGMENTS = [
  "Any good AC technician?",
  "Does anyone know a reliable maid?",
  "Need a tailor near Karelibaug",
  "Ask in the society group.",
  "I have one number, I'll share.",
];

export function SceneReality() {
  return (
    <section id="reality" className="py-16 sm:py-20" aria-labelledby="reality-heading">
      <div className="mx-auto grid max-w-content gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <div>
            <h2 id="reality-heading" className="font-serif text-2xl text-ink sm:text-[28px]">
              Today, answers are everywhere.{" "}
              <span className="text-coral">But not always reliable.</span>
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
              People ask. Wait. Hope someone in the group replies before the plumber leaves for the
              day. Useful local knowledge already lives in conversations and phones — Halo helps stop
              it from getting lost.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          <div className="space-y-2.5">
            {FRAGMENTS.map((f, i) => (
              <motion.p
                key={f}
                initial={{ opacity: 0, x: i % 2 === 0 ? -18 : 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={
                  "w-fit max-w-[85%] rounded-halo border border-border bg-surface px-4 py-2 text-sm text-ink-soft shadow-card " +
                  (i % 2 === 0 ? "mr-auto" : "ml-auto")
                }
              >
                {f}
              </motion.p>
            ))}
          </div>
          <div className="relative mx-auto mt-4 h-24 w-24">
            <PassingLineGather className="h-24 w-24" />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-sm text-marigold">
              halo!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
