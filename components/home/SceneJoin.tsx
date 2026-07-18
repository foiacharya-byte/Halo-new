"use client";

import { useState } from "react";
import { submitEarlyAccessAction } from "@/app/actions";
import { Reveal } from "./Reveal";

const AVATARS = Array.from({ length: 6 }, (_, i) => `join_avatar_0${i + 1}.svg`);

// Inline capture bar, matching the reference structure directly (a single
// WhatsApp-number-or-email field + button on the page itself, not a modal).
// The richer multi-step flow still exists (WaitlistModal, opened from the
// header/footer "Join Halo" buttons) for anyone who lands there instead.
export function SceneJoin() {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    setSubmitting(true);
    setError(null);
    const isEmail = v.includes("@");
    const res = await submitEarlyAccessAction(
      isEmail
        ? { email: v, reason: "both", communicationPreference: "email_only" }
        : { phone: v, reason: "both", communicationPreference: "whatsapp_only" }
    );
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Enter a valid WhatsApp number or email.");
      return;
    }
    setDone(true);
  }

  return (
    <section id="join" className="relative overflow-hidden py-16 sm:py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/halo/matched/08_scene_join/join_lilac_blob.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-70"
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/halo/matched/08_scene_join/join_orbit_line.svg" alt="" className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/halo/matched/08_scene_join/join_sparkles.svg" alt="" className="pointer-events-none absolute right-[15%] top-10 h-12 w-12" aria-hidden />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-serif text-2xl text-ink sm:text-[28px]">
            Let&rsquo;s build Vadodara&rsquo;s most trusted network. Together.
          </h2>
          <p className="mt-2 text-sm text-ink-soft">Be an early builder. Be a Halo.</p>
          <div className="mt-5 flex justify-center -space-x-2">
            {AVATARS.map((a) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={a} src={`/assets/halo/matched/08_scene_join/${a}`} alt="" className="h-10 w-10 rounded-full border-2 border-paper" aria-hidden />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {done ? (
            <p className="mt-8 rounded-full bg-accent-soft px-6 py-3 text-sm font-medium text-accent">
              You&rsquo;re on the list — we&rsquo;ll be in touch.
            </p>
          ) : (
            <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter WhatsApp number or email"
                className="w-full max-w-sm rounded-full border border-border bg-surface px-5 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={submitting || !value.trim()}
                className="shrink-0 rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-50"
              >
                {submitting ? "Joining…" : "Join Halo"}
              </button>
            </form>
          )}
          {error && <p className="mt-3 text-xs text-coral">{error}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-faint">
            <span>✓ It&rsquo;s free</span>
            <span>✓ Verified community</span>
            <span>✓ Privacy protected</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
