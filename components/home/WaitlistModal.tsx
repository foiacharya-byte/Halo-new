"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitEarlyAccessAction } from "@/app/actions";
import { areaOptions } from "@/lib/data/options";
import type { CommunicationPreference, EarlyAccessReason } from "@/lib/data/types";

const AREA_OPTIONS = areaOptions(false);

const REASONS: { value: EarlyAccessReason; label: string; hint: string }[] = [
  { value: "need_help", label: "I want to discover Vadodara", hint: "Find what Vadodara actually trusts" },
  { value: "know_trusted_people", label: "I want to recommend something", hint: "A person, a place, a name worth knowing" },
  { value: "both", label: "Both", hint: "Discover and contribute" },
];

const INTERESTS = [
  "Home food", "Local services", "Artists & Karigar", "Cafés",
  "Tutors & Classes", "Events", "Boutiques & Shops", "Heritage", "Community",
];

const STEPS = ["Why you are here", "About you", "Stay in touch"];

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  initialRole?: "discover" | "recommend";
}

export function WaitlistModal({ open, onClose, initialRole }: WaitlistModalProps) {
  const [step, setStep] = useState(0);
  const [reason, setReason] = useState<EarlyAccessReason>(
    initialRole === "recommend" ? "know_trusted_people" : "need_help"
  );
  const [name, setName] = useState("");
  const [areaId, setAreaId] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pref, setPref] = useState<CommunicationPreference>("email_only");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function reset() {
    setStep(0);
    setDone(false);
    setError(null);
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 300);
  }

  function toggleInterest(i: string) {
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    const res = await submitEarlyAccessAction({
      email,
      phone: phone || undefined,
      reason,
      communicationPreference: pref,
      name: name || undefined,
      areaId: areaId || undefined,
      interests: interests.length ? interests : undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-8" role="dialog" aria-modal="true" aria-label="Join Halo">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-md" onClick={handleClose} />

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative grid max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-[22px] border border-border bg-surface shadow-2xl sm:grid-cols-[0.78fr_1fr] max-sm:max-h-[100dvh] max-sm:rounded-none"
      >
        {/* Rail — desktop only */}
        <div className="relative hidden min-h-[520px] flex-col justify-between overflow-hidden p-8 sm:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/halo/matched/10_verified_vadodara_photos/laxmi_vilas_palace_verified.webp"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-ink/85 via-accent-ink/70 to-accent-ink/90" />
          <div className="relative z-10 flex h-9 items-center">
            <span className="font-serif text-2xl font-medium text-white">
              halo<span className="text-gold">!</span>
            </span>
          </div>
          <div className="relative z-10">
            <p className="font-serif text-[28px] font-medium leading-tight tracking-tight text-white">
              Vadodara is building
              <br />
              <em className="italic text-gold">its own place.</em>
            </p>
            <p className="mt-3.5 max-w-[30ch] text-xs leading-relaxed text-white/75">
              A few questions, and you are part of the first circle shaping what Vadodara discovers.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className={
                    "flex items-center gap-2.5 text-xs tracking-wide transition-colors " +
                    (i === step ? "text-white" : i < step ? "text-gold" : "text-white/40")
                  }
                >
                  <span
                    className={
                      "h-1.5 w-1.5 shrink-0 rounded-full transition-colors " +
                      (i === step ? "bg-gold" : i < step ? "bg-gold" : "bg-white/25")
                    }
                  />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form pane */}
        <div className="relative flex min-h-0 flex-col">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink-soft transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {!done && (
            <>
              <div className="flex items-center justify-between px-8 pr-16 pt-7">
                <span className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-accent">Homegrown in Vadodara</span>
                <span className="text-xs font-medium tabular-nums text-ink-faint">{step + 1} of {STEPS.length}</span>
              </div>
              <div className="mx-8 mt-4 h-0.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-accent transition-all duration-500"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </>
          )}

          <div className="flex-1 overflow-y-auto px-8 py-6 sm:py-8">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#173F31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl font-medium tracking-tight text-ink">You are part of the first circle.</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                    We will reach you at {email}
                    {pref === "email_and_call" ? " — and by phone, since you said that was alright." : "."}
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-6 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink"
                  >
                    Done
                  </button>
                </motion.div>
              ) : step === 0 ? (
                <motion.div key="s0" initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.32 }}>
                  <h3 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-ink">Why are you here?</h3>
                  <p className="mt-2 text-sm text-ink-soft">Halo is opening carefully — this just shapes what we show you first.</p>
                  <div className="mt-5 flex flex-col gap-2">
                    {REASONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setReason(r.value)}
                        className={
                          "flex w-full items-center gap-3 rounded-[13px] border px-4 py-3.5 text-left transition-colors " +
                          (reason === r.value ? "border-accent bg-accent-soft" : "border-border bg-paper hover:border-accent/40")
                        }
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-[17px] font-medium text-ink">{r.label}</span>
                          <span className="mt-0.5 block text-xs text-ink-faint">{r.hint}</span>
                        </span>
                        <span
                          className={
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition-colors " +
                            (reason === r.value ? "border-accent bg-accent text-white" : "border-border text-ink-faint")
                          }
                        >
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : step === 1 ? (
                <motion.div key="s1" initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.32 }}>
                  <h3 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-ink">A little about you.</h3>
                  <p className="mt-2 text-sm text-ink-soft">Optional, but it helps us reach out with something useful.</p>

                  <div className="mt-5 flex flex-col gap-1.5">
                    <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-faint">Name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="What should we call you?"
                      className="w-full rounded-[10px] border border-border bg-paper px-3.5 py-3 text-[14.5px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-1.5">
                    <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-faint">Area in Vadodara</span>
                    <select
                      value={areaId}
                      onChange={(e) => setAreaId(e.target.value)}
                      className="w-full rounded-[10px] border border-border bg-paper px-3.5 py-3 text-[14.5px] text-ink focus:border-accent focus:outline-none"
                    >
                      <option value="">Prefer not to say</option>
                      {AREA_OPTIONS.map((a) => (
                        <option key={a.id} value={a.id}>{a.label}</option>
                      ))}
                    </select>
                  </div>

                  <p className="mb-2.5 mt-5 text-[11px] font-medium uppercase tracking-wide text-ink-soft">What matters to you</p>
                  <div className="flex flex-wrap gap-1.5">
                    {INTERESTS.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleInterest(i)}
                        className={
                          "rounded-full border px-3.5 py-2 text-[13.5px] transition-colors " +
                          (interests.includes(i) ? "border-accent bg-accent text-white" : "border-border text-ink-soft hover:border-accent/40")
                        }
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="s2" initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -26 }} transition={{ duration: 0.32 }}>
                  <h3 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-ink">Stay in touch.</h3>
                  <p className="mt-2 text-sm text-ink-soft">Just enough to reach you when Halo opens in your area.</p>

                  <div className="mt-5 flex flex-col gap-1.5">
                    <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-faint">Email</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-[10px] border border-border bg-paper px-3.5 py-3 text-[14.5px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
                    />
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-faint">How should we reach you?</span>
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      <input type="radio" checked={pref === "email_only"} onChange={() => setPref("email_only")} />
                      Email only
                    </label>
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      <input type="radio" checked={pref === "email_and_call"} onChange={() => setPref("email_and_call")} />
                      Email + phone call
                    </label>
                  </div>

                  {pref === "email_and_call" && (
                    <div className="mt-4 flex flex-col gap-1.5">
                      <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-faint">Phone</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 …"
                        className="w-full rounded-[10px] border border-border bg-paper px-3.5 py-3 text-[14.5px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
                      />
                    </div>
                  )}

                  {error && <p className="mt-3 text-[12.5px] text-coral">{error}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!done && (
            <div className="flex flex-wrap items-center gap-4 px-8 pb-8 pt-2">
              {step > 0 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-faint transition-colors hover:text-ink">
                  ← Back
                </button>
              )}
              <div className="ml-auto">
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submit}
                    disabled={submitting || !email}
                    className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-50"
                  >
                    {submitting ? "Joining…" : "Join the waitlist"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
