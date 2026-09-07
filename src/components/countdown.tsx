import { useEffect, useState } from "react";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function Countdown({ startIso, now }: { startIso: string; now: number }) {
  const [tick, setTick] = useState(now);

  useEffect(() => {
    setTick(Date.now());
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [now]);

  const start = new Date(startIso).getTime();
  const ms = Math.max(0, start - tick);
  const total = Math.floor(ms / 1000);
  const open = ms <= 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (open) {
    return (
      <p className="font-display text-center text-2xl font-semibold tracking-wide text-primary">
        Claim is live
      </p>
    );
  }

  return (
    <div>
      <p className="text-center text-xs font-medium tracking-wide text-muted">CLAIM OPENS IN</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { v: h, l: "HH" },
          { v: m, l: "MM" },
          { v: s, l: "SS" },
        ].map((unit) => (
          <div
            key={unit.l}
            className="rounded-lg bg-surface-2 py-4 text-center shadow-[var(--shadow-border)]"
          >
            <p
              suppressHydrationWarning
              className="font-display text-3xl font-semibold leading-none tabular-nums text-fg"
            >
              {pad(unit.v)}
            </p>
            <p className="mt-1 text-xs text-muted">{unit.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
