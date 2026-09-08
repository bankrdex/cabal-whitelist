import { lazy, Suspense, useContext, useEffect, useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { AllocationLookup } from "@/components/allocation-lookup";
import { Countdown } from "@/components/countdown";
import { PrivyEnabledContext } from "@/components/wallet-provider";
import { getClaimStatus } from "@/lib/claim-server";
import { CLAIM, SITE, TOKEN } from "@/lib/config";

const ClaimDashboard = lazy(() => import("@/components/claim-dashboard"));

export function ClaimApp() {
  const privyOn = useContext(PrivyEnabledContext);
  const [status, setStatus] = useState<{
    open: boolean;
    paused: boolean;
    startIso: string;
    now: number;
    eligibleCount: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      getClaimStatus().then((s) => {
        if (alive) {
          setStatus({
            open: s.open,
            paused: s.paused,
            startIso: s.startIso,
            now: s.now,
            eligibleCount: s.eligibleCount,
          });
        }
      });
    };
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  async function copyCa() {
    try {
      await navigator.clipboard.writeText(TOKEN.address);
    } catch {
      /* ignore */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src="/city-bg.jpg"
          alt=""
          className="size-full object-cover opacity-40 outline outline-1 -outline-offset-1 outline-fg/10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/90 to-bg" />
      </div>

      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-5 pb-2">
        <a href={SITE.profileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5">
          <img
            src="/cabal-avatar.jpg"
            alt=""
            className="size-9 rounded-md outline outline-1 -outline-offset-1 outline-fg/15"
          />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold tracking-wide text-fg">{SITE.token}</p>
            <p className="text-xs text-muted">@{SITE.handle}</p>
          </div>
        </a>
        <a
          href={TOKEN.dexscreenerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-surface-2 px-3 text-sm font-medium text-fg shadow-[var(--shadow-border)]"
        >
          Chart
          <ExternalLink className="size-3.5" />
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pt-4 pb-16">
        <section className="text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium tracking-wide text-muted shadow-[var(--shadow-border)]">
            <span className="size-1.5 rounded-full bg-primary" />
            {SITE.chain} · Token live
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-wide text-fg sm:text-5xl">
            CABAL IS LIVE
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Claim opens {CLAIM.time} {CLAIM.timezone}. Only wallets from the whitelist form are
            eligible{status?.eligibleCount ? ` (${status.eligibleCount.toLocaleString("en-US")})` : ""}.
            Log in with email or X. No MetaMask required.
          </p>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-wide text-muted">Token contract</p>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-surface-2 py-2 pr-2 pl-3 shadow-[var(--shadow-border)]">
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-fg">{TOKEN.address}</code>
            <button
              type="button"
              onClick={copyCa}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md bg-surface px-3 text-sm font-medium text-fg shadow-[var(--shadow-border)]"
            >
              {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <a
            href={TOKEN.basescanUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted hover:text-fg"
          >
            View on BaseScan <ExternalLink className="size-3" />
          </a>
        </section>

        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          {status ? (
            <Countdown startIso={status.startIso} now={status.now} />
          ) : (
            <p className="text-center text-sm text-muted">Loading claim window…</p>
          )}
          {status?.paused ? (
            <p className="mt-3 text-center text-sm text-danger">Claims are paused.</p>
          ) : null}
        </section>

        {privyOn ? (
          <Suspense fallback={<p className="text-center text-sm text-muted">Loading…</p>}>
            <ClaimDashboard open={Boolean(status?.open)} paused={Boolean(status?.paused)} />
          </Suspense>
        ) : (
          <>
            <AllocationLookup inputId="public-alloc-wallet" />
            <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <p className="text-sm leading-relaxed text-muted">
                Claiming requires login with email or X. Privy is not configured on this deployment
                yet, so embedded wallets are unavailable. You can still check allocation above.
              </p>
            </section>
          </>
        )}

        <p className="text-center text-xs leading-relaxed text-muted">
          Official @{SITE.handle} · {SITE.token} on {SITE.chain}. DYOR. Not financial advice.
        </p>
      </main>
    </div>
  );
}
