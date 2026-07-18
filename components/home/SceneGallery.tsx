"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

const CARDS = [
  { file: "gallery-laxmi-vilas-palace.jpg", alt: "Laxmi Vilas Palace" },
  { file: "gallery-sursagar-lake.jpg", alt: "Sursagar Lake" },
  { file: "gallery-kirti-mandir.jpg", alt: "Kirti Mandir" },
  { file: "gallery-sayaji-baug.jpg", alt: "Sayaji Baug" },
  { file: "gallery-baroda-museum.jpg", alt: "Baroda Museum" },
  { file: "gallery-maharaja-fatehsingh-museum.jpg", alt: "Maharaja Fatehsingh Museum" },
  { file: "gallery-tambekar-wada.jpg", alt: "Tambekar Wada" },
  { file: "gallery-suryanarayan-temple.jpg", alt: "Suryanarayan Temple" },
  { file: "gallery-kala-bhavan.jpg", alt: "Kala Bhavan" },
  { file: "gallery-manikrao-akhada.jpg", alt: "Manikrao Akhada" },
];

const BASE = "/assets/halo/vadodara/supplied/";
const STEP = 360 / CARDS.length;

export function SceneGallery() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section id="gallery" className="relative z-[1] overflow-hidden border-t border-ink/[0.06] bg-paper-deep/80 py-[clamp(80px,10vw,110px)]">
      <div className="mx-auto mb-[clamp(36px,4.5vw,56px)] max-w-[1200px] px-6 sm:px-16">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-3.5">
          <div>
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Heritage of Vadodara</p>
            <h2 className="font-serif text-[clamp(28px,3.2vw,42px)] font-normal tracking-tight text-ink">
              Know your <em className="italic">city.</em>
            </h2>
          </div>
          <p className="self-center text-[12.5px] tracking-wide text-ink-faint">hover to pause · tap a card to view</p>
        </Reveal>
      </div>

      <div
        className="relative mx-auto flex h-[clamp(460px,52vw,620px)] w-full items-center justify-center overflow-hidden"
        style={{ perspective: "1600px" }}
      >
        <div
          className="group relative h-0 w-0 motion-safe:animate-[spinCarousel_52s_linear_infinite] hover:[animation-play-state:paused]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {CARDS.map((c, i) => (
            <button
              key={c.file}
              type="button"
              onClick={() => setLightbox(c.file)}
              aria-label={`View ${c.alt}`}
              className="absolute h-[clamp(300px,25vw,375px)] w-[clamp(240px,20vw,300px)] cursor-pointer overflow-hidden rounded-lg shadow-[0_32px_72px_-20px_rgba(0,0,0,.95)] transition-shadow hover:shadow-[0_40px_80px_-16px_rgba(0,0,0,.95)]"
              style={{
                left: "calc(clamp(240px,20vw,300px) / -2)",
                top: "calc(clamp(300px,25vw,375px) / -2)",
                transform: `rotateY(${i * STEP}deg) translateZ(480px)`,
                backfaceVisibility: "hidden",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BASE + c.file} alt={c.alt} className="block h-full w-full bg-[#F5EEE4] object-contain" />
            </button>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-paper-deep to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-paper-deep to-transparent" />
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[300] flex cursor-pointer items-center justify-center bg-[#060301]/90 backdrop-blur-md"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={BASE + lightbox}
            alt=""
            className="max-h-[90vh] max-w-[min(560px,92vw)] cursor-default rounded-[10px] shadow-[0_48px_96px_-32px_rgba(0,0,0,.95)]"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-ink/[0.08] text-ink-soft transition-colors hover:bg-ink/[0.18] hover:text-ink"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  );
}
