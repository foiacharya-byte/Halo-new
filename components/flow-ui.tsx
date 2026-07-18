"use client";

import { useMemo, useState } from "react";
import { cn } from "./ui";
import type { ExperienceSignals } from "@/lib/data/types";

// Shared building blocks for calm, one-question-at-a-time contribution flows.

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i <= step ? "bg-accent" : "bg-border"
          )}
        />
      ))}
    </div>
  );
}

export function StepShell({
  title,
  helper,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  backLabel = "Back",
  showBack = true,
}: {
  title: string;
  helper?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backLabel?: string;
  showBack?: boolean;
}) {
  return (
    <div>
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      {helper && <p className="mt-1 text-sm text-ink-soft">{helper}</p>}
      <div className="mt-5">{children}</div>
      <div className="mt-6 flex items-center justify-between">
        {showBack && onBack ? (
          <button type="button" onClick={onBack} className="text-sm text-ink-soft hover:text-ink">
            ← {backLabel}
          </button>
        ) : (
          <span />
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="rounded-halo bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-50"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export function OptionCards<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="space-y-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex w-full flex-col items-start rounded-halo border px-4 py-3 text-left transition-colors",
            value === o.value
              ? "border-accent bg-accent-soft"
              : "border-border bg-surface hover:border-ink-faint"
          )}
        >
          <span className="text-[15px] text-ink">{o.label}</span>
          {o.hint && <span className="mt-0.5 text-xs text-ink-faint">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  maxLength,
  type = "text",
  inputMode,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helper?: string;
  maxLength?: number;
  type?: string;
  inputMode?: "text" | "tel" | "numeric";
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {helper && <span className="mt-0.5 block text-xs text-ink-faint">{helper}</span>}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className="mt-2 w-full rounded-halo border border-border bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:shadow-focus"
        />
      ) : (
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="mt-2 w-full rounded-halo border border-border bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:shadow-focus"
        />
      )}
      {maxLength && (
        <span className="mt-1 block text-right text-xs text-ink-faint">
          {value.length}/{maxLength}
        </span>
      )}
    </label>
  );
}

const SCALE = [
  { value: 1, label: "Poor" },
  { value: 2, label: "Below" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

export const SIGNAL_DIMENSIONS: { key: keyof ExperienceSignals; label: string }[] = [
  { key: "reliability", label: "Reliability" },
  { key: "workQuality", label: "Quality of work" },
  { key: "communicationPunctuality", label: "Communication & punctuality" },
  { key: "priceClarity", label: "Price clarity" },
  { key: "respectfulness", label: "Respectfulness" },
];

export function SignalPicker({
  value,
  onChange,
}: {
  value: Partial<ExperienceSignals>;
  onChange: (v: Partial<ExperienceSignals>) => void;
}) {
  return (
    <div className="space-y-4">
      {SIGNAL_DIMENSIONS.map((d) => (
        <div key={d.key}>
          <p className="text-sm font-medium text-ink">{d.label}</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {SCALE.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-label={`${d.label}: ${s.label}`}
                aria-pressed={value[d.key] === s.value}
                onClick={() => onChange({ ...value, [d.key]: s.value })}
                className={cn(
                  "rounded-lg border px-1 py-2 text-xs transition-colors",
                  value[d.key] === s.value
                    ? "border-accent bg-accent-soft text-accent-ink"
                    : "border-border bg-surface text-ink-soft hover:border-ink-faint"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function isSignalsComplete(v: Partial<ExperienceSignals>): v is ExperienceSignals {
  return SIGNAL_DIMENSIONS.every((d) => typeof v[d.key] === "number");
}

// A lightweight OTP mock. In production this calls Supabase phone OTP. Here it
// accepts any 4–6 digit code so the flow is demonstrable end to end.
export function OtpBlock({
  phone,
  onVerified,
  verified,
}: {
  phone: string;
  onVerified: () => void;
  verified: boolean;
}) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const valid = useMemo(() => /^\d{4,6}$/.test(code), [code]);

  if (verified) {
    return <p className="text-sm text-good">✓ Number verified.</p>;
  }

  return (
    <div className="rounded-halo border border-border bg-paper p-4">
      {!sent ? (
        <button
          type="button"
          onClick={() => setSent(true)}
          disabled={!phone}
          className="text-sm font-medium text-accent-ink hover:underline disabled:opacity-50"
        >
          Send OTP to {phone || "your number"}
        </button>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <TextField
            label="Enter the code"
            value={code}
            onChange={setCode}
            inputMode="numeric"
            placeholder="4–6 digit code"
          />
          <button
            type="button"
            onClick={onVerified}
            disabled={!valid}
            className="rounded-halo bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Verify
          </button>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-faint">
        Demo OTP: any 4–6 digit code verifies. Your number is used only for verification and is never
        published.
      </p>
    </div>
  );
}

export function Completion({
  headline,
  supporting,
  children,
}: {
  headline: string;
  supporting?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-halo border border-border bg-surface p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-good-soft text-good">
        ✓
      </div>
      <h2 className="mt-4 font-serif text-2xl text-ink">{headline}</h2>
      {supporting && <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{supporting}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
