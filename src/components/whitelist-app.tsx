import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  Heart,
  Lock,
  Repeat2,
  UserPlus,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomCursor } from "@/components/cursor";
import {
  EMPTY_TASKS,
  POSTS,
  SITE,
  STORAGE_KEYS,
  TASK_ORDER,
  WALLET_RE,
  type TaskId,
  type TaskState,
} from "@/lib/config";
import { cn } from "@/lib/utils";

function XMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

function loadTasks(): TaskState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tasks);
    if (!raw) return { ...EMPTY_TASKS };
    return { ...EMPTY_TASKS, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_TASKS };
  }
}

function persistTasks(next: TaskState) {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(next));
}

export function WhitelistApp() {
  const [tasks, setTasks] = useState<TaskState>(EMPTY_TASKS);
  const [wallet, setWallet] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.submitted);
      if (saved) setSubmitted(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const completedCount = TASK_ORDER.filter((id) => tasks[id]).length;
  const unlocked = completedCount === TASK_ORDER.length;
  const walletValid = WALLET_RE.test(wallet.trim());

  function complete(id: TaskId) {
    setTasks((prev) => {
      if (prev[id]) return prev;
      const next = { ...prev, [id]: true };
      persistTasks(next);
      const done = TASK_ORDER.every((key) => next[key]);
      if (done) toast.success("Tasks complete. Wallet unlocked.");
      return next;
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!unlocked || submitting) return;
    const value = wallet.trim();
    if (!WALLET_RE.test(value)) {
      setError("Enter a valid Base wallet (0x… 42 characters).");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: value }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Unable to register wallet. Please try again.");
      }
      localStorage.setItem(STORAGE_KEYS.submitted, value);
      setSubmitted(value);
      toast.success("You're on the list.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register wallet. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const shareUrl = useMemo(() => {
    const text = `I secured my $CABAL whitelist spot on Base.\n\n@${SITE.handle}`;
    return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  }, []);

  const post1 = POSTS[0];
  const post2 = POSTS[1];
  const post1Done = tasks.like && tasks.repost && tasks.notify;
  const post2Done = tasks.likeOpen && tasks.repostOpen;

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <CustomCursor />
      <div className="pointer-events-none fixed inset-0 -z-10">
        <img
          src="/city-bg.jpg"
          alt=""
          className="size-full object-cover opacity-45 outline outline-1 -outline-offset-1 outline-fg/10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/75 via-bg/88 to-bg" />
      </div>

      <header className="mx-auto flex w-full max-w-lg items-center justify-between px-4 pt-5 pb-2">
        <a href={SITE.profileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5">
          <img
            src="/cabal-avatar.jpg"
            alt=""
            className="size-9 rounded-md outline outline-1 -outline-offset-1 outline-fg/15"
          />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold tracking-wide text-fg">{SITE.token}</p>
            <p className="text-xs text-muted">@{SITE.handle}</p>
          </div>
        </a>
        <a
          href={SITE.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-surface-2 px-3 text-sm font-medium text-fg shadow-[var(--shadow-border)] transition-[box-shadow,background-color] duration-150 hover:shadow-[var(--shadow-border-hover)]"
        >
          <XMark className="size-3.5" />
          Official
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-col gap-5 px-4 pt-4 pb-16">
        <section className="stagger-in text-center" style={{ animationDelay: "40ms" }}>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium tracking-wide text-muted shadow-[var(--shadow-border)]">
            <span className="size-1.5 rounded-full bg-primary" />
            {SITE.chain} · Whitelist open
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-wide text-fg sm:text-5xl">
            CABAL WHITELIST
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            {SITE.bio}. Follow, like & repost both posts, and turn on notifications — then submit your Base wallet.
          </p>
          <p className="mt-3 font-mono text-xs tabular-nums text-muted">
            {completedCount}/{TASK_ORDER.length} tasks complete
          </p>
        </section>

        {submitted ? (
          <SuccessCard wallet={submitted} shareUrl={shareUrl} />
        ) : (
          <>
            <StepCard
              index={1}
              delay="80ms"
              done={tasks.follow}
              title="Follow CABAL on X"
              body="Follow the official account to verify you're in the cabal."
            >
              <Button asChild variant={tasks.follow ? "outline" : "primary"} size="full">
                <a
                  href={SITE.followUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => complete("follow")}
                >
                  {tasks.follow ? <Check /> : <UserPlus />}
                  {tasks.follow ? "Following" : "Follow @Basecable"}
                </a>
              </Button>
            </StepCard>

            <StepCard
              index={2}
              delay="140ms"
              done={post1Done}
              title="Like, RT & turn on notifications"
              body="Engage with this post on X, then tap the bell on the profile."
            >
              <TweetPreview excerpt={post1.excerpt} image={post1.image} imageAlt={post1.imageAlt} />
              <div className="grid grid-cols-3 gap-2">
                <TaskAction
                  done={tasks.like}
                  label="Like"
                  doneLabel="Liked"
                  icon={Heart}
                  href={post1.likeUrl}
                  onComplete={() => complete("like")}
                />
                <TaskAction
                  done={tasks.repost}
                  label="Repost"
                  doneLabel="Reposted"
                  icon={Repeat2}
                  href={post1.repostUrl}
                  onComplete={() => complete("repost")}
                />
                <TaskAction
                  done={tasks.notify}
                  label="Notify"
                  doneLabel="Bell on"
                  icon={Bell}
                  href={SITE.notifyUrl}
                  onComplete={() => complete("notify")}
                />
              </div>
              <p className="text-xs text-muted">
                Notifications: open the profile and tap the bell icon.
              </p>
            </StepCard>

            <StepCard
              index={3}
              delay="180ms"
              done={post2Done}
              title="Like & RT the whitelist post"
              body="Engage with the latest @Basecable post to stay eligible."
            >
              <TweetPreview excerpt={post2.excerpt} image={post2.image} imageAlt={post2.imageAlt} />
              <div className="grid grid-cols-2 gap-2">
                <TaskAction
                  done={tasks.likeOpen}
                  label="Like"
                  doneLabel="Liked"
                  icon={Heart}
                  href={post2.likeUrl}
                  onComplete={() => complete("likeOpen")}
                />
                <TaskAction
                  done={tasks.repostOpen}
                  label="Repost"
                  doneLabel="Reposted"
                  icon={Repeat2}
                  href={post2.repostUrl}
                  onComplete={() => complete("repostOpen")}
                />
              </div>
            </StepCard>

            <StepCard
              index={4}
              delay="220ms"
              done={Boolean(submitted)}
              locked={!unlocked}
              title="Enter Base wallet"
              body="Submit your Base address to claim your whitelist spot."
            >
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <label className="text-xs font-medium text-muted" htmlFor="wallet">
                  Base wallet address
                </label>
                <div className="relative">
                  <Input
                    id="wallet"
                    name="wallet"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="0x…"
                    value={wallet}
                    disabled={!unlocked || submitting}
                    onChange={(e) => {
                      setWallet(e.target.value);
                      if (error) setError(null);
                    }}
                    aria-invalid={Boolean(error)}
                  />
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-surface/80">
                      <span className="inline-flex items-center gap-1.5 px-2 text-center text-xs font-medium text-fg">
                        <Lock className="size-3.5 shrink-0" />
                        Locked — complete tasks 1–3
                      </span>
                    </div>
                  )}
                </div>
                {error && <p className="text-xs text-danger">{error}</p>}
                <Button
                  type="submit"
                  variant={!unlocked ? "locked" : "primary"}
                  size="full"
                  disabled={!unlocked || submitting || !walletValid}
                >
                  {submitting ? (
                    "Submitting…"
                  ) : (
                    <>
                      <Wallet />
                      Submit whitelist registration
                      <ArrowRight />
                    </>
                  )}
                </Button>
              </form>
            </StepCard>
          </>
        )}

        <p className="stagger-in text-center text-xs leading-relaxed text-muted" style={{ animationDelay: "260ms" }}>
          Official @{SITE.handle} whitelist. Wallets are collected for {SITE.token} allocation on{" "}
          {SITE.chain}. DYOR. Not financial advice.
        </p>
      </main>
    </div>
  );
}

function TweetPreview({
  excerpt,
  image,
  imageAlt,
}: {
  excerpt: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <article className="overflow-hidden rounded-lg bg-bg shadow-[var(--shadow-border)]">
      <div className="flex items-center gap-2.5 px-3 pt-3">
        <img
          src="/cabal-avatar.jpg"
          alt=""
          className="size-8 rounded-md outline outline-1 -outline-offset-1 outline-fg/15"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-medium text-fg">{SITE.displayName}</p>
          <p className="text-xs text-muted">@{SITE.handle}</p>
        </div>
      </div>
      <p className="px-3 pt-2 pb-2 text-sm leading-relaxed text-fg/90">{excerpt}</p>
      <img
        src={image}
        alt={imageAlt}
        className="aspect-[2/1] w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
      />
    </article>
  );
}

function StepCard({
  index,
  title,
  body,
  children,
  done,
  locked,
  delay,
}: {
  index: number;
  title: string;
  body: string;
  children: ReactNode;
  done?: boolean;
  locked?: boolean;
  delay?: string;
}) {
  return (
    <section
      className={cn(
        "stagger-in rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
        locked && "opacity-80",
      )}
      style={{ animationDelay: delay }}
    >
      <div className="mb-3 flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md font-display text-sm font-semibold",
            done ? "bg-primary text-primary-fg" : "bg-surface-2 text-fg shadow-[var(--shadow-border)]",
          )}
        >
          {done ? <Check className="size-4" /> : index}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-wide text-fg">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function TaskAction({
  done,
  label,
  doneLabel,
  icon: Icon,
  href,
  onComplete,
}: {
  done: boolean;
  label: string;
  doneLabel: string;
  icon: typeof Heart;
  href: string;
  onComplete: () => void;
}) {
  return (
    <Button asChild variant={done ? "outline" : "primary"} size="sm" className="w-full">
      <a href={href} target="_blank" rel="noreferrer" onClick={onComplete}>
        {done ? <Check /> : <Icon />}
        {done ? doneLabel : label}
      </a>
    </Button>
  );
}

function SuccessCard({ wallet, shareUrl }: { wallet: string; shareUrl: string }) {
  const short = `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
  const latest = POSTS[POSTS.length - 1];
  return (
    <section className="stagger-in rounded-xl bg-surface p-5 text-center shadow-[var(--shadow-border)]">
      <span className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary text-primary-fg">
        <Check className="size-6" />
      </span>
      <h2 className="font-display text-2xl font-semibold tracking-wide text-fg">You're on the list</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Wallet registered for the {SITE.token} whitelist on {SITE.chain}.
      </p>
      <p className="mt-3 font-mono text-sm text-primary">{short}</p>
      <div className="mt-5 flex flex-col gap-2">
        <Button asChild size="full">
          <a href={shareUrl} target="_blank" rel="noreferrer">
            <XMark className="size-3.5" />
            Announce your spot
          </a>
        </Button>
        <Button asChild variant="outline" size="full">
          <a href={latest.url} target="_blank" rel="noreferrer">
            View the post
          </a>
        </Button>
      </div>
    </section>
  );
}
