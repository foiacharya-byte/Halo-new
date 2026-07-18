"use client";

import { useEffect, useState } from "react";
import { HaloSearch } from "@/components/HaloSearch";
import { WaitlistTrigger } from "./WaitlistProvider";

const EXAMPLE_QUERIES = [
  "AC repair in Gotri",
  "home-cooked food near Alkapuri",
  "trusted tailor in Karelibaug",
  "weekend events in Vadodara",
  "music teacher in Sama",
];

// Hero — Gujarati line greets first, English content follows, matching the
// reference build's two-stage reveal (simplified: CSS/JS timing, not the
// canvas ink-reveal preloader that gated it there — see chat for scope).
export function SceneHero() {
  const [showEnglish, setShowEnglish] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowEnglish(true), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section id="top" className="relative z-[1] flex min-h-screen items-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/halo/vadodara/supplied/bg-hero.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full scale-[1.08] object-cover motion-safe:animate-[heroDrift_26s_ease-in-out_infinite_alternate]"
      />
      <div className="absolute inset-0 bg-[#080402]/45 backdrop-blur-[3px]" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#040201]/92 via-[#040201]/70 to-transparent" />

      {/* Gujarati greeting */}
      <div
        className={
          "absolute inset-0 z-[4] flex items-center justify-center px-6 text-center transition-all duration-700 " +
          (showEnglish ? "pointer-events-none -translate-y-2 opacity-0" : "opacity-100")
        }
      >
        <div>
          <p className="font-gu text-[clamp(28px,4.5vw,64px)] font-semibold leading-tight tracking-tight text-accent" style={{ textShadow: "0 2px 24px rgba(194,83,31,.4)" }}>
            વડોદરાનું પોતાનું.
          </p>
          <p className="mt-4 text-[clamp(13px,1.1vw,16px)] uppercase tracking-[0.18em] text-ink-faint">
            Baroda, brought together.
          </p>
        </div>
      </div>

      {/* English hero content */}
      <div
        className={
          "relative z-[2] mx-auto w-full max-w-[1000px] px-6 py-[clamp(110px,14vw,170px)] text-center transition-all duration-700 sm:px-16 " +
          (showEnglish ? "opacity-100" : "translate-y-6 opacity-0")
        }
      >
        <h1 className="font-display text-[clamp(40px,6.2vw,92px)] font-medium leading-[1.0] tracking-tight text-[#F4ECDC]" style={{ textShadow: "0 2px 30px rgba(4,2,1,.5)" }}>
          Vadodara deserves
          <br />a place <em className="italic text-accent">of its own.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-[46ch] text-[11px] font-medium uppercase leading-[1.9] tracking-[0.16em] text-ink-soft sm:mt-8">
          For what Vadodara trusts, loves, recommends,
          <br />returns to, creates &amp; celebrates.
        </p>

        <div className="mx-auto mt-8 max-w-[620px] sm:mt-11">
          <HaloSearch size="hero" rotatingPlaceholders={EXAMPLE_QUERIES} />
          <p className="mt-2.5 text-center text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">
            What should Baroda help you find today?
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
          <WaitlistTrigger className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-accent-ink">
            Join the waitlist →
          </WaitlistTrigger>
        </div>
        <p className="mt-4 text-[13px] text-ink-faint">Built with Barodians. Shaped by trust. Starting in Vadodara.</p>
      </div>
    </section>
  );
}
