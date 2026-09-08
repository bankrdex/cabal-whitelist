import eligibleText from "../data/eligible-wallets.txt?raw";

const ZERO = "0x0000000000000000000000000000000000000000";

let cache: Set<string> | null = null;

export function eligibleSet() {
  if (cache) return cache;
  const set = new Set<string>();
  for (const line of eligibleText.split(/\r?\n/)) {
    const wallet = line.trim().toLowerCase();
    if (wallet.length === 42 && wallet.startsWith("0x") && wallet !== ZERO) {
      set.add(wallet);
    }
  }
  cache = set;
  return set;
}

export function isEligibleWallet(wallet: string) {
  return eligibleSet().has(wallet.trim().toLowerCase());
}

export function eligibleCount() {
  return eligibleSet().size;
}
