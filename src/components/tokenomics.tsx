import { useMemo, useState, type ReactNode } from "react";
import { Flame, Gem, Radio, ShieldOff, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TOKEN } from "@/lib/config";
import { cn } from "@/lib/utils";

function formatTokens(n: number) {
  return n.toLocaleString("en-US");
}

export function Tokenomics() {
  const [txs, setTxs] = useState(String(TOKEN.exampleTxCount));
  const txCount = useMemo(() => {
    const parsed = Number.parseInt(txs.replace(/[^\d]/g, ""), 10);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.min(parsed, 1_000_000);
  }, [txs]);
  const estimate = txCount * TOKEN.perTx;

  return (
    <section id="token" className="flex scroll-mt-6 flex-col gap-3">
      <div
        className="stagger-in rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
        style={{ animationDelay: "360ms" }}
      >
        <p className="text-xs font-medium tracking-wide text-muted">Token</p>
        <h2 className="font-display mt-1 text-2xl font-semibold tracking-wide text-fg">
          {TOKEN.symbol} supply
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Fixed supply. Community first. Zero team allocation.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat value={TOKEN.totalLabel} label="Total supply" />
          <Stat value={TOKEN.airdropLabel} label="Airdrop" accent />
          <Stat value="0" label="Team" />
        </div>

        <div className="mt-5 overflow-hidden rounded-lg bg-surface-2 shadow-[var(--shadow-border)]">
          <div className="flex h-3 w-full">
            <div className="bg-primary" style={{ width: "65%" }} title="Base users 65B" />
            <div className="bg-accent" style={{ width: "5%" }} title="NFT holders 5B" />
            <div className="bg-danger/80" style={{ width: "10%" }} title="Burn 10B" />
            <div className="bg-fg/25" style={{ width: "20%" }} title="Future 20B" />
          </div>
          <ul className="grid grid-cols-2 gap-px bg-border/40 sm:grid-cols-4">
            <Legend swatch="bg-primary" label="Base users" value="65B" />
            <Legend swatch="bg-accent" label="NFT holders" value="5B" />
            <Legend swatch="bg-danger/80" label="Burned" value="10B" />
            <Legend swatch="bg-fg/25" label="Future" value="20B" />
          </ul>
        </div>
      </div>

      <article
        className="stagger-in rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
        style={{ animationDelay: "400ms" }}
      >
        <p className="text-xs font-medium tracking-wide text-muted">Airdrop · 70 billion</p>
        <h3 className="font-display mt-1 text-lg font-semibold tracking-wide text-fg">
          How the 70B splits
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The community airdrop is 70 billion. It goes to NFT holders and to Base
          users who submitted a wallet.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <SplitRow
            icon={<Gem className="size-4" />}
            title="NFT holders"
            amount="5 billion"
            detail={`${formatTokens(TOKEN.perNft)} ${TOKEN.symbol} per NFT · ${TOKEN.nftSupply.toLocaleString("en-US")} supply`}
          />
          <SplitRow
            icon={<Wallet className="size-4" />}
            title="Base users"
            amount="65 billion"
            detail="Wallets submitted on the whitelist"
          />
        </div>
      </article>

      <article
        className="stagger-in rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
        style={{ animationDelay: "440ms" }}
      >
        <p className="text-xs font-medium tracking-wide text-muted">Rewards</p>
        <h3 className="font-display mt-1 text-lg font-semibold tracking-wide text-fg">
          How we calculate it
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Every transaction you have on Base gives you {TOKEN.perTx} {TOKEN.symbol}.
          Final allocation uses that rate — {TOKEN.perTx} × {TOKEN.exampleTxCount} ={" "}
          {TOKEN.exampleFinal}.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <FormulaChip top="Per tx" value={String(TOKEN.perTx)} />
          <FormulaChip top="Example txs" value={String(TOKEN.exampleTxCount)} />
          <FormulaChip top="Final" value={String(TOKEN.exampleFinal)} accent />
        </div>

        <p className="mt-3 text-center font-mono text-xs tracking-wide text-muted">
          {TOKEN.perTx} × {TOKEN.exampleTxCount} = {TOKEN.exampleFinal}
        </p>

        <div className="mt-4 rounded-lg bg-surface-2 p-4 shadow-[var(--shadow-border)]">
          <label htmlFor="tx-count" className="text-xs font-medium tracking-wide text-muted">
            Your Base transactions
          </label>
          <Input
            id="tx-count"
            inputMode="numeric"
            pattern="[0-9]*"
            value={txs}
            onChange={(e) => setTxs(e.target.value)}
            className="mt-2"
            aria-describedby="tx-estimate"
          />
          <p id="tx-estimate" className="mt-3 text-sm text-fg">
            <span className="font-display text-xl font-semibold tabular-nums text-primary">
              {formatTokens(estimate)}
            </span>
            <span className="ml-2 text-muted">
              {TOKEN.symbol} · {TOKEN.perTx} × {formatTokens(txCount)}
            </span>
          </p>
        </div>

        <div className="mt-3 rounded-lg bg-surface-2 p-4 shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium tracking-wide text-muted">Each NFT</p>
          <p className="font-display mt-1 text-2xl font-semibold tabular-nums text-fg">
            {formatTokens(TOKEN.perNft)}
          </p>
          <p className="mt-1 text-sm text-muted">{TOKEN.symbol} per NFT held</p>
        </div>
      </article>

      <article
        className="stagger-in rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]"
        style={{ animationDelay: "480ms" }}
      >
        <p className="text-xs font-medium tracking-wide text-muted">After the drop</p>
        <h3 className="font-display mt-1 text-lg font-semibold tracking-wide text-fg">
          Burn, then 20 billion left
        </h3>
        <ul className="mt-4 flex flex-col gap-3">
          <Note
            icon={<Flame className="size-4 text-danger" />}
            title="Unclaimed community allocation is burned"
            body="Whatever is left of the 70 billion airdrop after distribution is burned."
          />
          <Note
            icon={<Flame className="size-4 text-danger" />}
            title={`${TOKEN.remainderBurnLabel} burned from the remaining ${TOKEN.remainderLabel}`}
            body={`Of the ${TOKEN.remainderLabel} outside the airdrop, ${TOKEN.remainderBurnLabel} is burned.`}
          />
          <Note
            icon={<Radio className="size-4 text-primary" />}
            title={`${TOKEN.futureLabel} stays for the cabal`}
            body="Future airdrops and possible streaming rewards for NFT holders. Nothing is reserved for a team."
          />
          <Note
            icon={<ShieldOff className="size-4 text-fg" />}
            title="No team allocation"
            body="Zero tokens set aside for insiders. The remaining 20 billion is community-only."
          />
        </ul>
      </article>
    </section>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-2 px-2 py-3 text-center shadow-[var(--shadow-border)]">
      <p
        className={cn(
          "font-display text-sm font-semibold tracking-wide sm:text-base",
          accent ? "text-primary" : "text-fg",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs leading-tight text-muted">{label}</p>
    </div>
  );
}

function Legend({
  swatch,
  label,
  value,
}: {
  swatch: string;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-2 bg-surface-2 px-3 py-2.5">
      <span className={cn("size-2.5 shrink-0 rounded-sm", swatch)} />
      <span className="min-w-0 flex-1 text-xs text-muted">{label}</span>
      <span className="font-mono text-xs tabular-nums text-fg">{value}</span>
    </li>
  );
}

function SplitRow({
  icon,
  title,
  amount,
  detail,
}: {
  icon: ReactNode;
  title: string;
  amount: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface-2 p-3 shadow-[var(--shadow-border)]">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface text-primary shadow-[var(--shadow-border)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-medium text-fg">{title}</p>
          <p className="font-mono text-sm tabular-nums text-primary">{amount}</p>
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{detail}</p>
      </div>
    </div>
  );
}

function FormulaChip({
  top,
  value,
  accent,
}: {
  top: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-surface-2 py-3 text-center shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted">{top}</p>
      <p
        className={cn(
          "font-display mt-1 text-2xl font-semibold tabular-nums",
          accent ? "text-primary" : "text-fg",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Note({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-surface-2 shadow-[var(--shadow-border)]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{body}</p>
      </div>
    </li>
  );
}
