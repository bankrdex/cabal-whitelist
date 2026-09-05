export const SITE = {
  name: "CABAL",
  token: "$CABAL",
  handle: "Basecable",
  displayName: "Basecabal",
  bio: "Rewarding active on Base chain users",
  chain: "Base",
  tweetId: "2095915410789159324",
  profileUrl: "https://x.com/Basecable",
  tweetUrl: "https://x.com/Basecable/status/2095915410789159324",
  followUrl: "https://x.com/intent/follow?screen_name=Basecable",
  likeUrl: "https://x.com/intent/like?tweet_id=2095915410789159324",
  repostUrl: "https://x.com/intent/retweet?tweet_id=2095915410789159324",
  notifyUrl: "https://x.com/Basecable",
  tweetExcerpt:
    "If you have done any NFT or other transactions on Base check your wallet.",
} as const;

export const STORAGE_KEYS = {
  tasks: "cabal-whitelist-tasks",
  submitted: "cabal-whitelist-submitted",
} as const;

export const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;

export type TaskId = "follow" | "like" | "repost" | "notify";

export const TASK_ORDER: TaskId[] = ["follow", "like", "repost", "notify"];

export type TaskState = Record<TaskId, boolean>;

export const EMPTY_TASKS: TaskState = {
  follow: false,
  like: false,
  repost: false,
  notify: false,
};
