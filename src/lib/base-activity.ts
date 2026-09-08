import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import { TOKEN } from "@/lib/config";
import { env } from "@/lib/env.server";

const nftAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export async function readBaseActivity(wallet: string) {
  try {
    const rpc = env("BASE_RPC_URL") ?? "https://mainnet.base.org";
    const client = createPublicClient({ chain: base, transport: http(rpc) });
    const address = wallet as `0x${string}`;
    const [tx, nft] = await Promise.all([
      client.getTransactionCount({ address }),
      client.readContract({
        address: TOKEN.nftAddress as `0x${string}`,
        abi: nftAbi,
        functionName: "balanceOf",
        args: [address],
      }),
    ]);
    return { ok: true as const, tx: Number(tx), nft: Number(nft) };
  } catch {
    return { ok: false as const };
  }
}
