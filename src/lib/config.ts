export const SITE = {
  name: "CABAL",
  token: "$CABAL",
  handle: "Basecable",
  displayName: "Basecabal",
  bio: "Rewarding active on Base chain users",
  chain: "Base",
  profileUrl: "https://x.com/Basecable",
  followUrl: "https://x.com/intent/follow?screen_name=Basecable",
  telegramUrl: "https://t.me/basecabaI",
  telegramHandle: "basecabaI",
  openseaUrl: "https://opensea.io/collection/basecabal-341365337/overview",
} as const;

export const CLAIM = {
  time: "12:00 PM",
  timezone: "UTC+1",
  at: "2026-09-08T12:00:00+01:00",
} as const;

export const LAUNCH = {
  wallets: "200,000",
  days: "3",
  timezone: "UTC+1",
  events: [
    {
      id: "nft",
      label: "NFT launch",
      detail: "OpenSea · FCFS · 5,555",
      time: "3:30 PM",
      at: "2026-09-07T15:30:00+01:00",
    },
    {
      id: "token",
      label: "Token",
      detail: "$CABAL",
      time: "4:00 PM",
      at: "2026-09-07T16:00:00+01:00",
    },
    {
      id: "airdrop",
      label: "Airdrop claim",
      detail: "Email or X · Embedded wallet",
      time: CLAIM.time,
      at: CLAIM.at,
    },
  ],
} as const;

const TOKEN_CA = "0x9230534ac072ff9cda7085d5f2e25336a4651b07";
const NFT_CA = "0xdd0a3db3ba1d3dccb0b67b3c0a3c3ed5c2cc4957";

export const TOKEN = {
  symbol: "$CABAL",
  address: TOKEN_CA,
  dexscreenerUrl: `https://dexscreener.com/base/${TOKEN_CA}`,
  embedUrl: `https://dexscreener.com/base/${TOKEN_CA}?embed=1&loadChartSettings=0&trades=1&tabs=1&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15`,
  basescanUrl: `https://basescan.org/token/${TOKEN_CA}`,
  nftAddress: NFT_CA,
  nftScanUrl: `https://basescan.org/token/${NFT_CA}`,
  perTx: 70,
  perNft: 900,
  exampleTxCount: 10,
  exampleFinal: 700,
  nftSupply: 5_555,
  totalLabel: "100 billion",
  airdropLabel: "70 billion",
  remainderLabel: "30 billion",
  remainderBurnLabel: "10 billion",
  futureLabel: "20 billion",
} as const;

export const PRIVY = {
  appId: (import.meta.env.VITE_PRIVY_APP_ID as string | undefined)?.trim() || "",
} as const;

export const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export function shortAddress(address: string) {
  if (address.length < 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatCabal(n: number) {
  return n.toLocaleString("en-US");
}
