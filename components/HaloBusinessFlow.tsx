"use client";

import { useState } from "react";
import { OptionCards, TextField, Completion } from "./flow-ui";
import { HaloAutocomplete, type Option } from "./HaloSelectors";
import { Button } from "./ui";
import { submitBusinessAction } from "@/app/actions";

type ClaimType = "list" | "claim" | "correct" | "remove";

const MODES: { value: ClaimType; label: string; hint: string }[] = [
  { value: "list", label: "List my business", hint: "Add a new business profile to Halo." },
  { value: "claim", label: "Claim an existing profile", hint: "Take ownership of a listing that already exists." },
  { value: "correct", label: "Correct business information", hint: "Fix a detail on an existing listing." },
  { value: "remove", label: "Request removal", hint: "Ask to remove a listing (data-principal right)." },
];

export function HaloBusinessFlow({
  categoryOptions,
  areaOptions,
  initialMode = null,
  initialListingSlug,
}: {
  categoryOptions: Option[];
  areaOptions: Option[];
  initialMode?: ClaimType | null;
  initialListingSlug?: string;
}) {
  const [mode, setMode] = useState<ClaimType | null>(initialMode);
  const [businessName, setBusinessName] = useState("");
  const [claimantName, setClaimantName] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [proofType, setProofType] = useState("");
  const [proofRef, setProofRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!mode) return;
    setError(null);
    setSubmitting(true);
    const res = await submitBusinessAction({
      claimType: mode,
      businessName,
      claimantName,
      listingId: initialListingSlug ? `listing_${initialListingSlug}` : undefined,
      categoryId: categoryId ?? undefined,
      primaryAreaId: areaId ?? undefined,
      phone: phone || undefined,
      proofType: proofType || undefined,
      proofReference: proofRef || undefined,
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
        headline="Thanks — we&rsquo;ve received your request."
        supporting="Our team will review the details and any proof of relationship before making changes. Community vouches remain separate and are not affected."
      >
        <Button href="/">Return to Halo</Button>
      </Completion>
    );
  }

  return (
    <div className="rounded-halo border border-border bg-surface p-6 sm:p-8">
      <div>
        <p className="text-sm font-medium text-ink">What would you like to do?</p>
        <div className="mt-3">
          <OptionCards name="mode" value={mode} onChange={(v) => setMode(v)} options={MODES} />
        </div>
      </div>

      {mode && (
        <div className="mt-6 space-y-4 border-t border-border pt-6">
          <TextField label="Business name" value={businessName} onChange={setBusinessName} />
          <TextField label="Your name (owner or representative)" value={claimantName} onChange={setClaimantName} />

          {(mode === "list" || mode === "correct") && (
            <>
              <HaloAutocomplete label="Category" options={categoryOptions} value={categoryId} onChange={setCategoryId} placeholder="e.g. salon, tailor" />
              <HaloAutocomplete label="Primary area" options={areaOptions} value={areaId} onChange={setAreaId} placeholder="Start typing an area" />
              <TextField label="Public phone" value={phone} onChange={setPhone} inputMode="tel" placeholder="Public business number" />
            </>
          )}

          {(mode === "claim" || mode === "remove") && (
            <>
              <TextField label="Proof type" value={proofType} onChange={setProofType} helper="e.g. GST certificate, shop board photo, business email domain" />
              <TextField label="Proof reference" value={proofRef} onChange={setProofRef} helper="A link or reference we can verify" />
            </>
          )}

          <div className="rounded-halo border border-border bg-paper p-4 text-xs text-ink-soft">
            Businesses manage their information. The community creates the trust. You cannot create
            vouches, edit community comments, or change experience-signal averages.
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={!businessName || !claimantName || submitting}
            className="w-full rounded-halo bg-accent px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </div>
      )}
    </div>
  );
}
