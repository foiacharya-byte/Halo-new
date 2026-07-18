const ITEMS = [
  "Home food", "Local services", "Artists & Karigar", "Cafés",
  "Tutors & Classes", "Events", "Boutiques & Shops", "Heritage", "Community", "Trust",
];

function TickerRow() {
  return (
    <span className="flex flex-none items-center whitespace-nowrap">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="font-serif px-7 text-[clamp(14px,1.3vw,18px)] italic text-[#FFF4E8]/90">{item}</span>
          <span className="text-[#FFF4E8]/35">·</span>
        </span>
      ))}
    </span>
  );
}

export function Ticker() {
  return (
    <div className="overflow-hidden bg-accent py-3.5" aria-hidden>
      <div className="flex w-max animate-[marquee_36s_linear_infinite] motion-reduce:animate-none">
        <TickerRow />
        <TickerRow />
      </div>
    </div>
  );
}
