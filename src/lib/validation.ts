import { isAddress } from "viem";
import { z } from "zod";

export function normalizeWallet(raw: string): string | null {
  const trimmed = raw.trim();
  if (!isAddress(trimmed)) return null;
  return trimmed.toLowerCase();
}

export const walletInputSchema = z
  .string()
  .trim()
  .refine((value) => isAddress(value), "Enter a valid Base wallet address.");

export const accessTokenSchema = z.string().min(16);

export const csvRowSchema = z.object({
  wallet: z.string(),
  transaction_count: z.number().int().nonnegative(),
  nft_count: z.number().int().nonnegative(),
});
