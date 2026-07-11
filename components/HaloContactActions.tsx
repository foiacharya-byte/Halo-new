"use client";

import { useState } from "react";
import { revealNumberAction } from "@/app/actions";
import { Button } from "./ui";

// Number stays masked until the user explicitly asks to Call / WhatsApp / show.
// The full number is fetched from the server only on demand.

export function HaloContactActions({
  listingId,
  masked,
  hasPublicContact,
  whatsapp,
}: {
  listingId: string;
  masked: string;
  hasPublicContact: boolean;
  whatsapp?: boolean;
}) {
  const [revealed, setRevealed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reveal(): Promise<string | null> {
    if (revealed) return revealed;
    setLoading(true);
    setError(null);
    const res = await revealNumberAction(listingId);
    setLoading(false);
    if (!res.ok || !res.data) {
      setError(res.error ?? "Could not show the number.");
      return null;
    }
    const num = res.data.number as string;
    setRevealed(num);
    return num;
  }

  if (!hasPublicContact) {
    return (
      <div className="rounded-halo border border-dashed border-border p-4 text-sm text-ink-soft">
        No public contact number is available for this listing yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-lg tabular-nums text-ink">
        <span aria-live="polite">{revealed ?? masked}</span>
        {!revealed && (
          <button
            type="button"
            onClick={reveal}
            disabled={loading}
            className="text-sm font-medium text-accent-ink hover:underline disabled:opacity-50"
          >
            {loading ? "Showing…" : "Show number"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={async () => {
            const num = await reveal();
            if (num) window.location.href = `tel:${num}`;
          }}
        >
          Call
        </Button>
        {whatsapp && (
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              const num = await reveal();
              if (num) window.open(`https://wa.me/${num.replace("+", "")}`, "_blank");
            }}
          >
            WhatsApp
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  );
}
