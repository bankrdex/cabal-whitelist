import { lazy, Suspense, useContext, useEffect, useMemo, useState } from "react";
import { CLAIM, SITE, TOKEN, shortAddress } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { PrivyEnabledContext } from "@/components/wallet-provider";

const ClaimWithPrivy = lazy(() => import("@/components/claim-privy"));

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function remaining(to: number, now: number) {
  const ms = Math.max(0, to - now);
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    done: ms <= 0,
  };
}

export function ClaimPanel() {
  const enabled = useContext(PrivyEnabledContext);
  if (!enabled) {
    return <ClaimFrame address={null} onConnect={null} onLogout={null} />;
  }
  return (
    <Suspense fallback={<ClaimFrame address={null} onConnect={null} onLogout={null} />}>
      <ClaimWithPrivy />
    </Suspense>
  );
}

export function ClaimFrame({
  address,
  onConnect,
  onLogout,
}: {
  address: string | null;
  onConnect: (() => void) | null;
  onLogout: (() => void) | null;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const openAt = useMemo(() => new Date(CLAIM.at).getTime(), []);
  const clock = remaining(openAt, now);
  const open = clock.done;

  return (
    <section
      id="claim"
      className="stagger-in scroll-mt-6 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
      style={{ animationDelay: "110ms" }}
    >
      <p className="text-xs font-medium tracking-wide text-muted">Airdrop</p>
      <h2 className="font-display mt-1 text-2xl font-semibold tracking-wide text-fg">
        Claim {TOKEN.symbol}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Connect the Base wallet you submitted. Claim opens {CLAIM.time} {CLAIM.timezone}.
      </p>

      {!open && (
        <div className="mt-4">
          <p className="text-center text-xs font-medium tracking-wide text-muted">Opens in</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              { v: clock.h, l: "hrs" },
              { v: clock.m, l: "min" },
              { v: clock.s, l: "sec" },
            ].map((unit) => (
              <div
                key={unit.l}
                className="rounded-lg bg-surface-2 py-3 text-center shadow-[var(--shadow-border)]"
              >
                <p
                  suppressHydrationWarning
                  className="font-display text-3xl font-semibold tabular-nums text-fg"
                >
                  {pad(unit.v)}
                </p>
                <p className="mt-1 text-xs text-muted">{unit.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {address ? (
        <div className="mt-4 rounded-lg bg-surface-2 p-3 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-wide text-muted">Connected</p>
          <p className="mt-1 font-mono text-sm text-fg">{shortAddress(address)}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {open
              ? `This wallet is locked in. ${TOKEN.symbol} will be sent to it.`
              : `Stay connected. Claim opens ${CLAIM.time} ${CLAIM.timezone}.`}
          </p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        {address ? (
          <>
            <Button size="full" disabled={!open}>
              {open ? `Claim ${TOKEN.symbol}` : `Claim at ${CLAIM.time}`}
            </Button>
            {onLogout ? (
              <Button type="button" variant="outline" size="full" onClick={onLogout}>
                Disconnect
              </Button>
            ) : null}
          </>
        ) : (
          <Button type="button" size="full" disabled={!onConnect} onClick={() => onConnect?.()}>
            Connect wallet
          </Button>
        )}
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-muted">
        {SITE.chain} only. Official @{SITE.handle}. DYOR.
      </p>
    </section>
  );
}
