import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomCursor } from "@/components/cursor";
import { LAUNCH, SITE } from "@/lib/config";
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

function TelegramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
      />
    </svg>
  );
}

type EventStatus = "live" | "next" | "soon" | "done";

function eventStatus(at: string, now: number, events: readonly { at: string }[]): EventStatus {
  const start = new Date(at).getTime();
  const idx = events.findIndex((e) => e.at === at);
  const nextStart = idx < events.length - 1 ? new Date(events[idx + 1].at).getTime() : start + 30 * 60 * 1000;
  if (now >= nextStart) return "done";
  if (now >= start) return "live";
  const upcoming = events.filter((e) => new Date(e.at).getTime() > now);
  if (upcoming[0]?.at === at) return "next";
  return "soon";
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function remaining(to: number, now: number) {
  const ms = Math.max(0, to - now);
  const total = Math.floor(ms / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
    done: ms <= 0,
  };
}

export function WhitelistApp() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const nextEvent = useMemo(() => {
    return LAUNCH.events.find((e) => new Date(e.at).getTime() > now) ?? null;
  }, [now]);

  const clock = nextEvent ? remaining(new Date(nextEvent.at).getTime(), now) : null;

  const shareUrl = useMemo(() => {
    const text = `Thank you CABAL. ${LAUNCH.wallets} wallets in ${LAUNCH.days} days.\n\nNFT ${LAUNCH.events[0].time} ${LAUNCH.timezone} FCFS\nToken ${LAUNCH.events[1].time}\nAirdrop ${LAUNCH.events[2].time}\n\n@${SITE.handle}`;
    return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  }, []);

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
            {SITE.chain} · Launch day
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-wide text-fg sm:text-5xl">
            THANK YOU
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted">
            For every follow, every reply, every wallet. The support you showed us is why this
            happened. Without you we would not have achieved what we achieved.
          </p>
        </section>

        <section
          className="stagger-in rounded-xl bg-surface p-5 text-center shadow-[var(--shadow-border)]"
          style={{ animationDelay: "90ms" }}
        >
          <p className="font-display text-5xl font-semibold tracking-wide text-primary tabular-nums">
            {LAUNCH.wallets}
          </p>
          <p className="mt-2 text-sm font-medium text-fg">wallets in {LAUNCH.days} days</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Now it is our turn. Get ready for the NFT and the token — today.
          </p>
        </section>

        {clock && nextEvent && !clock.done && (
          <section
            className="stagger-in rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
            style={{ animationDelay: "130ms" }}
          >
            <p className="text-center text-xs font-medium tracking-wide text-muted">
              Next · {nextEvent.label}
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { v: clock.h, l: "hrs" },
                { v: clock.m, l: "min" },
                { v: clock.s, l: "sec" },
              ].map((unit) => (
                <div
                  key={unit.l}
                  className="rounded-lg bg-surface-2 py-3 text-center shadow-[var(--shadow-border)]"
                >
                  <p className="font-display text-3xl font-semibold tabular-nums text-fg">
                    {pad(unit.v)}
                  </p>
                  <p className="mt-1 text-xs text-muted">{unit.l}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          {LAUNCH.events.map((event, i) => {
            const status = eventStatus(event.at, now, LAUNCH.events);
            return (
              <article
                key={event.id}
                className={cn(
                  "stagger-in flex items-center gap-4 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]",
                  status === "done" && "opacity-70",
                )}
                style={{ animationDelay: `${180 + i * 50}ms` }}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-display text-sm font-semibold text-primary shadow-[var(--shadow-border)]">
                  {status === "done" ? <Check className="size-5 text-success" /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold tracking-wide text-fg">
                      {event.label}
                    </h2>
                    <StatusChip status={status} />
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{event.detail}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-medium tabular-nums text-fg">{event.time}</p>
                  <p className="text-xs text-muted">{LAUNCH.timezone}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section
          className="stagger-in rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
          style={{ animationDelay: "340ms" }}
        >
          <p className="text-sm leading-relaxed text-muted">
            Stay close. NFT is FCFS at 3:30 PM {LAUNCH.timezone}. Token follows at 4:00 PM. Airdrop
            hits whitelisted wallets at 7:00 PM.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild size="full">
              <a href={SITE.telegramUrl} target="_blank" rel="noreferrer">
                <TelegramMark className="size-4" />
                Join Telegram for the drop
              </a>
            </Button>
            <Button asChild variant="outline" size="full">
              <a href={shareUrl} target="_blank" rel="noreferrer">
                <XMark className="size-3.5" />
                Tell them you were here
              </a>
            </Button>
          </div>
        </section>

        <p
          className="stagger-in text-center text-xs leading-relaxed text-muted"
          style={{ animationDelay: "380ms" }}
        >
          Official @{SITE.handle} · {SITE.token} on {SITE.chain}. DYOR. Not financial advice.
        </p>
      </main>
    </div>
  );
}

function StatusChip({ status }: { status: EventStatus }) {
  const label =
    status === "live" ? "Live" : status === "next" ? "Next" : status === "done" ? "Done" : "Soon";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        status === "live" && "bg-primary text-primary-fg",
        status === "next" && "bg-surface-2 text-primary shadow-[var(--shadow-border)]",
        status === "soon" && "bg-surface-2 text-muted shadow-[var(--shadow-border)]",
        status === "done" && "bg-surface-2 text-muted shadow-[var(--shadow-border)]",
      )}
    >
      {label}
    </span>
  );
}
