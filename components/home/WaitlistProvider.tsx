"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { WaitlistModal } from "./WaitlistModal";

interface WaitlistContextValue {
  open: (role?: "discover" | "recommend") => void;
}

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function useWaitlist(): WaitlistContextValue {
  const ctx = useContext(WaitlistContext);
  if (!ctx) throw new Error("useWaitlist must be used inside WaitlistProvider");
  return ctx;
}

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialRole, setInitialRole] = useState<"discover" | "recommend" | undefined>(undefined);

  function open(role?: "discover" | "recommend") {
    setInitialRole(role);
    setIsOpen(true);
  }

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      <WaitlistModal open={isOpen} onClose={() => setIsOpen(false)} initialRole={initialRole} />
    </WaitlistContext.Provider>
  );
}

// A plain <a>/<button> convenience for the many "Join the waitlist" /
// "Recommend something" CTAs scattered through the scenes.
export function WaitlistTrigger({
  role,
  className,
  children,
}: {
  role?: "discover" | "recommend";
  className?: string;
  children: ReactNode;
}) {
  const { open } = useWaitlist();
  return (
    <button type="button" onClick={() => open(role)} className={className}>
      {children}
    </button>
  );
}
