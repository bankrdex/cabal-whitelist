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
} as const;

export const LAUNCH = {
  wallets: "200,000",
  days: "3",
  timezone: "UTC+1",
  events: [
    {
      id: "nft",
      label: "NFT launch",
      detail: "FCFS",
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

export const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

