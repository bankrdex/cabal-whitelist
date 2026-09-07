import { createServerFn } from "@tanstack/react-start";
import { createPublicClient, formatEther, http } from "viem";
import { base } from "viem/chains";
import { nftAllocation, totalAllocation, txAllocation } from "@/lib/allocation";
import { CLAIM } from "@/lib/config";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { merkleProof, buildMerkle } from "@/lib/merkle";
import { privyConfigured, verifyPrivyUser } from "@/lib/privy-server";
import { accessTokenSchema, normalizeWallet, walletInputSchema } from "@/lib/validation";
import { z } from "zod";

type SettingRow = { value: string };
type AllocationRow = {
  wallet: string;
  transaction_count: number;
  nft_count: number;
  transaction_allocation: number;
  nft_allocation: number;
  total_allocation: number;
  merkle_leaf: string | null;
  claimed: boolean;
  claim_transaction: string | null;
};

async function sqlClient() {
  try {
    return await getSql();
  } catch {
    return null;
  }
}

async function setting(key: string, fallback: string) {
  const sql = await sqlClient();
  if (!sql) return fallback;
  const rows = await sql<SettingRow>`select value from claim_settings where key = ${key}`;
  return rows[0]?.value ?? fallback;
}

export async function readClaimWindow() {
  const startRaw = await setting("claim_start", CLAIM.at);
  const paused = (await setting("paused", "false")) === "true";
  const start = new Date(startRaw).getTime();
  const now = Date.now();
  return {
    now,
    start,
    startIso: startRaw,
    paused,
    open: now >= start && !paused,
  };
}

function mapAllocation(row: AllocationRow) {
  return {
    wallet: row.wallet,
    transactionCount: row.transaction_count,
    nftCount: row.nft_count,
    transactionAllocation: row.transaction_allocation,
    nftAllocation: row.nft_allocation,
    totalAllocation: row.total_allocation,
    claimed: row.claimed,
    claimTransaction: row.claim_transaction,
  };
}

export const getClaimStatus = createServerFn({ method: "GET" }).handler(async () => {
  const fallback = {
    open: Date.now() >= new Date(CLAIM.at).getTime(),
    paused: false,
    startIso: CLAIM.at,
    now: Date.now(),
    tokenAddress: env("CABAL_TOKEN_ADDRESS") ?? null,
    claimContract: env("CLAIM_CONTRACT_ADDRESS") ?? null,
    privyReady: privyConfigured(),
  };
  try {
    const window = await readClaimWindow();
    return {
      open: window.open,
      paused: window.paused,
      startIso: window.startIso,
      now: window.now,
      tokenAddress: fallback.tokenAddress,
      claimContract: fallback.claimContract,
      privyReady: fallback.privyReady,
    };
  } catch {
    return fallback;
  }
});

export const getGasBalance = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ wallet: walletInputSchema }).parse(input))
  .handler(async ({ data }) => {
    const wallet = normalizeWallet(data.wallet);
    if (!wallet) return { ok: false as const, error: "Invalid wallet." };
    try {
      const rpc = env("BASE_RPC_URL") ?? "https://mainnet.base.org";
      const client = createPublicClient({ chain: base, transport: http(rpc) });
      const wei = await client.getBalance({ address: wallet as `0x${string}` });
      return { ok: true as const, eth: formatEther(wei) };
    } catch {
      return { ok: false as const, error: "Could not read gas balance." };
    }
  });

export const checkAllocation = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        wallet: walletInputSchema,
        accessToken: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const wallet = normalizeWallet(data.wallet);
    if (!wallet) {
      return { ok: false as const, error: "Enter a valid Base wallet address." };
    }

    const sql = await sqlClient();
    if (!sql) {
      return { ok: false as const, error: "Allocation database is not connected yet." };
    }
    const rows = await sql<AllocationRow>`
      select wallet, transaction_count, nft_count, transaction_allocation,
             nft_allocation, total_allocation, merkle_leaf, claimed, claim_transaction
      from allocations where wallet = ${wallet}
    `;
    const row = rows[0];
    if (!row) {
      return { ok: false as const, error: "Wallet Not Eligible" };
    }

    let bound: string | null = null;
    if (data.accessToken && privyConfigured()) {
      try {
        const userId = await verifyPrivyUser(data.accessToken);
        const existing = await sql<{ allocation_wallet: string }>`
          select allocation_wallet from user_binds where privy_user_id = ${userId}
        `;
        if (existing[0] && existing[0].allocation_wallet !== wallet) {
          return {
            ok: false as const,
            error: "This login is already bound to a different allocation wallet.",
          };
        }
        if (!existing[0]) {
          const taken = await sql<{ privy_user_id: string }>`
            select privy_user_id from user_binds where allocation_wallet = ${wallet}
          `;
          if (taken[0] && taken[0].privy_user_id !== userId) {
            return {
              ok: false as const,
              error: "This allocation wallet is already bound to another login.",
            };
          }
          await sql`
            insert into user_binds (privy_user_id, allocation_wallet)
            values (${userId}, ${wallet})
            on conflict (privy_user_id) do nothing
          `;
        }
        bound = wallet;
      } catch {
        return { ok: false as const, error: "Session expired. Log in again." };
      }
    }

    return {
      ok: true as const,
      bound,
      allocation: mapAllocation(row),
    };
  });

export const requestClaim = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({
        wallet: walletInputSchema,
        accessToken: accessTokenSchema,
        embeddedWallet: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const window = await readClaimWindow();
    if (window.paused) {
      return { ok: false as const, error: "Claims are paused." };
    }
    if (Date.now() < window.start) {
      return { ok: false as const, error: "Claim is not live yet." };
    }

    const wallet = normalizeWallet(data.wallet);
    if (!wallet) return { ok: false as const, error: "Invalid allocation wallet." };

    let userId: string;
    try {
      userId = await verifyPrivyUser(data.accessToken);
    } catch {
      return { ok: false as const, error: "Session expired. Log in again." };
    }

    const sql = await sqlClient();
    if (!sql) {
      return { ok: false as const, error: "Allocation database is not connected yet." };
    }
    const bind = await sql<{ allocation_wallet: string; embedded_wallet: string | null }>`
      select allocation_wallet, embedded_wallet from user_binds where privy_user_id = ${userId}
    `;
    if (!bind[0] || bind[0].allocation_wallet !== wallet) {
      return {
        ok: false as const,
        error: "Check this allocation wallet while logged in before claiming.",
      };
    }

    if (data.embeddedWallet) {
      const embedded = normalizeWallet(data.embeddedWallet);
      if (embedded) {
        await sql`
          update user_binds set embedded_wallet = ${embedded} where privy_user_id = ${userId}
        `;
      }
    }

    const rows = await sql<AllocationRow>`
      select wallet, transaction_count, nft_count, transaction_allocation,
             nft_allocation, total_allocation, merkle_leaf, claimed, claim_transaction
      from allocations where wallet = ${wallet}
    `;
    const row = rows[0];
    if (!row) return { ok: false as const, error: "Wallet Not Eligible" };
    if (row.claimed) {
      return {
        ok: false as const,
        alreadyClaimed: true as const,
        allocation: mapAllocation(row),
      };
    }

    const contract = env("CLAIM_CONTRACT_ADDRESS");
    if (!contract) {
      return {
        ok: false as const,
        error: "Claim contract is not configured yet. Allocation is locked. No tokens were sent.",
        allocation: mapAllocation(row),
      };
    }

    const leaves = await sql<{ merkle_leaf: string }>`
      select merkle_leaf from allocations where merkle_leaf is not null order by wallet
    `;
    const list = leaves.map((item) => item.merkle_leaf as `0x${string}`);
    const index = list.findIndex((leaf) => leaf === row.merkle_leaf);
    const { layers } = buildMerkle(list);
    const proof = index >= 0 ? merkleProof(layers, index) : [];

    return {
      ok: true as const,
      allocation: mapAllocation(row),
      proof,
      contract,
      amount: row.total_allocation,
      index,
    };
  });

export { txAllocation, nftAllocation, totalAllocation };
