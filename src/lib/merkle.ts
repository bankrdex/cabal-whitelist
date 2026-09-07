import { encodePacked, getAddress, keccak256, type Hex } from "viem";

export function allocationLeaf(wallet: string, amount: bigint): Hex {
  return keccak256(
    encodePacked(["address", "uint256"], [getAddress(wallet), amount]),
  );
}

function hashPair(a: Hex, b: Hex): Hex {
  return BigInt(a) <= BigInt(b)
    ? keccak256(encodePacked(["bytes32", "bytes32"], [a, b]))
    : keccak256(encodePacked(["bytes32", "bytes32"], [b, a]));
}

export function buildMerkle(leaves: Hex[]): { root: Hex; layers: Hex[][] } {
  if (leaves.length === 0) {
    return { root: `0x${"00".repeat(32)}`, layers: [] };
  }
  const layers: Hex[][] = [leaves];
  let layer = leaves;
  while (layer.length > 1) {
    const next: Hex[] = [];
    for (let i = 0; i < layer.length; i += 2) {
      const a = layer[i]!;
      const b = i + 1 < layer.length ? layer[i + 1]! : a;
      next.push(hashPair(a, b));
    }
    layers.push(next);
    layer = next;
  }
  return { root: layer[0]!, layers };
}

export function merkleProof(layers: Hex[][], index: number): Hex[] {
  const proof: Hex[] = [];
  let i = index;
  for (let l = 0; l < layers.length - 1; l += 1) {
    const layer = layers[l]!;
    const pair = i ^ 1;
    proof.push(pair < layer.length ? layer[pair]! : layer[i]!);
    i = Math.floor(i / 2);
  }
  return proof;
}
