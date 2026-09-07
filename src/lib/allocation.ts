import { TOKEN } from "@/lib/config";

export function txAllocation(transactionCount: number) {
  return transactionCount * TOKEN.perTx;
}

export function nftAllocation(nftCount: number) {
  return nftCount * TOKEN.perNft;
}

export function totalAllocation(transactionCount: number, nftCount: number) {
  return txAllocation(transactionCount) + nftAllocation(nftCount);
}
