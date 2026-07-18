"use client";

import { useState } from "react";
import { submitEarlyAccessAction } from "@/app/actions";
import { Avatar } from "./Avatar";
import { Reveal } from "./Reveal";

const BUILDERS = ["Priya", "Manan", "Devika", "Ketan", "Meera", "Arjun"];

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
    <section id="join" className="py-16 sm:py-20">
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[32px] border border-border bg-lilac-soft px-6 py-14 text-center sm:px-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.55), transparent 65%)" }}
          aria-hidden
        />

        <Reveal>
          <h2 className="relative font-serif text-2xl text-ink sm:text-[28px]">
            Let&rsquo;s build Vadodara&rsquo;s most trusted network. Together.
          </h2>
          <p className="relative mt-2 text-sm text-ink-soft">Be an early builder. Be a Halo.</p>
          <div className="relative mt-5 flex justify-center -space-x-2">
            {BUILDERS.map((n) => (
              <Avatar key={n} name={n} size={40} className="border-2 border-lilac-soft" />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {done ? (
            <p className="relative mt-8 rounded-full bg-surface px-6 py-3 text-sm font-medium text-accent">
              You&rsquo;re on the list — we&rsquo;ll be in touch.
            </p>
          ) : (
            <form onSubmit={submit} className="relative mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
          {error && <p className="relative mt-3 text-xs text-coral">{error}</p>}
          <div className="relative mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-ink-faint">
            <span>It&rsquo;s free</span>
            <span aria-hidden>·</span>
            <span>Verified community</span>
            <span aria-hidden>·</span>
            <span>Privacy protected</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
