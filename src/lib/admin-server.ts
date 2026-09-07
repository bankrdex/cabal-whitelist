import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { nftAllocation, totalAllocation, txAllocation } from "@/lib/allocation";
import { CLAIM } from "@/lib/config";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { allocationLeaf, buildMerkle } from "@/lib/merkle";
import { normalizeWallet } from "@/lib/validation";

const COOKIE = "cabal_admin";

function adminSecret() {
  return env("ADMIN_PASSWORD");
}

function tokenFor(secret: string) {
  return createHmac("sha256", secret).update("cabal-admin-v1").digest("hex");
}

function isAdmin() {
  const secret = adminSecret();
  const cookie = getCookie(COOKIE);
  if (!secret || !cookie) return false;
  const expected = tokenFor(secret);
  const a = Buffer.from(cookie);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function requireAdmin() {
  if (!isAdmin()) throw new Error("Unauthorized");
}

async function logAction(action: string, detail?: string) {
  try {
    const sql = await getSql();
    await sql`insert into admin_actions (action, detail) values (${action}, ${detail ?? null})`;
  } catch {
    /* login still works if the database is not connected yet */
  }
}

export const adminSession = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return { ok: isAdmin(), configured: Boolean(adminSecret()) };
  } catch {
    return { ok: false, configured: Boolean(adminSecret()) };
  }
});

export const adminLogin = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ password: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const secret = adminSecret();
    if (!secret) return { ok: false as const, error: "ADMIN_PASSWORD is not set." };
    const a = Buffer.from(data.password);
    const b = Buffer.from(secret);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false as const, error: "Wrong password." };
    }
    setCookie(COOKIE, tokenFor(secret), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    await logAction("login");
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  setCookie(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return { ok: true as const };
});

type CountRow = { n: number };
type SumRow = { n: number | null };

export const adminStats = createServerFn({ method: "GET" }).handler(async () => {
  requireAdmin();
  try {
    const sql = await getSql();
    const wallets = await sql<CountRow>`select count(*)::int as n from allocations`;
    const claimed = await sql<CountRow>`select count(*)::int as n from allocations where claimed = true`;
    const total = await sql<SumRow>`select coalesce(sum(total_allocation), 0)::bigint as n from allocations`;
    const tx = await sql<SumRow>`select coalesce(sum(transaction_allocation), 0)::bigint as n from allocations`;
    const nft = await sql<SumRow>`select coalesce(sum(nft_allocation), 0)::bigint as n from allocations`;
    const claimedAmt = await sql<SumRow>`
      select coalesce(sum(total_allocation), 0)::bigint as n from allocations where claimed = true
    `;
    const start = await sql<{ value: string }>`select value from claim_settings where key = 'claim_start'`;
    const paused = await sql<{ value: string }>`select value from claim_settings where key = 'paused'`;
    const root = await sql<{ value: string }>`select value from claim_settings where key = 'merkle_root'`;
    return {
      eligibleWallets: wallets[0]?.n ?? 0,
      totalAllocation: Number(total[0]?.n ?? 0),
      transactionAllocation: Number(tx[0]?.n ?? 0),
      nftAllocation: Number(nft[0]?.n ?? 0),
      claimsCompleted: claimed[0]?.n ?? 0,
      tokensClaimed: Number(claimedAmt[0]?.n ?? 0),
      claimStart: start[0]?.value ?? CLAIM.at,
      paused: paused[0]?.value === "true",
      merkleRoot: root[0]?.value ?? "",
      live: Date.now() >= new Date(start[0]?.value ?? CLAIM.at).getTime() && paused[0]?.value !== "true",
      dbReady: true,
    };
  } catch {
    return {
      eligibleWallets: 0,
      totalAllocation: 0,
      transactionAllocation: 0,
      nftAllocation: 0,
      claimsCompleted: 0,
      tokensClaimed: 0,
      claimStart: CLAIM.at,
      paused: false,
      merkleRoot: "",
      live: false,
      dbReady: false,
    };
  }
});

type PreviewRow = {
  wallet: string;
  transaction_count: number;
  nft_count: number;
  transaction_allocation: number;
  nft_allocation: number;
  total_allocation: number;
};

function parseCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const errors: string[] = [];
  const rows: PreviewRow[] = [];
  const seen = new Set<string>();
  let headerSkipped = false;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i]?.trim();
    if (!raw) continue;
    const cols = raw.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    if (!headerSkipped) {
      headerSkipped = true;
      const head = cols.map((c) => c.toLowerCase().replace(/\s+/g, "_")).join(",");
      if (head.includes("wallet")) continue;
    }
    const [walletRaw, txRaw, nftRaw] = cols;
    const wallet = normalizeWallet(walletRaw ?? "");
    const tx = Number.parseInt(txRaw ?? "", 10);
    const nft = Number.parseInt(nftRaw ?? "", 10);
    if (!wallet || !Number.isFinite(tx) || !Number.isFinite(nft) || tx < 0 || nft < 0) {
      errors.push(`Row ${i + 1}: invalid data`);
      continue;
    }
    if (seen.has(wallet)) {
      errors.push(`Row ${i + 1}: duplicate wallet ${wallet}`);
      continue;
    }
    seen.add(wallet);
    rows.push({
      wallet,
      transaction_count: tx,
      nft_count: nft,
      transaction_allocation: txAllocation(tx),
      nft_allocation: nftAllocation(nft),
      total_allocation: totalAllocation(tx, nft),
    });
  }

  return { rows, errors };
}

export const previewCsv = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ csv: z.string().min(1).max(8_000_000) }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin();
    const parsed = parseCsv(data.csv);
    const total = parsed.rows.reduce((sum, row) => sum + row.total_allocation, 0);
    return {
      ok: true as const,
      count: parsed.rows.length,
      errors: parsed.errors.slice(0, 50),
      errorCount: parsed.errors.length,
      totalAllocation: total,
      preview: parsed.rows.slice(0, 8),
    };
  });

export const importCsv = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z.object({ csv: z.string().min(1).max(8_000_000), replace: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin();
    const parsed = parseCsv(data.csv);
    if (parsed.rows.length === 0) {
      return { ok: false as const, error: "No valid rows to import." };
    }
    let sql;
    try {
      sql = await getSql();
    } catch {
      return { ok: false as const, error: "DATABASE_URL is not set. Allocations cannot be stored." };
    }
    if (data.replace) {
      await sql`delete from allocations`;
    }
    for (const row of parsed.rows) {
      const leaf = allocationLeaf(row.wallet, BigInt(row.total_allocation));
      await sql`
        insert into allocations (
          wallet, transaction_count, nft_count, transaction_allocation,
          nft_allocation, total_allocation, merkle_leaf, updated_at
        ) values (
          ${row.wallet}, ${row.transaction_count}, ${row.nft_count}, ${row.transaction_allocation},
          ${row.nft_allocation}, ${row.total_allocation}, ${leaf}, now()
        )
        on conflict (wallet) do update set
          transaction_count = excluded.transaction_count,
          nft_count = excluded.nft_count,
          transaction_allocation = excluded.transaction_allocation,
          nft_allocation = excluded.nft_allocation,
          total_allocation = excluded.total_allocation,
          merkle_leaf = excluded.merkle_leaf,
          updated_at = now()
      `;
    }
    const leaves = await sql<{ merkle_leaf: string }>`
      select merkle_leaf from allocations where merkle_leaf is not null order by wallet
    `;
    const { root } = buildMerkle(leaves.map((item) => item.merkle_leaf as `0x${string}`));
    await sql`
      insert into claim_settings (key, value, updated_at)
      values ('merkle_root', ${root}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
    await logAction("import_csv", `${parsed.rows.length} rows replace=${data.replace}`);
    return {
      ok: true as const,
      imported: parsed.rows.length,
      skipped: parsed.errors.length,
      merkleRoot: root,
    };
  });

export const lookupWallet = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ wallet: z.string() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin();
    const wallet = normalizeWallet(data.wallet);
    if (!wallet) return { ok: false as const, error: "Invalid wallet." };
    let sql;
    try {
      sql = await getSql();
    } catch {
      return { ok: false as const, error: "DATABASE_URL is not set." };
    }
    const rows = await sql<{
      wallet: string;
      transaction_count: number;
      nft_count: number;
      total_allocation: number;
      claimed: boolean;
      claim_transaction: string | null;
    }>`
      select wallet, transaction_count, nft_count, total_allocation, claimed, claim_transaction
      from allocations where wallet = ${wallet}
    `;
    if (!rows[0]) return { ok: false as const, error: "Not in allocation file." };
    return { ok: true as const, row: rows[0] };
  });

export const setPaused = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ paused: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin();
    let sql;
    try {
      sql = await getSql();
    } catch {
      return { ok: false as const, paused: data.paused };
    }
    const value = data.paused ? "true" : "false";
    await sql`
      insert into claim_settings (key, value, updated_at)
      values ('paused', ${value}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
    await logAction(data.paused ? "pause" : "unpause");
    return { ok: true as const, paused: data.paused };
  });

export const setClaimStart = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ iso: z.string().min(10) }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin();
    const t = new Date(data.iso).getTime();
    if (!Number.isFinite(t)) return { ok: false as const, error: "Invalid timestamp." };
    let sql;
    try {
      sql = await getSql();
    } catch {
      return { ok: false as const, error: "DATABASE_URL is not set." };
    }
    await sql`
      insert into claim_settings (key, value, updated_at)
      values ('claim_start', ${data.iso}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()
    `;
    await logAction("set_claim_start", data.iso);
    return { ok: true as const, iso: data.iso };
  });
