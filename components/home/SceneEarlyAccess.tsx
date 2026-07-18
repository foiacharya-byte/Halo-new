"use client";

import { useState } from "react";
import { submitEarlyAccessAction } from "@/app/actions";
import { Completion } from "@/components/flow-ui";
import { Reveal } from "./Reveal";
import type { CommunicationPreference, EarlyAccessReason } from "@/lib/data/types";

const REASONS: { value: EarlyAccessReason; label: string }[] = [
  { value: "need_help", label: "I need local help" },
  { value: "know_trusted_people", label: "I know trusted local people" },
  { value: "both", label: "Both" },
];

export function SceneEarlyAccess() {
  const [reason, setReason] = useState<EarlyAccessReason>("need_help");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pref, setPref] = useState<CommunicationPreference>("email_only");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await submitEarlyAccessAction({
      email,
      phone: phone || undefined,
      reason,
      communicationPreference: pref,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong. Please try again.");
      return;
    }
    setDone(true);
  }

  return (
    <section id="join" className="py-12 sm:py-16" aria-labelledby="join-heading">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 id="join-heading" className="font-serif text-2xl text-ink sm:text-[28px]">
            Help build the answers before you need one.
          </h2>
          <p className="mt-3 text-[15px] text-ink-soft">
            No fabricated waitlist number here — just an honest early-access list.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {done ? (
            <div className="mt-8 text-left">
              <Completion
                headline="You're on the list."
                supporting="We'll reach you at the email you gave, and by phone only if you asked for that."
              />
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 rounded-halo border border-border bg-surface p-6 text-left sm:p-8">
              <div role="radiogroup" aria-label="Why are you joining" className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {REASONS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    role="radio"
                    aria-checked={reason === r.value}
                    onClick={() => setReason(r.value)}
                    className={
                      "rounded-halo border px-3 py-2.5 text-sm transition-colors " +
                      (reason === r.value
                        ? "border-accent bg-accent-soft text-accent-ink"
                        : "border-border bg-paper text-ink-soft hover:border-ink-faint")
                    }
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-medium text-ink">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-halo border border-border bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:shadow-focus"
                />
              </label>

              <fieldset className="mt-5">
                <legend className="text-sm font-medium text-ink">How should we reach you?</legend>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-ink-soft">
                    <input
                      type="radio"
                      name="pref"
                      checked={pref === "email_only"}
                      onChange={() => setPref("email_only")}
                    />
                    Email only
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink-soft">
                    <input
                      type="radio"
                      name="pref"
                      checked={pref === "email_and_call"}
                      onChange={() => setPref("email_and_call")}
                    />
                    Email + phone call
                  </label>
                </div>
              </fieldset>

              {pref === "email_and_call" && (
                <label className="mt-4 block">
                  <span className="text-sm font-medium text-ink">Phone</span>
                  <span className="mt-0.5 block text-xs text-ink-faint">
                    Used only to call about early access — never published, never shared.
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 …"
                    className="mt-2 w-full rounded-halo border border-border bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:shadow-focus"
                  />
                </label>
              )}

              {error && <p className="mt-4 text-sm text-coral">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !email}
                className="mt-6 w-full rounded-halo bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-50"
              >
                {submitting ? "Joining…" : "Join Halo early access"}
              </button>
              <p className="mt-3 text-center text-xs text-ink-faint">
                It's free · No spam · Your data stays with Halo
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
