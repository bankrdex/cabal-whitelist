import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminLogin,
  adminLogout,
  adminSession,
  adminStats,
  importCsv,
  lookupWallet,
  previewCsv,
  setClaimStart,
  setPaused,
} from "@/lib/admin-server";
import { formatCabal } from "@/lib/config";

type Stats = Awaited<ReturnType<typeof adminStats>>;

export function AdminApp() {
  const [session, setSession] = useState<{ ok: boolean; configured: boolean } | null>(null);
  const [password, setPassword] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof previewCsv>> | null>(null);
  const [replace, setReplace] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [lookup, setLookup] = useState("");
  const [startIso, setStartIso] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const s = await adminSession();
    setSession(s);
    if (s.ok) {
      const st = await adminStats();
      setStats(st);
      setStartIso(st.claimStart);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!session) {
    return <p className="p-6 text-sm text-muted">Loading…</p>;
  }

  if (!session.ok) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-4 px-4">
        <h1 className="font-display text-3xl font-semibold tracking-wide text-fg">Admin</h1>
        {!session.configured ? (
          <p className="text-sm text-muted">Set ADMIN_PASSWORD on the server to unlock this page.</p>
        ) : (
          <>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              size="full"
              onClick={async () => {
                const res = await adminLogin({ data: { password } });
                if (!res.ok) setMsg(res.error);
                else {
                  setMsg(null);
                  await refresh();
                }
              }}
            >
              Enter
            </Button>
          </>
        )}
        {msg ? <p className="text-sm text-danger">{msg}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-wide text-fg">
          CABAL AIRDROP ADMIN
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await adminLogout();
            await refresh();
          }}
        >
          Log out
        </Button>
      </div>

      {stats && !stats.dbReady ? (
        <p className="text-sm text-danger">
          Database is not connected. Set DATABASE_URL before uploading allocations.
        </p>
      ) : null}

      {stats ? (
        <section className="grid grid-cols-2 gap-2">
          <Stat label="Eligible wallets" value={formatCabal(stats.eligibleWallets)} />
          <Stat label="Checked wallets" value={formatCabal(stats.checkedWallets ?? 0)} />
          <Stat label="Total allocation" value={formatCabal(stats.totalAllocation)} />
          <Stat label="Tx allocation" value={formatCabal(stats.transactionAllocation)} />
          <Stat label="NFT allocation" value={formatCabal(stats.nftAllocation)} />
          <Stat label="Claims completed" value={formatCabal(stats.claimsCompleted)} />
          <Stat label="Tokens claimed" value={formatCabal(stats.tokensClaimed)} />
        </section>
      ) : null}

      <p className="text-sm text-muted">
        Claim status: {stats?.live ? "LIVE" : stats?.paused ? "PAUSED" : "NOT LIVE"}
      </p>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold text-fg">Upload CSV</h2>
        <p className="mt-1 text-xs text-muted">wallet,transaction_count,nft_count</p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setCsv(await file.text());
            setMsg(`Loaded ${file.name}`);
          }}
        />
        <Button
          className="mt-3"
          variant="outline"
          size="full"
          type="button"
          onClick={() => fileRef.current?.click()}
        >
          Choose CSV file
        </Button>
        <textarea
          className="mt-3 h-40 w-full rounded-md bg-surface-2 p-3 font-mono text-xs text-fg shadow-[var(--shadow-input)] outline-none focus-visible:shadow-[var(--shadow-primary)]"
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="wallet,transaction_count,nft_count"
        />
        <label className="mt-3 flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
          Replace all existing rows
        </label>
        <div className="mt-3 flex flex-col gap-2">
          <Button
            variant="outline"
            size="full"
            onClick={async () => {
              const res = await previewCsv({ data: { csv } });
              setPreview(res);
              setMsg(`${res.count} valid rows, ${res.errorCount} errors`);
            }}
          >
            Validate
          </Button>
          <Button
            size="full"
            onClick={async () => {
              const res = await importCsv({ data: { csv, replace } });
              if (!res.ok) setMsg(res.error);
              else {
                setMsg(`Imported ${res.imported}. Merkle ${res.merkleRoot.slice(0, 10)}…`);
                await refresh();
              }
            }}
          >
            Import
          </Button>
        </div>
        {preview?.preview.length ? (
          <ul className="mt-3 space-y-1 text-xs text-muted">
            {preview.preview.map((row) => (
              <li key={row.wallet} className="font-mono">
                {row.wallet.slice(0, 8)}… tx {row.transaction_count} nft {row.nft_count} →{" "}
                {formatCabal(row.total_allocation)}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold text-fg">Lookup wallet</h2>
        <Input className="mt-3" value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="0x…" />
        <Button
          className="mt-3"
          variant="outline"
          size="full"
          onClick={async () => {
            const res = await lookupWallet({ data: { wallet: lookup } });
            setMsg(res.ok ? JSON.stringify(res.row) : res.error);
          }}
        >
          View
        </Button>
      </section>

      <section className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold text-fg">Claim window</h2>
        <Input className="mt-3" value={startIso} onChange={(e) => setStartIso(e.target.value)} />
        <div className="mt-3 flex flex-col gap-2">
          <Button
            variant="outline"
            size="full"
            onClick={async () => {
              const res = await setClaimStart({ data: { iso: startIso } });
              setMsg(res.ok ? `Start set to ${res.iso}` : res.error);
              await refresh();
            }}
          >
            Save opening time
          </Button>
          <Button
            size="full"
            onClick={async () => {
              await setPaused({ data: { paused: !stats?.paused } });
              await refresh();
            }}
          >
            {stats?.paused ? "Unpause claims" : "Pause claims"}
          </Button>
        </div>
      </section>

      {msg ? <p className="break-all text-sm text-muted">{msg}</p> : null}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold tabular-nums text-fg">{value}</p>
    </div>
  );
}
