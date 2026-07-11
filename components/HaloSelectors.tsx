"use client";

import { useMemo, useState } from "react";
import { cn } from "./ui";

export interface Option {
  id: string;
  label: string;
  group?: string;
}

// HaloAreaSelector / HaloCategoryAutocomplete share this typeahead. Typing
// filters by label; nothing forces location permission.

export function HaloAutocomplete({
  label,
  helper,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  helper?: string;
  options: Option[];
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 40);
    return options.filter((o) => o.label.toLowerCase().includes(q)).slice(0, 40);
  }, [query, options]);

  return (
    <div className="relative">
      <span className="text-sm font-medium text-ink">{label}</span>
      {helper && <span className="mt-0.5 block text-xs text-ink-faint">{helper}</span>}

      {selected ? (
        <div className="mt-2 flex items-center justify-between rounded-halo border border-accent bg-accent-soft px-3 py-2">
          <span className="text-[15px] text-ink">{selected.label}</span>
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            className="text-sm text-accent-ink hover:underline"
          >
            Clear
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="mt-2 w-full rounded-halo border border-border bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus-visible:shadow-focus"
          />
          {open && filtered.length > 0 && (
            <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-halo border border-border bg-surface shadow-card">
              {filtered.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.id);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink hover:bg-paper"
                    )}
                  >
                    <span>{o.label}</span>
                    {o.group && <span className="text-xs text-ink-faint">{o.group}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
