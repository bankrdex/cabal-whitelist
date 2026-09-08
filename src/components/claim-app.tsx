import { useState } from "react";
import { Check, Copy, Lock } from "lucide-react";
import { Countdown, useClaimCountdown } from "@/components/countdown";
import { Button } from "@/components/ui/button";
import { CLAIM, SITE, TOKEN } from "@/lib/config";

export function ClaimApp() {
  const { open } = useClaimCountdown();
  const [copied, setCopied] = useState(false);

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

      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-5 py-16">
        <img
          src="/cabal-avatar.jpg"
          alt=""
          className="stagger-in size-14 rounded-lg outline outline-1 -outline-offset-1 outline-fg/15"
        />

        <h1
          className="stagger-in font-display text-5xl font-semibold tracking-wide text-fg sm:text-6xl"
          style={{ animationDelay: "40ms" }}
        >
          Claim CABAL
        </h1>

        <section
          className="stagger-in w-full rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
          style={{ animationDelay: "80ms" }}
        >
          <p className="text-xs font-medium tracking-[0.16em] text-muted">CONTRACT ADDRESS</p>
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
        </section>

        <section
          className="stagger-in w-full rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
          style={{ animationDelay: "120ms" }}
        >
          <Countdown />
        </section>

        <div className="stagger-in w-full" style={{ animationDelay: "160ms" }}>
          <Button
            type="button"
            size="full"
            variant={open ? "primary" : "locked"}
            disabled={!open}
            className="font-display text-lg tracking-wide"
          >
            {open ? null : <Lock className="size-4" />}
            Claim
          </Button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            {open
              ? `${SITE.token} on ${SITE.chain}. Claim is open.`
              : `Locked until ${CLAIM.time} ${CLAIM.timezone}.`}
          </p>
        </div>
      </main>
    </div>
  );
}
