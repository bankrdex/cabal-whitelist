import { useEffect, useState } from "react";
import { CLAIM } from "@/lib/config";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function useClaimCountdown(startIso: string = CLAIM.at) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(Date.now());
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const start = new Date(startIso).getTime();
  const ms = tick === 0 ? Math.max(0, start - Date.now()) : Math.max(0, start - tick);
  const total = Math.floor(ms / 1000);
  const open = ms <= 0 && tick !== 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return { open, h, m, s, ms, ready: tick !== 0 };
}

export function Countdown({ startIso = CLAIM.at }: { startIso?: string }) {
  const { open, h, m, s, ready } = useClaimCountdown(startIso);

  if (ready && open) {
    return (
      <p className="font-display text-center text-2xl font-semibold tracking-wide text-primary">
        Claim is live
      </p>
    );
  }

  return (
    <div>
      <p className="text-center text-xs font-medium tracking-[0.18em] text-muted">CLAIM OPENS IN</p>
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
            <p className="mt-1.5 text-xs tracking-wide text-muted">{unit.l}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
