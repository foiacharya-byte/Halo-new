"use client";

import { useState } from "react";
import Link from "next/link";
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
import { submitNumberAction, checkDuplicatesAction } from "@/app/actions";
import type { ExperienceSignals } from "@/lib/data/types";

const RECENCY_OPTIONS = [
  { value: "within_month", label: "Within the last month" },
  { value: "1_3_months", label: "1–3 months ago" },
  { value: "3_6_months", label: "3–6 months ago" },
  { value: "6_12_months", label: "6–12 months ago" },
  { value: "over_year", label: "More than a year ago" },
] as const;

const PERMISSION_OPTIONS = [
  { value: "publicly_advertised", label: "Yes, it is publicly advertised for the service." },
  { value: "has_permission", label: "Yes, I have permission to share it." },
  { value: "unsure", label: "I am not sure." },
] as const;

interface DupMatch {
  slug: string;
  name: string;
  reason: string;
  area?: string;
  category?: string;
}

export function HaloAddNumberFlow({
  categoryOptions,
  areaOptions,
  initialName = "",
}: {
  categoryOptions: Option[];
  areaOptions: Option[];
  initialName?: string;
}) {
  const [step, setStep] = useState(0);
  const TOTAL = 10;

  const [name, setName] = useState(initialName);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [atLocation, setAtLocation] = useState<"yes" | "no" | null>(null);
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState<"yes" | "no" | null>(null);
  const [permission, setPermission] = useState<(typeof PERMISSION_OPTIONS)[number]["value"] | null>(null);
  const [useContext, setUseContext] = useState("");
  const [recency, setRecency] = useState<(typeof RECENCY_OPTIONS)[number]["value"] | null>(null);
  const [signals, setSignals] = useState<Partial<ExperienceSignals>>({});
  const [detail, setDetail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [contribPhone, setContribPhone] = useState("");
  const [contribArea, setContribArea] = useState<string | null>(null);
  const [otp, setOtp] = useState(false);
  const [consent, setConsent] = useState(false);

  const [dupes, setDupes] = useState<DupMatch[]>([]);
  const [dupChecked, setDupChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function goToReview() {
    setError(null);
    const res = await checkDuplicatesAction({
      name,
      phone,
      categoryId: categoryId ?? undefined,
      areaId: areaId ?? undefined,
    });
    if (res.ok && res.data) setDupes(res.data.matches as DupMatch[]);
    setDupChecked(true);
    setStep(9);
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    const res = await submitNumberAction({
      proposedName: name,
      categoryId,
      primaryAreaId: areaId,
      phone,
      whatsapp: whatsapp === "yes",
      permissionBasis: permission,
      useContext,
      usefulDetail: detail,
      usedRecency: recency,
      signals: isSignalsComplete(signals) ? signals : undefined,
      contributorFirstName: firstName,
      contributorPhone: contribPhone,
      contributorAreaId: contribArea ?? undefined,
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

  if (done) {
    return (
      <Completion
        headline="Thank you. Vadodara may have one more useful number."
        supporting="We will check the listing and contact permissions before publishing it."
      >
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Add another number
        </Button>
        <Button href="/">Return to Halo</Button>
      </Completion>
    );
  }

  const maskedPreview = phone ? phone.replace(/\d(?=\d{3})/g, "•") : "";

  return (
    <div className="rounded-halo border border-border bg-surface p-6 sm:p-8">
      <StepProgress step={step} total={TOTAL} />
      <div className="mt-5">
        {step === 0 && (
          <StepShell title="Who are you adding?" showBack={false} onNext={() => setStep(1)} nextDisabled={name.trim().length < 2}>
            <TextField label="Person, service or business name" value={name} onChange={setName} placeholder="Sharma Electrical Works" />
          </StepShell>
        )}

        {step === 1 && (
          <StepShell title="What do they help with?" onBack={() => setStep(0)} onNext={() => setStep(2)} nextDisabled={!categoryId}>
            <HaloAutocomplete label="Category" options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder="e.g. electrician, tiffin, tailor" />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell title="Where do they work?" onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!areaId || !atLocation}>
            <div className="space-y-4">
              <HaloAutocomplete label="Primary area" options={areaOptions} value={areaId} onChange={setAreaId} placeholder="Start typing an area" />
              <div>
                <p className="text-sm font-medium text-ink">Do they come to the customer&rsquo;s location?</p>
                <div className="mt-2">
                  <OptionCards name="atLocation" value={atLocation} onChange={setAtLocation} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell title="What number do people use to reach them?" onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={phone.trim().length < 10}>
            <div className="space-y-4">
              <TextField label="Mobile or landline" value={phone} onChange={setPhone} inputMode="tel" placeholder="10-digit number" />
              <div>
                <p className="text-sm font-medium text-ink">WhatsApp available?</p>
                <div className="mt-2">
                  <OptionCards name="whatsapp" value={whatsapp} onChange={setWhatsapp} options={[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]} />
                </div>
              </div>
            </div>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell title="Can this number be displayed publicly?" onBack={() => setStep(3)} onNext={() => setStep(5)} nextDisabled={!permission}>
            <OptionCards name="permission" value={permission} onChange={setPermission} options={PERMISSION_OPTIONS.map((o) => ({ ...o }))} />
            {permission === "unsure" && (
              <p className="mt-3 text-sm text-ink-soft">
                That&rsquo;s okay. We&rsquo;ll store it securely for verification only and will not
                display it publicly until the provider confirms or a moderator verifies it is a
                public business number.
              </p>
            )}
          </StepShell>
        )}

        {step === 5 && (
          <StepShell title="What did you use them for?" helper="Be specific — it helps the next person." onBack={() => setStep(4)} onNext={() => setStep(6)} nextDisabled={useContext.trim().length < 3}>
            <TextField label="Use context" value={useContext} onChange={setUseContext} placeholder="Rewired two rooms" />
          </StepShell>
        )}

        {step === 6 && (
          <StepShell title="When did you last use them?" onBack={() => setStep(5)} onNext={() => setStep(7)} nextDisabled={!recency}>
            <OptionCards name="recency" value={recency} onChange={setRecency} options={RECENCY_OPTIONS.map((o) => ({ ...o }))} />
          </StepShell>
        )}

        {step === 7 && (
          <StepShell title="How was the experience?" onBack={() => setStep(6)} onNext={() => setStep(8)} nextDisabled={!isSignalsComplete(signals)}>
            <SignalPicker value={signals} onChange={setSignals} />
          </StepShell>
        )}

        {step === 8 && (
          <StepShell title="Add one useful detail" helper="What should the next person know?" onBack={() => setStep(7)} onNext={goToReview} nextLabel="Review" nextDisabled={detail.trim().length < 3}>
            <TextField label="Useful detail" value={detail} onChange={setDetail} maxLength={300} multiline />
          </StepShell>
        )}

        {step === 9 && (
          <div>
            <h2 className="font-serif text-xl text-ink">Review</h2>

            {dupes.length > 0 && (
              <div className="mt-4 rounded-halo border border-warn/40 bg-warn-soft/60 p-4">
                <p className="text-sm font-medium text-ink">This may already be on Halo.</p>
                <ul className="mt-3 space-y-2">
                  {dupes.map((d) => (
                    <li key={d.slug} className="rounded-lg border border-border bg-surface p-3">
                      <p className="text-sm font-medium text-ink">{d.name}</p>
                      <p className="text-xs text-ink-faint">
                        {d.category}
                        {d.area ? ` · ${d.area}` : ""} — {d.reason}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm">
                        <Link href={`/listing/${d.slug}`} className="text-accent-ink hover:underline">
                          Open existing listing
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-ink-soft">
                  If yours is genuinely a different service, you can continue below.
                </p>
              </div>
            )}

            <dl className="mt-4 space-y-2 rounded-halo border border-border p-4 text-sm">
              <Review label="Name" value={name} />
              <Review label="Service" value={categoryOptions.find((c) => c.id === categoryId)?.label ?? "—"} />
              <Review label="Area" value={areaOptions.find((a) => a.id === areaId)?.label ?? "—"} />
              <Review label="Number" value={maskedPreview} />
              <Review label="Used for" value={useContext} />
              <Review label="Permission" value={PERMISSION_OPTIONS.find((p) => p.value === permission)?.label ?? "—"} />
            </dl>

            <p className="mt-3 text-xs text-ink-faint">
              Only public business numbers or numbers shared with permission can appear publicly. Halo
              never publishes your personal contact details as the contributor.
            </p>

            <div className="mt-5 flex items-center justify-between">
              <button type="button" onClick={() => setStep(8)} className="text-sm text-ink-soft hover:text-ink">
                ← Back
              </button>
              <button type="button" onClick={() => setStep(10)} className="rounded-halo bg-accent px-5 py-2.5 text-sm font-medium text-white">
                Continue to verification
              </button>
            </div>
          </div>
        )}

        {step === 10 && (
          <StepShell title="Verify it&rsquo;s really you" helper="Your number is used only for verification. It is never published as the contributor." onBack={() => setStep(9)} showBack>
            <div className="space-y-4">
              <TextField label="First name" value={firstName} onChange={setFirstName} />
              <TextField label="Mobile number" value={contribPhone} onChange={setContribPhone} inputMode="tel" placeholder="10-digit mobile" />
              <HaloAutocomplete label="Your area" options={areaOptions} value={contribArea} onChange={setContribArea} placeholder="Start typing your area" />
              <OtpBlock phone={contribPhone} verified={otp} onVerified={() => setOtp(true)} />
              <label className="flex items-start gap-2 text-sm text-ink-soft">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                <span>I consent to Halo reviewing and, if appropriate, publishing this listing (without my personal contact details).</span>
              </label>
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="button"
                onClick={submit}
                disabled={!firstName || !contribPhone || !otp || !consent || submitting}
                className="w-full rounded-halo bg-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </StepShell>
        )}
      </div>
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-ink-faint">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}
