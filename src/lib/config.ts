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
} as const;

export const POSTS = [
  {
    id: "check",
    tweetId: "2095915410789159324",
    url: "https://x.com/Basecable/status/2095915410789159324",
    likeUrl: "https://x.com/intent/like?tweet_id=2095915410789159324",
    repostUrl: "https://x.com/intent/retweet?tweet_id=2095915410789159324",
    replyUrl: "https://x.com/intent/tweet?in_reply_to=2095915410789159324",
    excerpt: "If you have done any NFT or other transactions on Base check your wallet.",
    image: "/check-wallets.jpg",
    imageAlt: "Check wallets",
  },
  {
    id: "open",
    tweetId: "2096261402726211734",
    url: "https://x.com/Basecable/status/2096261402726211734",
    likeUrl: "https://x.com/intent/like?tweet_id=2096261402726211734",
    repostUrl: "https://x.com/intent/retweet?tweet_id=2096261402726211734",
    replyUrl: "https://x.com/intent/tweet?in_reply_to=2096261402726211734",
    excerpt:
      "The whitelist is now open. If you are not eligible for the $CABAL airdrop, you have one last chance. Like, RT & turn on notis.",
    image: "/whitelist-open.jpg",
    imageAlt: "Whitelist now open",
  },
] as const;

export const STORAGE_KEYS = {
  tasks: "cabal-whitelist-tasks",
  submitted: "cabal-whitelist-submitted",
} as const;

export const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export type TaskId =
  | "follow"
  | "like"
  | "repost"
  | "notify"
  | "reply"
  | "likeOpen"
  | "repostOpen"
  | "replyOpen";

export const TASK_ORDER: TaskId[] = [
  "follow",
  "like",
  "repost",
  "notify",
  "reply",
  "likeOpen",
  "repostOpen",
  "replyOpen",
];

export type TaskState = Record<TaskId, boolean>;

export const EMPTY_TASKS: TaskState = {
  follow: false,
  like: false,
  repost: false,
  notify: false,
  reply: false,
  likeOpen: false,
  repostOpen: false,
  replyOpen: false,
};
