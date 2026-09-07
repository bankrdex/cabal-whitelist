import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Check, Copy } from "lucide-react";
import { AllocationLookup, type Allocation } from "@/components/allocation-lookup";
import { Button } from "@/components/ui/button";
import { checkAllocation, getGasBalance, requestClaim } from "@/lib/claim-server";
import { formatCabal, shortAddress } from "@/lib/config";

export default function ClaimDashboard({ open, paused }: { open: boolean; paused: boolean }) {
  const { ready, authenticated, login, logout, user, getAccessToken } = usePrivy();
  const embedded = user?.wallet?.address ?? null;

  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [eth, setEth] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"success" | "already" | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!embedded) return;
    getGasBalance({ data: { wallet: embedded } }).then((res) => {
      if (res.ok) setEth(Number.parseFloat(res.eth).toFixed(5));
    });
  }, [embedded]);

  useEffect(() => {
    if (!authenticated) {
      setToken(null);
      return;
    }
    getAccessToken().then((t) => setToken(t));
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (!authenticated || !token || !allocation) return;
    checkAllocation({
      data: { wallet: allocation.wallet, accessToken: token },
    }).then((res) => {
      if (res.ok) setAllocation(res.allocation);
      else setError(res.error);
    });
  }, [authenticated, token, allocation?.wallet]);

  async function onClaim() {
    if (!allocation) return;
    setError(null);
    setClaiming(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setError("Session expired. Log in again.");
        return;
      }
      const res = await requestClaim({
        data: {
          wallet: allocation.wallet,
          accessToken,
          embeddedWallet: embedded ?? undefined,
        },
      });
      if ("alreadyClaimed" in res && res.alreadyClaimed) {
        setAllocation(res.allocation);
        setResult("already");
        return;
      }
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setError("Claim contract is not live on-chain yet. Your allocation is locked. No tokens were sent.");
    } catch {
      setError("Claim failed. Try again.");
    } finally {
      setClaiming(false);
    }
  }

  async function copyEmbedded() {
    if (!embedded) return;
    try {
      await navigator.clipboard.writeText(embedded);
    } catch {
      /* ignore */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (!ready) {
    return (
      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <p className="text-sm text-muted">Preparing login…</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {!authenticated ? (
        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl font-semibold tracking-wide text-fg">
            Log in to claim
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Email or X. Privy creates an embedded Base wallet — no MetaMask.
          </p>
          <Button
            className="mt-4"
            size="full"
            onClick={() => login({ loginMethods: ["email", "twitter"] })}
          >
            Log in with email or X
          </Button>
        </section>
      ) : (
        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-wide text-muted">CABAL AIRDROP</p>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-wide text-fg">
            Embedded wallet
          </h2>
          <p className="mt-3 font-mono text-sm text-fg">
            {embedded ? shortAddress(embedded) : "Creating wallet…"}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Button type="button" variant="outline" size="full" disabled={!embedded} onClick={copyEmbedded}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy address"}
            </Button>
            <Button type="button" variant="ghost" size="full" onClick={() => logout()}>
              Log out
            </Button>
          </div>
          <div className="mt-4 rounded-lg bg-surface-2 p-3 shadow-[var(--shadow-border)]">
            <p className="text-xs font-medium tracking-wide text-muted">Gas balance</p>
            <p className="mt-1 font-display text-lg font-semibold tabular-nums text-fg">
              {eth ? `${eth} ETH` : "—"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Keep enough Base ETH in this wallet to pay network gas. Fund the address above.
            </p>
          </div>
        </section>
      )}

      <AllocationLookup
        accessToken={token}
        inputId="dash-alloc-wallet"
        onFound={(row) => {
          setAllocation(row);
          setResult(null);
          setError(null);
        }}
      />

      {error ? (
        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="font-display text-lg font-semibold tracking-wide text-fg">Notice</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{error}</p>
        </section>
      ) : null}

      {allocation && authenticated ? (
        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          {result === "already" || allocation.claimed ? (
            <div>
              <p className="font-display text-lg font-semibold text-fg">Already claimed</p>
              <p className="mt-1 text-sm text-muted">
                You previously claimed {formatCabal(allocation.totalAllocation)} CABAL.
              </p>
              {allocation.claimTransaction ? (
                <a
                  className="mt-3 inline-block text-sm text-primary"
                  href={`https://basescan.org/tx/${allocation.claimTransaction}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on BaseScan
                </a>
              ) : null}
            </div>
          ) : result === "success" ? (
            <div>
              <p className="font-display text-lg font-semibold text-success">Claim successful</p>
              <p className="mt-1 text-sm text-muted">
                You received {formatCabal(allocation.totalAllocation)} CABAL.
              </p>
            </div>
          ) : (
            <Button
              size="full"
              disabled={!open || paused || claiming}
              onClick={onClaim}
            >
              {claiming
                ? "Submitting…"
                : !open
                  ? "Claim not live"
                  : paused
                    ? "Claims paused"
                    : "Claim Airdrop"}
            </Button>
          )}
        </section>
      ) : null}
    </div>
  );
}
