import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkAllocation } from "@/lib/claim-server";
import { TOKEN, formatCabal } from "@/lib/config";

export type Allocation = {
  wallet: string;
  transactionCount: number;
  nftCount: number;
  transactionAllocation: number;
  nftAllocation: number;
  totalAllocation: number;
  claimed: boolean;
  claimTransaction: string | null;
};

export function AllocationLookup({
  accessToken,
  onFound,
  inputId = "alloc-wallet",
}: {
  accessToken?: string | null;
  onFound?: (allocation: Allocation | null) => void;
  inputId?: string;
}) {
  const [lookup, setLookup] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocation, setAllocation] = useState<Allocation | null>(null);

  async function onCheck() {
    setError(null);
    setChecking(true);
    try {
      const res = await checkAllocation({
        data: { wallet: lookup, accessToken: accessToken ?? undefined },
      });
      if (!res.ok) {
        setAllocation(null);
        setError(res.error);
        onFound?.(null);
        return;
      }
      setAllocation(res.allocation);
      onFound?.(res.allocation);
    } catch {
      setError("Could not check allocation.");
      onFound?.(null);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-xl font-semibold tracking-wide text-fg">
          Check your allocation
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Enter the Base wallet from the allocation file — not necessarily the embedded wallet.
        </p>
        <label className="mt-4 block text-xs font-medium tracking-wide text-muted" htmlFor={inputId}>
          Wallet address
        </label>
        <Input
          id={inputId}
          className="mt-2"
          placeholder="0x…"
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCheck();
          }}
        />
        <Button className="mt-3" size="full" disabled={checking || !lookup.trim()} onClick={onCheck}>
          {checking ? "Checking…" : "Check Allocation"}
        </Button>
      </section>

      {error ? (
        <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="font-display text-lg font-semibold tracking-wide text-fg">
            {error === "Wallet Not Eligible" ? "Wallet not eligible" : "Notice"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {error === "Wallet Not Eligible"
              ? "This wallet is not in the allocation file."
              : error}
          </p>
        </section>
      ) : null}

      {allocation ? <AllocationResult allocation={allocation} /> : null}
    </div>
  );
}

export function AllocationResult({ allocation }: { allocation: Allocation }) {
  return (
    <section className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium tracking-wide text-muted">YOUR ALLOCATION</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-2 p-3 shadow-[var(--shadow-border)]">
          <p className="text-xs text-muted">Transactions</p>
          <p className="mt-1 text-sm text-fg">
            {allocation.transactionCount} × {TOKEN.perTx}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-primary">
            {formatCabal(allocation.transactionAllocation)} CABAL
          </p>
        </div>
        <div className="rounded-lg bg-surface-2 p-3 shadow-[var(--shadow-border)]">
          <p className="text-xs text-muted">NFTs</p>
          <p className="mt-1 text-sm text-fg">
            {allocation.nftCount} × {TOKEN.perNft}
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-primary">
            {formatCabal(allocation.nftAllocation)} CABAL
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium tracking-wide text-muted">TOTAL ALLOCATION</p>
      <p className="font-display text-3xl font-semibold tracking-wide text-fg">
        {formatCabal(allocation.totalAllocation)} CABAL
      </p>
    </section>
  );
}
