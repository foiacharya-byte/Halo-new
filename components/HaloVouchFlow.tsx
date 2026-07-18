"use client";

import { useState } from "react";
import {
  StepProgress,
  StepShell,
  OptionCards,
  TextField,
  SignalPicker,
  isSignalsComplete,
  OtpBlock,
  Completion,
} from "./flow-ui";
import { HaloAutocomplete, type Option } from "./HaloSelectors";
import { Button } from "./ui";
import { submitVouchAction } from "@/app/actions";
import type { ExperienceSignals } from "@/lib/data/types";

const RECENCY_OPTIONS = [
  { value: "within_month", label: "Within the last month" },
  { value: "1_3_months", label: "1–3 months ago" },
  { value: "3_6_months", label: "3–6 months ago" },
  { value: "6_12_months", label: "6–12 months ago" },
  { value: "over_year", label: "More than a year ago" },
] as const;

const WUA_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "not_sure", label: "Not sure" },
] as const;

export function HaloVouchFlow({
  listingId,
  listingSlug,
  listingName,
  areaOptions,
}: {
  listingId: string;
  listingSlug: string;
  listingName: string;
  areaOptions: Option[];
}) {
  const [step, setStep] = useState(0);
  const [used, setUsed] = useState<"yes" | "no" | null>(null);
  const [useContext, setUseContext] = useState("");
  const [recency, setRecency] = useState<(typeof RECENCY_OPTIONS)[number]["value"] | null>(null);
  const [signals, setSignals] = useState<Partial<ExperienceSignals>>({});
  const [wua, setWua] = useState<(typeof WUA_OPTIONS)[number]["value"] | null>(null);
  const [detail, setDetail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [areaId, setAreaId] = useState<string | null>(null);
  const [display, setDisplay] = useState<"first_initial" | "anonymous">("first_initial");
  const [otp, setOtp] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const TOTAL = 7;

  if (done) {
    return (
      <Completion
        headline="Your vouch is in review."
        supporting="We review contributions before they shape a public profile."
      >
        <Button href={`/listing/${listingSlug}`} variant="secondary">
          Back to listing
        </Button>
        <Button href="/submissions">View submission status</Button>
      </Completion>
    );
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    const res = await submitVouchAction({
      listingId,
      usedService: "yes",
      useContext,
      usefulDetail: detail,
      usedRecency: recency,
      usedAreaId: areaId ?? undefined,
      wouldUseAgain: wua,
      signals,
      contributorFirstName: firstName,
      contributorPhone: phone,
      contributorAreaId: areaId ?? undefined,
      displayChoice: display,
      otpVerified: otp === true ? true : undefined,
      consent: consent === true ? true : undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  }

  return (
    <div className="rounded-halo border border-border bg-surface p-6 sm:p-8">
      <StepProgress step={step} total={TOTAL} />
      <p className="mt-4 text-xs uppercase tracking-wide text-ink-faint">
        Vouch for {listingName}
      </p>
      <div className="mt-4">
        {step === 0 && (
          <StepShell
            title="Have you personally used this service?"
            showBack={false}
            onNext={used === "yes" ? () => setStep(1) : undefined}
            nextDisabled={used !== "yes"}
          >
            <OptionCards
              name="used"
              value={used}
              onChange={(v) => setUsed(v)}
              options={[
                { value: "yes", label: "Yes, I used it" },
                { value: "no", label: "No" },
              ]}
            />
            {used === "no" && (
              <p className="mt-3 text-sm text-ink-soft">
                Only people who personally used a service can vouch for it. Thanks for keeping Halo
                honest.
              </p>
            )}
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            title="What did you use them for?"
            helper="Be specific. “Fan regulator repair” is more useful than “electrical work.”"
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextDisabled={useContext.trim().length < 3}
          >
            <TextField label="Use context" value={useContext} onChange={setUseContext} placeholder="Ceiling-fan regulator repair" />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title="When did you last use them?"
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextDisabled={!recency}
          >
            <OptionCards name="recency" value={recency} onChange={setRecency} options={RECENCY_OPTIONS.map((o) => ({ ...o }))} />
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title="How was the experience?"
            helper="Rate each on a five-point scale."
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            nextDisabled={!isSignalsComplete(signals)}
          >
            <SignalPicker value={signals} onChange={setSignals} />
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title="Would you use them again?"
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
            nextDisabled={!wua}
          >
            <OptionCards name="wua" value={wua} onChange={setWua} options={WUA_OPTIONS.map((o) => ({ ...o }))} />
          </StepShell>
        )}

        {step === 5 && (
          <StepShell
            title="Add one useful detail"
            helper="What should the next person know?"
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
            nextDisabled={detail.trim().length < 3}
          >
            <TextField label="Useful detail" value={detail} onChange={setDetail} maxLength={300} multiline placeholder="Arrived at the agreed time and explained which part needed replacing." />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            title="Verify it&rsquo;s really you"
            helper="Your number is used only for verification and moderation. It is never published."
            onBack={() => setStep(5)}
            showBack
          >
            <div className="space-y-4">
              <TextField label="First name" value={firstName} onChange={setFirstName} />
              <TextField label="Mobile number" value={phone} onChange={setPhone} inputMode="tel" placeholder="10-digit mobile" />
              <HaloAutocomplete label="Your area" options={areaOptions} value={areaId} onChange={setAreaId} placeholder="Start typing your area" />
              <div>
                <p className="text-sm font-medium text-ink">How should your name appear?</p>
                <div className="mt-2">
                  <OptionCards
                    name="display"
                    value={display}
                    onChange={setDisplay}
                    options={[
                      { value: "first_initial", label: "First name and initial", hint: firstName ? `e.g. ${firstName} ${(firstName[0] ?? "").toUpperCase()}.` : "e.g. Priya S." },
                      { value: "anonymous", label: "Verified Halo contributor" },
                    ]}
                  />
                </div>
              </div>
              <OtpBlock phone={phone} verified={otp} onVerified={() => setOtp(true)} />
              <label className="flex items-start gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                <span>
                  I consent to Halo publishing this contribution (without my phone number) after review.
                </span>
              </label>
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="button"
                onClick={submit}
                disabled={!firstName || !phone || !otp || !consent || submitting}
                className="w-full rounded-halo bg-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit my vouch"}
              </button>
            </div>
          </StepShell>
        )}
      </div>
    </div>
  );
}
