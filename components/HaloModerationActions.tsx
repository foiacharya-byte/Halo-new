"use client";

import { useState, useTransition } from "react";
import {
  moderateVouchAction,
  moderateSubmissionAction,
  moderateSeedCandidateAction,
} from "@/app/actions";

type Kind = "vouch" | "submission" | "seed";

const ACTIONS: Record<Kind, { value: string; label: string; tone: "good" | "bad" | "neutral" }[]> = {
  vouch: [
    { value: "approved", label: "Approve", tone: "good" },
    { value: "needs_information", label: "Needs info", tone: "neutral" },
    { value: "rejected", label: "Reject", tone: "bad" },
  ],
  submission: [
    { value: "approved", label: "Approve & publish", tone: "good" },
    { value: "needs_information", label: "Needs info", tone: "neutral" },
    { value: "duplicate", label: "Duplicate", tone: "neutral" },
    { value: "rejected", label: "Reject", tone: "bad" },
  ],
  seed: [
    { value: "approved", label: "Approve", tone: "good" },
    { value: "hold", label: "Hold", tone: "neutral" },
    { value: "rejected", label: "Reject", tone: "bad" },
  ],
};

export function HaloModerationActions({ kind, id }: { kind: Kind; id: string }) {
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<string | null>(null);

  function run(value: string) {
    setChosen(value);
    startTransition(async () => {
      if (kind === "vouch") await moderateVouchAction(id, value);
      else if (kind === "submission") await moderateSubmissionAction(id, value);
      else await moderateSeedCandidateAction(id, value);
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {ACTIONS[kind].map((a) => (
        <button
          key={a.value}
          type="button"
          disabled={pending}
          onClick={() => run(a.value)}
          className={
            "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 " +
            (a.tone === "good"
              ? "border-good/30 text-good hover:bg-good-soft"
              : a.tone === "bad"
              ? "border-accent/30 text-accent hover:bg-accent-soft"
              : "border-border text-ink-soft hover:bg-paper") +
            (chosen === a.value && pending ? " opacity-60" : "")
          }
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
