import { Avatar } from "@/components/home/Avatar";

export interface ChatMessage {
  id: string;
  name: string;
  message: string;
}

// A real grouped-bubble chat surface — variable corner radius on the
// "tail" side instead of a literal speech-bubble tail graphic, an avatar
// only on the other party's messages, matching how iMessage/WhatsApp
// actually render a thread.
export function Chat({
  messages,
  currentUser,
  headerLabel,
}: {
  messages: ChatMessage[];
  currentUser: string;
  headerLabel?: string;
}) {
  return (
    <div className="flex h-full flex-col bg-paper">
      {headerLabel && (
        <div className="flex shrink-0 items-center gap-2 bg-accent px-4 pb-2.5 pt-10">
          <Avatar name={headerLabel} size={22} />
          <p className="text-[11px] font-medium text-white">{headerLabel}</p>
        </div>
      )}
      <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 py-3">
        {messages.map((m) => {
          const mine = m.name === currentUser;
          return (
            <div key={m.id} className={`flex items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}>
              {!mine && <Avatar name={m.name} size={18} className="mb-0.5 shrink-0" />}
              <p
                className={
                  "max-w-[78%] rounded-2xl px-3 py-1.5 text-[11px] leading-snug " +
                  (mine
                    ? "rounded-br-md bg-accent text-white"
                    : "rounded-bl-md border border-border bg-surface text-ink")
                }
              >
                {m.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
