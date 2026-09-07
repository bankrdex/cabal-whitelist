export const SITE = {
  name: "CABAL",
  token: "$CABAL",
  handle: "Basecable",
  displayName: "Basecabal",
  bio: "Rewarding active on Base chain users",
  chain: "Base",
  profileUrl: "https://x.com/Basecable",
  followUrl: "https://x.com/intent/follow?screen_name=Basecable",
  notifyUrl: "https://x.com/Basecable",
  telegramUrl: "https://t.me/basecabaI",
  telegramHandle: "basecabaI",
  openseaUrl: "https://opensea.io/collection/basecabal-341365337/overview",
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
      label: "Airdrop distribution",
      detail: "Whitelisted wallets",
      time: "7:00 PM",
      at: "2026-09-07T19:00:00+01:00",
    },
  ],
} as const;

const CA = "0x9230534ac072ff9cda7085d5f2e25336a4651b07";

export const TOKEN = {
  symbol: "$CABAL",
  address: CA,
  dexscreenerUrl: `https://dexscreener.com/base/${CA}`,
  embedUrl: `https://dexscreener.com/base/${CA}?embed=1&loadChartSettings=0&trades=1&tabs=1&info=0&chartLeftToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15`,
  basescanUrl: `https://basescan.org/token/${CA}`,
  totalSupply: 100_000_000_000,
  totalLabel: "100 billion",
  airdrop: 70_000_000_000,
  airdropLabel: "70 billion",
  nftPool: 5_000_000_000,
  nftPoolLabel: "5 billion",
  basePool: 65_000_000_000,
  basePoolLabel: "65 billion",
  remainder: 30_000_000_000,
  remainderLabel: "30 billion",
  remainderBurn: 10_000_000_000,
  remainderBurnLabel: "10 billion",
  futureReserve: 20_000_000_000,
  futureLabel: "20 billion",
  perTx: 70,
  exampleTxCount: 10,
  exampleFinal: 700,
  perNft: 900_090,
  nftSupply: 5_555,
  team: 0,
} as const;

export const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;
