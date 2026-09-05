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
    excerpt: "If you have done any NFT or other transactions on Base check your wallet.",
    image: "/check-wallets.jpg",
    imageAlt: "Check wallets",
    likeTask: "like" as const,
    repostTask: "repost" as const,
    replyTask: "reply" as const,
  },
  {
    id: "open",
    tweetId: "2096261402726211734",
    url: "https://x.com/Basecable/status/2096261402726211734",
    likeUrl: "https://x.com/intent/like?tweet_id=2096261402726211734",
    repostUrl: "https://x.com/intent/retweet?tweet_id=2096261402726211734",
    excerpt:
      "The whitelist is now open. If you are not eligible for the $CABAL airdrop, you have one last chance. Like, RT & turn on notis.",
    image: "/whitelist-open.jpg",
    imageAlt: "Whitelist now open",
    likeTask: "likeOpen" as const,
    repostTask: "repostOpen" as const,
    replyTask: "replyOpen" as const,
  },
] as const;

export const STORAGE_KEYS = {
  tasks: "cabal-whitelist-tasks",
  submitted: "cabal-whitelist-submitted",
  reply: "cabal-whitelist-replies",
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

const LFG = [
  "lfg",
  "LFG",
  "lfgg",
  "lets go",
  "lets goo",
  "lfg ser",
  "LFG ser",
  "lfg fren",
] as const;

const GOOD = [
  "lfg $CABAL",
  "LFG on Base",
  "locked in",
  "in the cabal",
  "last chance lfg",
  "didn't miss this",
  "whitelist LFG",
  "checked the wallet",
  "on Base lfg",
  "say less",
  "we're early",
  "cabal season",
  "one last run",
  "still time",
  "gm $CABAL",
  "not missing this",
  "already in",
  "count me in",
  "we so back",
  "this the one",
  "don't fade",
  "last call lfg",
  "base natives lfg",
  "in for $CABAL",
  "open the list",
  "checking wallets",
  "one last chance",
  "cabal on Base",
  "we here",
  "spot secured",
  "running it back",
  "natives only",
  "last shot lfg",
  "in before close",
  "won't miss this",
  "wallet checked",
  "onchain lfg",
  "base season",
  "cabal up",
  "lets get it",
  "I'm in",
  "here for $CABAL",
  "don't sleep",
  "early still",
  "last window",
  "back on Base",
  "this is it",
  "never miss",
  "in we go",
  "still early lfg",
] as const;

function randomInt(max: number) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    return crypto.getRandomValues(new Uint32Array(1))[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function composeReply() {
  const useGood = randomInt(10) >= 4;
  const pool = useGood ? GOOD : LFG;
  return pool[randomInt(pool.length)];
}

export function loadAssignedReplies(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reply);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export function assignReply(postId: string, existing: Record<string, string>) {
  if (existing[postId]) return { text: existing[postId], next: existing };
  const text = composeReply();
  const next = { ...existing, [postId]: text };
  try {
    localStorage.setItem(STORAGE_KEYS.reply, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return { text, next };
}

export function replyIntentUrl(tweetId: string, text: string) {
  return `https://x.com/intent/tweet?in_reply_to=${tweetId}&text=${encodeURIComponent(text)}`;
}
